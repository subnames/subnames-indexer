import { assertNotNull } from '@subsquid/evm-processor'
import { Context, Log } from '../processor'
import * as controller from '../abi/RegistrarController'
import { NameRenewed, Subname } from '../model'
import { NameRenewedEvent } from './types'

export function getNameRenewed(ctx: Context, log: Log): NameRenewedEvent {
    const event = controller.events.NameRenewed.decode(log)
    const transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Name renewed ${event.name}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        name: event.name,
        label: event.label,
        expires: event.expires
    }
}

export async function processNameRenewed(ctx: Context, nameRenewedData: NameRenewedEvent[]) {
    if (nameRenewedData.length > 0) console.log("processNameRenewed")
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
