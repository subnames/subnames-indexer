import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import * as registrar from './abi/BaseRegistrar'
import * as l2Resolver from './abi/L2Resolver'
import {Account, NameRegistered, Transfer, NameRenewed, Subname, AddressChanged, NameChanged} from './model'
import {Block, CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, L2_RESOLVER_ADDRESS, Context, Log, Transaction, processor} from './processor'
import { ethers, keccak256 } from "ethers";
import hexAddress from "./sha3";
import { keccak256 as viemKeccak256, encodePacked } from "viem"
import { Console } from 'console'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    let transferList: TransferEvent[] = []
    let nameRenewedList: NameRenewedEvent[] = []
    let addressChangedList: AddressChangedEvent[] = []
    let nameChangedList: NameChangedEvent[] = []

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
                    const nameChanged = getNameChanged(ctx, log)
                    nameChangedList.push(nameChanged)
                }
            }
        }
    }

    await processNameRegistered(ctx, nameRegisteredList)
    await processNameRenewed(ctx, nameRenewedList)
    await processTransfer(ctx, transferList)
    await processAddressChanged(ctx, addressChangedList)
    await processNameChanged(ctx, nameChangedList)
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

interface NameChangedEvent {
    id: string
    block: Block
    transaction: Transaction
    node: string
    name: string
}

function getNameChanged(ctx: Context, log: Log): NameChangedEvent {
    let event = l2Resolver.events.NameChanged.decode(log)

    let transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Name changed ${event.node} to ${event.name}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        node: event.node,
        name: event.name,
    }
}

async function processNameChanged(ctx: Context, nameChangedData: NameChangedEvent[]) {
    if (nameChangedData.length > 0) console.log("processNameChanged")
    let nameChangedList: NameChanged[] = []

    for (let t of nameChangedData) {
        let {id, block, transaction, node, name} = t

        const nodeBytes = Buffer.from(node.replace('0x', ''), 'hex')
        nameChangedList.push(
            new NameChanged({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                node: nodeBytes,
                name: name,
            })
        )

        // find account by reverse node
        const account = await getAccount(ctx, transaction.from)
        console.log("processNameChanged: account =", account.id)
        if (!account) {
            throw new Error(`processNameChanged: Account not found for reverse node ${nodeBytes}`)
        }

        let newName = name.split('.')[0]
        console.log("processNameChanged: name =", newName)
        console.log("processNameChanged: account.primarySubname =", account.primarySubname?.name)
        if (account.primarySubname && newName == account.primarySubname.name) {
            // clear primarySubname for `from` account.
            console.log("processNameChanged: ----")
            // find last subname in AddressChanged events
            let lastAddressChanged = (await ctx.store.find(AddressChanged, {
                order: { timestamp: 'DESC' },
                take: 1
            }))[0]
            let oldSubname = await ctx.store.findOneOrFail(Subname, {where: {node: lastAddressChanged.node}})
            oldSubname.reverseResolvedFrom = null
            await ctx.store.upsert(oldSubname)
            await ctx.store.upsert(account)
        } else {
            let subname = await ctx.store.findOne(Subname, {where: {name: newName}})
            if (subname) {
                subname.reverseResolvedFrom = account
                account.primarySubname = subname
                await ctx.store.upsert(subname)
                await ctx.store.upsert(account)
            }
        }
    }

    await ctx.store.upsert(nameChangedList)
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
    if (addressChangedData.length > 0) console.log("processAddressChanged")
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
        let account = await getAccount(ctx, newAddress.substring(0, 42))
        console.log("processAddressChanged: account =", account)
        let subname = await ctx.store.findOne(Subname, {where: {node: nodeBytes}})
        if (subname) {
            console.log("update resolvedTo of subname")
            subname.resolvedTo = account
            await ctx.store.upsert(subname)
        } else {
           console.log(`Subname not found for node ${node}, skipping...`)
        }
    }

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
    let nameRegisteredList: NameRegistered[] = []
    let subnameList: Subname[] = []

    for (let t of nameRegisteredData) {
        let {id, block, transaction, name, label, owner, expires} = t
        let tokenId = BigInt(keccak256(ethers.toUtf8Bytes(name)))

        let account = await getAccount(ctx, owner)

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
                expires,
                resolvedTo: account,
                reverseResolvedFrom: account,
            })
        )
    }

    await ctx.store.upsert(nameRegisteredList)
    await ctx.store.upsert(subnameList)
}

function calcReverseNode(address: string) {
    let node = viemKeccak256(
        encodePacked(
        ["bytes32", "bytes32"],
        [
            "0x8b4150cc3554db98a2f60cb8c5a4cc48659d17a536ff9fe540be66d3307ee7a7",
            hexAddress(address),
        ],
        ),
    )
    return Buffer.from(node.replace('0x', ''), 'hex')
}

async function getAccount(ctx: Context, address: string) {
    // load from store first
    let acc = await ctx.store.get(Account, {
        where: { id: address },
        relations: { primarySubname: true }
    })

    if (acc == undefined) {
        acc = new Account()
        acc.id = address
        acc.node = calcReverseNode(address)
        console.log("save account", acc)
        await ctx.store.upsert(acc)
    } else {
        console.log("load account", acc)
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
    let transferList: Transfer[] = []

    for (let t of transferData) {
        let {id, block, transaction, from, to, tokenId} = t

        let fromAccount = await getAccount(ctx, from)
        let toAccount = await getAccount(ctx, to)

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

    await ctx.store.upsert(transferList)

    for (let t of transferData) {
        let {from, to, tokenId} = t

        // Update subname owner. query subname first
        let subname = await ctx.store.findOne(Subname, {where: {tokenId: tokenId}})
        if (subname) {
            subname.owner = await getAccount(ctx, to)
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
