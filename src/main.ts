import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import * as registrar from './abi/BaseRegistrar'
import {Account, NameRegistered, Transfer, NameRenewed, Subname} from './model'
import {Block, CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, Context, Log, Transaction, processor} from './processor'
import { ethers, keccak256 } from "ethers";

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    let transferList: TransferEvent[] = []
    let nameRenewedList: NameRenewedEvent[] = []

    const nameRegisteredTopic = controller.events.NameRegistered.topic.toLowerCase()
    const nameRenewedTopic = controller.events.NameRenewed.topic.toLowerCase()
    const transferTopic = registrar.events.Transfer.topic.toLowerCase()

    for (let block of ctx.blocks) {
        // console.log(`Processing block ${block.header.height}`)
        for (let log of block.logs) {
            const address = log.address.toLowerCase()
            const topic0 = log.topics[0].toLowerCase()

            if (address == CONTROLLER_ADDRESS) {
                if (topic0 === nameRegisteredTopic) {
                    nameRegisteredList.push(getNameRegistered(ctx, log))
                } else if (topic0 === nameRenewedTopic) {
                    nameRenewedList.push(getNameRenewed(ctx, log))
                }
            } else if (address == REGISTRAR_ADDRESS) {
                if (topic0 === transferTopic) {
                    const transfer = getTransfer(ctx, log)
                    if (transfer.from != "0x0000000000000000000000000000000000000000") {
                        transferList.push(transfer)
                    }
                }
            }
        }
    }

    await Promise.all([
        processNameRegistered(ctx, nameRegisteredList),
        processTransfer(ctx, transferList),
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

interface TransferEvent {
    id: string
    block: Block
    transaction: Transaction
    from: string
    to: string
    tokenId: bigint
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
        let tokenId = BigInt(keccak256(ethers.toUtf8Bytes(name)))

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
                tokenId,
                name,
                label: labelBytes,
                owner: account,
                expires,
            })
        )
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.upsert(nameRegisteredList)
    await ctx.store.upsert(subnameList)
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

function getTransfer(ctx: Context, log: Log): TransferEvent {
    let event = registrar.events.Transfer.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        from: event.from,
        to: event.to,
        tokenId: event.id,
    }
}

async function processTransfer(ctx: Context, transferData: TransferEvent[]) {
    let accountIds = new Set<string>()
    for (let t of transferData) {
        if (!accountIds.has(t.from)) accountIds.add(t.from)
        if (!accountIds.has(t.to)) accountIds.add(t.to)
    }

    let accounts = await ctx.store
        .findBy(Account, {id: In([...accountIds])})
        .then((q) => new Map(q.map((i) => [i.id, i])))

    let transferList: Transfer[] = []

    for (let t of transferData) {
        let {id, block, transaction, from, to, tokenId} = t

        let fromAccount = getAccount(accounts, from)
        let toAccount = getAccount(accounts, to)

        transferList.push(
            new Transfer({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                from: fromAccount,
                to: toAccount,
                tokenId,
            })
        )
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.upsert(transferList)

    for (let t of transferData) {
        let {from, to, tokenId} = t

        // Update subname owner. query subname first
        let subname = await ctx.store.findOne(Subname, {where: {tokenId: tokenId}})
        if (subname) {
            subname.owner = getAccount(accounts, to)
            await ctx.store.upsert(subname)
        } else {
            throw new Error(`Subname not found for tokenId ${tokenId}`)
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

    await ctx.store.upsert(nameRenewedList)
}
