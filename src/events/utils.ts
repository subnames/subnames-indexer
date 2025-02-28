import { Context } from '../processor'
import { Account } from '../model'
import { keccak256 as viemKeccak256, encodePacked } from "viem"
import hexAddress from "../sha3";

export async function getAccount(ctx: Context, address: string): Promise<Account> {
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

export function calcReverseNode(address: string) {
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
