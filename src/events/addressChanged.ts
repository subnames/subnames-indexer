import { assertNotNull } from '@subsquid/evm-processor'
import { Context, Log } from '../processor'
import * as l2Resolver from '../abi/L2Resolver'
import { Account, AddressChanged, Subname } from '../model'
import { AddressChangedEvent } from './types'
import { getAccount } from './utils'

export function getAddressChanged(ctx: Context, log: Log): AddressChangedEvent {
    const event = l2Resolver.events.AddressChanged.decode(log)
    const transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Address changed ${event.node} to ${event.newAddress}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        node: event.node,
        coinType: event.coinType,
        newAddress: event.newAddress
    }
}

export async function processAddressChanged(ctx: Context, addressChangedData: AddressChangedEvent[]) {
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
