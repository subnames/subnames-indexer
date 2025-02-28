import { assertNotNull } from '@subsquid/evm-processor'
import { Context, Log } from '../processor'
import * as controller from '../abi/RegistrarController'
import { NameRegistered, Subname } from '../model'
import { NameRegisteredEvent } from './types'
import { getAccount } from './utils'
import { ethers, keccak256 } from "ethers"

export function getNameRegistered(ctx: Context, log: Log): NameRegisteredEvent {
    const event = controller.events.NameRegistered.decode(log)
    const transaction = assertNotNull(log.transaction, `Missing transaction`)

    ctx.log.debug({block: log.block, txHash: transaction.hash}, `Name registered ${event.name}`)

    return {
        id: log.id,
        block: log.block,
        transaction,
        name: event.name,
        label: event.label,
        owner: event.owner,
        expires: event.expires
    }
}

export async function processNameRegistered(ctx: Context, nameRegisteredData: NameRegisteredEvent[]) {
    if (nameRegisteredData.length > 0) console.log("processNameRegistered")
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
