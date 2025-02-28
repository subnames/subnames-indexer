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
            console.log("processNameChanged: clear name") 

            // Find the old subname:
            //   1. find all subnames belongs to `from` account.
            //      Subname.reverseResolvedFrom.id = fromAccount.id
            //   2. iterate the subnames, find the 'subname' whose AddressChanged was updated most recently.
            //      Last AddressChanged event whose AddressChanged.node == nodehash(name)
            let subnames = await ctx.store.find(Subname, {
                where: {
                    reverseResolvedFrom: {
                        id: fromAccount.id
                    }
                },
                relations: {
                    reverseResolvedFrom: true
                }
            })
            
            // If there are no subnames, we can't proceed
            if (subnames.length === 0) {
                throw new Error(`processNameChanged: No old subname found for account ${fromAccount.id} when clearing name`)
            }
            
            // Find the most recently updated subname by checking AddressChanged events
            let oldSubname: Subname | undefined
            let mostRecentTimestamp: Date | undefined
            
            for (const subname of subnames) {
                // Get the most recent AddressChanged event for this subname
                const addressChangedEvent = await ctx.store.findOne(AddressChanged, {
                    where: {
                        node: subname.node
                    },
                    order: {
                        timestamp: 'DESC'
                    }
                })
                
                if (addressChangedEvent && (!mostRecentTimestamp || addressChangedEvent.timestamp > mostRecentTimestamp)) {
                    mostRecentTimestamp = addressChangedEvent.timestamp
                    oldSubname = subname
                }
            }
            
            if (oldSubname) {
                console.log("processNameChanged: old subname", oldSubname)
                console.log("processNameChanged: set reverseResolvedFrom to null")
                oldSubname.reverseResolvedFrom = null
                await ctx.store.upsert(oldSubname)
            } else {
                throw new Error("processNameChanged: No AddressChanged events found when clearing name")
            }
            
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
