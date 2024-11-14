import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'
import {Store} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'

export const CONTRACT_ADDRESS = '0x50d634E43F5aD7748cf2860760b887655524B593'

console.log(CONTRACT_ADDRESS)
console.log(controller.events.NameRegistered.topic)
export const processor = new EvmBatchProcessor()
    // .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
        url: 'https://koi-rpc.darwinia.network',
        rateLimit: 10
    })
    .setFinalityConfirmation(35)
    .setFields({
        log: {
            topics: true,
            data: true,
        },
        transaction: {
            hash: true,
        },
    })
    .addLog({
        range: {from: 1800370},
        address: [CONTRACT_ADDRESS],
        topic0: [
            controller.events.NameRegistered.topic,
            controller.events.OwnershipTransferred.topic,
            controller.events.NameRenewed.topic,
        ],
        transaction: true,
    })
export type Fields = EvmBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

