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

export const REGISTRAR_ADDRESS = '0x74b673e8cb4894D926d5c7bD35B472f88E99846'.toLowerCase()
export const CONTROLLER_ADDRESS = '0xa9EA0B4Fc053c68977F535Ea67e3f0062B363443'.toLowerCase()
export const L2_RESOLVER_ADDRESS = '0xf761709777A4aa1b71570524869B1876fEafCB2e'.toLowerCase()

console.log(`Controller address: ${CONTROLLER_ADDRESS}`)
console.log(`Registrar address: ${REGISTRAR_ADDRESS}`)
console.log(`L2 Resolver address: ${L2_RESOLVER_ADDRESS}`)

export const processor = new EvmBatchProcessor()
    // .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
        url: 'http://c2.crab-rpc.itering.io:9944',
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
        range: {from: 5976526},
        address: [CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, L2_RESOLVER_ADDRESS],
        topic0: [
            controller.events.NameRegistered.topic,
            controller.events.NameRenewed.topic,
            registrar.events.Transfer.topic,
            l2Resolver.events.AddressChanged.topic,
            l2Resolver.events.NameChanged.topic,
        ],
        transaction: true,
    })
export type Fields = EvmBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>

