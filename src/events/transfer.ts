import { assertNotNull } from '@subsquid/evm-processor'
import { Context, Log } from '../processor'
import * as registrar from '../abi/BaseRegistrar'
import { Transfer, Subname } from '../model'
import { TransferEvent } from './types'
import { getAccount } from '../utils'

export function getTransfer(ctx: Context, log: Log): TransferEvent {
    const event = registrar.events.Transfer.decode(log)
    const transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Transfer from ${event.from} to ${event.to} tokenId ${event.id}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        from: event.from,
        to: event.to,
        tokenId: event.id
    }
}

export async function processTransfer(ctx: Context, transferData: TransferEvent[]) {
    if (transferData.length > 0) console.log("== processTransfer")
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
        console.log(`processTransfer: update owner of subname token id ${tokenId} from ${from} to ${to}`)
        let subname = await ctx.store.findOne(Subname, {where: {tokenId: tokenId}})
        if (subname) {
            console.log(`processTransfer: found subname ${subname.name} for token id ${tokenId}`)
            console.log(`processTransfer: load 'to' account:`)
            let newOwner = await getAccount(ctx, to)
            subname.owner = newOwner
            subname.reverseResolvedFrom = newOwner
            await ctx.store.upsert(subname)
        } else {
            throw new Error(`Subname not found for tokenId ${tokenId}`)
        }
    }
}
