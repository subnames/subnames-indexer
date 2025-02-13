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
import * as registrar from './abi/BaseRegistrar'
import * as l2Resolver from './abi/L2Resolver'

export const CONTROLLER_ADDRESS = '0x017D8C573a54cc43e2D23EC8Fa756D92777c3217'.toLowerCase()
export const REGISTRAR_ADDRESS = '0xAFb5F12C5F379431253159fae464572999E78485'.toLowerCase()
export const L2_RESOLVER_ADDRESS = '0x4b74a4a9b88eF4cE5F9BB42e28e358974251BE63'.toLowerCase()

console.log(`Controller address: ${CONTROLLER_ADDRESS}`)
console.log(`Registrar address: ${REGISTRAR_ADDRESS}`)
console.log(`L2 Resolver address: ${L2_RESOLVER_ADDRESS}`)

export const processor = new EvmBatchProcessor()
    // .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
        url: 'https://crab-rpc.darwinia.network',
        rateLimit: 10
    })
    .setFinalityConfirmation(10)
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
        range: {from: 5649702},
        address: [CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, L2_RESOLVER_ADDRESS],
        topic0: [
            controller.events.NameRegistered.topic,
            controller.events.NameRenewed.topic,
            registrar.events.Transfer.topic,
            l2Resolver.events.NameChanged.topic,
        ],
        transaction: true,
    })
export type Fields = EvmBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

