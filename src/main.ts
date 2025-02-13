import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import * as registrar from './abi/BaseRegistrar'
import * as l2Resolver from './abi/L2Resolver'
import {Account, NameRegistered, Transfer, NameRenewed, Subname, AddressChanged} from './model'
import {Block, CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, L2_RESOLVER_ADDRESS, Context, Log, Transaction, processor} from './processor'
import { ethers, keccak256 } from "ethers";
import hexAddress from "./sha3";
import { keccak256 as viemKeccak256, encodePacked } from "viem"

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    let transferList: TransferEvent[] = []
    let nameRenewedList: NameRenewedEvent[] = []
    let addressChangedList: AddressChangedEvent[] = []
    // let nameChangedList: NameChangedEvent[] = []

    const nameRegisteredTopic = controller.events.NameRegistered.topic.toLowerCase()
    const nameRenewedTopic = controller.events.NameRenewed.topic.toLowerCase()
    const transferTopic = registrar.events.Transfer.topic.toLowerCase()
    const addressChangedTopic = l2Resolver.events.AddressChanged.topic.toLowerCase()
    const nameChangedTopic = l2Resolver.events.NameChanged.topic.toLowerCase()

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
            } else if (address == L2_RESOLVER_ADDRESS) {
                if (topic0 === addressChangedTopic) {
                    const addressChanged = getAddressChanged(ctx, log)
                    addressChangedList.push(addressChanged)
                } else if (topic0 === nameChangedTopic) {
                    // const nameChanged = getNameChanged(ctx, log)
                    console.log("nameChanged")
                }
            }
        }
    }

    await Promise.all([
        processNameRegistered(ctx, nameRegisteredList),
        processTransfer(ctx, transferList),
        processNameRenewed(ctx, nameRenewedList),
        processAddressChanged(ctx, addressChangedList),
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

interface AddressChangedEvent {
    id: string
    block: Block
    transaction: Transaction
    node: string
    coinType: bigint
    newAddress: string
}

function getAddressChanged(ctx: Context, log: Log): AddressChangedEvent {
    let event = l2Resolver.events.AddressChanged.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Address changed ${event.node} to ${event.newAddress}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        node: event.node,
        coinType: event.coinType,
        newAddress: event.newAddress,
    }
}

async function processAddressChanged(ctx: Context, addressChangedData: AddressChangedEvent[]) {
    let accountIds = new Set<string>()
    for (let t of addressChangedData) {
        accountIds.add(t.newAddress)
    }

    let accounts = await ctx.store
        .findBy(Account, {id: In([...accountIds])})
        .then((q) => new Map(q.map((i) => [i.id, i])))

    let addressChangedList: AddressChanged[] = []

    for (let t of addressChangedData) {
        let {id, block, transaction, node, coinType, newAddress} = t

        const nodeBytes = Buffer.from(node.replace('0x', ''), 'hex')
        addressChangedList.push(
            new AddressChanged({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                node: nodeBytes,
                coinType,
                newAddress,
            })
        )

        // Update subname resolvedTo
        let account = getAccount(accounts, newAddress.substring(0, 42))
        let subname = await ctx.store.findOne(Subname, {where: {node: nodeBytes}})
        if (subname) {
            subname.resolvedTo = account
            await ctx.store.upsert(subname)
        } else {
            throw new Error(`Subname not found for node ${node}`)
        }
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.upsert(addressChangedList)
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

        const node = ethers.namehash(`${name}.darwinia.eth`)
        const nodeBytes = Buffer.from(node.replace('0x', ''), 'hex')
        subnameList.push(
            new Subname({
                id,
                tokenId,
                name,
                label: labelBytes,
                node: nodeBytes,
                owner: account,
                expires
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
        let node = viemKeccak256(
          encodePacked(
            ["bytes32", "bytes32"],
            [
              "0x8b4150cc3554db98a2f60cb8c5a4cc48659d17a536ff9fe540be66d3307ee7a7",
              hexAddress(id),
            ],
          ),
        )
        let nodeBytes = Buffer.from(node.replace('0x', ''), 'hex')
        acc.node = nodeBytes
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
