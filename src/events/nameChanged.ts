import { assertNotNull } from '@subsquid/evm-processor'
import { Context, Log } from '../processor'
import * as l2Resolver from '../abi/L2Resolver'
import { AddressChanged, NameChanged, Subname } from '../model'
import { NameChangedEvent } from './types'
import { getAccount } from '../utils'

export function getNameChanged(ctx: Context, log: Log): NameChangedEvent {
    const event = l2Resolver.events.NameChanged.decode(log)
    const transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Name changed ${event.node} to ${event.name}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        node: event.node,
        name: event.name,
    }
}

export async function processNameChanged(ctx: Context, nameChangedData: NameChangedEvent[]) {
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
        const fromAccount = await getAccount(ctx, transaction.from)
        console.log("processNameChanged: account =", fromAccount.id)
        if (!fromAccount) {
            throw new Error(`processNameChanged: Account not found for reverse node ${nodeBytes}`)
        }

        let newName = name.split('.')[0]
        console.log("processNameChanged: name ='", newName, "'")
        console.log("processNameChanged: account.primarySubname =", fromAccount.primarySubname?.name)
        if (newName == "") {
            // clear primarySubname for `from` account.
            console.log("processNameChanged: clear name for from account", fromAccount.id)
            fromAccount.primarySubname = null
            await ctx.store.upsert(fromAccount)
        } else {
            let newSubname = await ctx.store.findOne(Subname, {where: {name: newName}})
            if (newSubname) {
                newSubname.reverseResolvedFrom = fromAccount
                fromAccount.primarySubname = newSubname
                await ctx.store.upsert(newSubname)
                await ctx.store.upsert(fromAccount)
            }
        }
    }

    await ctx.store.upsert(nameChangedList)
}
