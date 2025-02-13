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

export const CONTROLLER_ADDRESS = '0x017D8C573a54cc43e2D23EC8Fa756D92777c3217'.toLowerCase()
export const REGISTRAR_ADDRESS = '0xAFb5F12C5F379431253159fae464572999E78485'.toLowerCase()

console.log(`Controller address: ${CONTROLLER_ADDRESS}`)
console.log(`Registrar address: ${REGISTRAR_ADDRESS}`)

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
        address: [CONTROLLER_ADDRESS, REGISTRAR_ADDRESS],
        topic0: [
            controller.events.NameRegistered.topic,
            controller.events.NameRenewed.topic,
            registrar.events.Transfer.topic,
        ],
        transaction: true,
    })
export type Fields = EvmBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

