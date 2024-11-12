import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import {Account, NameRegistered, OwnershipTransferred, NameRenewed, Subname} from './model'
import {Block, CONTRACT_ADDRESS, Context, Log, Transaction, processor} from './processor'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    let ownershipTransferredList: OwnershipTransferredEvent[] = []
    let nameRenewedList: NameRenewedEvent[] = []

    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && log.topics[0].toLowerCase() === controller.events.NameRegistered.topic.toLowerCase()) {
                nameRegisteredList.push(getNameRegistered(ctx, log))
            } else if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && log.topics[0].toLowerCase() === controller.events.OwnershipTransferred.topic.toLowerCase()) {
                ownershipTransferredList.push(getOwnershipTransferred(ctx, log))
            } else if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && log.topics[0].toLowerCase() === controller.events.NameRenewed.topic.toLowerCase()) {
                nameRenewedList.push(getNameRenewed(ctx, log))
            }
        }
    }

    await Promise.all([
        processNameRegistered(ctx, nameRegisteredList),
        processOwnershipTransferred(ctx, ownershipTransferredList),
        processNameRenewed(ctx, nameRenewedList),
    ])
})

interface NameRegisteredEvent {
    id: string
    block: Block
    transaction: Transaction
    name: string
    label: string
    owner: string
    expires: bigint
}

interface OwnershipTransferredEvent {
    id: string
    block: Block
    transaction: Transaction
    oldOwner: string
    newOwner: string
}

interface NameRenewedEvent {
    id: string
    block: Block
    transaction: Transaction
    name: string
    label: string
    expires: bigint
}

function getNameRegistered(ctx: Context, log: Log): NameRegisteredEvent {
    let event = controller.events.NameRegistered.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Name registered ${event.name}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        name: event.name,
        label: event.label,
        owner: event.owner,
        expires: event.expires,
    }
}

async function processNameRegistered(ctx: Context, nameRegisteredData: NameRegisteredEvent[]) {
    let accountIds = new Set<string>()
    for (let t of nameRegisteredData) {
        accountIds.add(t.owner)
    }

    let accounts = await ctx.store
        .findBy(Account, {id: In([...accountIds])})
        .then((q) => new Map(q.map((i) => [i.id, i])))

    let nameRegisteredList: NameRegistered[] = []
    let subnameList: Subname[] = []

    for (let t of nameRegisteredData) {
        let {id, block, transaction, name, label, owner, expires} = t

        let account = getAccount(accounts, owner)

        let labelBytes = Buffer.from(label.replace('0x', ''), 'hex')
        nameRegisteredList.push(
            new NameRegistered({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                name,
                label: labelBytes,
                owner: account,
                expires,
            })
        )

        subnameList.push(
            new Subname({
                id,
                name,
                label: labelBytes,
                owner: account,
                expires,
            })
        )
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.insert(nameRegisteredList)
    await ctx.store.insert(subnameList)
}

function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}

function getOwnershipTransferred(ctx: Context, log: Log): OwnershipTransferredEvent {
    let event = controller.events.OwnershipTransferred.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        oldOwner: event.oldOwner,
        newOwner: event.newOwner,
    }
}

async function processOwnershipTransferred(ctx: Context, ownershipTransferredData: OwnershipTransferredEvent[]) {
    let accountIds = new Set<string>()
    for (let t of ownershipTransferredData) {
        if (!accountIds.has(t.oldOwner)) accountIds.add(t.oldOwner)
        if (!accountIds.has(t.newOwner)) accountIds.add(t.newOwner)
    }

    let accounts = await ctx.store
        .findBy(Account, {id: In([...accountIds])})
        .then((q) => new Map(q.map((i) => [i.id, i])))

    let ownershipTransferredList: OwnershipTransferred[] = []

    for (let t of ownershipTransferredData) {
        let {id, block, transaction, oldOwner, newOwner} = t

        let oldAccount = getAccount(accounts, oldOwner)
        let newAccount = getAccount(accounts, newOwner)

        ownershipTransferredList.push(
            new OwnershipTransferred({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                oldOwner: oldAccount,
                newOwner: newAccount,
            })
        )
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.insert(ownershipTransferredList)

    for (let t of ownershipTransferredData) {
        let {oldOwner, newOwner} = t

        // Update subname owner. query subname first
        let subname = await ctx.store.findOne(Subname, {where: {owner: {id: oldOwner}}})
        if (subname) {
            subname.owner = getAccount(accounts, newOwner)
            await ctx.store.upsert(subname)
        }
    }
}

function getNameRenewed(ctx: Context, log: Log): NameRenewedEvent {
    let event = controller.events.NameRenewed.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        name: event.name,
        label: event.label,
        expires: event.expires,
    }
}

async function processNameRenewed(ctx: Context, nameRenewedData: NameRenewedEvent[]) {
    let nameRenewedList: NameRenewed[] = []

    for (let t of nameRenewedData) {
        let {id, block, transaction, name, label, expires} = t

        nameRenewedList.push(
            new NameRenewed({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                name,
                label: Buffer.from(label.replace('0x', ''), 'hex'),
                expires,
            })
        )

        // Update subname expires
        let subname = await ctx.store.findOne(Subname, {where: {name}})
        if (subname) {
            subname.expires = expires
            await ctx.store.upsert(subname)
        }
    }

    await ctx.store.insert(nameRenewedList)
}
