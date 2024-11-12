import {In} from 'typeorm'
import {assertNotNull} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import {Account, NameRegistered} from './model'
import {Block, CONTRACT_ADDRESS, Context, Log, Transaction, processor} from './processor'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() && log.topics[0].toLowerCase() === controller.events.NameRegistered.topic.toLowerCase()) {
                nameRegisteredList.push(getNameRegistered(ctx, log))
            }
        }
    }

    await processNameRegistered(ctx, nameRegisteredList)
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

    for (let t of nameRegisteredData) {
        let {id, block, transaction, name, label, owner, expires} = t

        console.log(label)
        let account = getAccount(accounts, owner)

        nameRegisteredList.push(
            new NameRegistered({
                id,
                blockNumber: block.height,
                timestamp: new Date(block.timestamp),
                txHash: transaction.hash,
                name,
                label: Buffer.from(label.replace('0x', ''), 'hex'),
                owner: account,
                expires,
            })
        )
    }

    await ctx.store.upsert(Array.from(accounts.values()))
    await ctx.store.insert(nameRegisteredList)
}

function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
