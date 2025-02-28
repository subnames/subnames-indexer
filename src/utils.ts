import { Context } from './processor'
import { Account } from './model'
import { keccak256 as viemKeccak256, encodePacked } from "viem"
import { keccak_256 } from "@noble/hashes/sha3"

export default function hexAddress(address: string /* HexString */): `0x${string}` {
    const cleanAddress = address.replace('0x', '').toLowerCase()
    if (cleanAddress.length !== 40) {
        throw new Error('Invalid address length')
    }
    if (!/^[0-9a-f]{40}$/.test(cleanAddress)) {
        throw new Error('Invalid address format')
    }
    const hash = keccak_256(cleanAddress)
    const hexHash = Array.from(hash)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    return ('0x' + hexHash) as `0x${string}`
}

// console.log(hexAddress('0xD93E82b9969CC9a016Bc58f5D1D7f83918fd9C79'))

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
        console.log("save", acc)
        await ctx.store.upsert(acc)
    } else {
        console.log("load", acc)
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
