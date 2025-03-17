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

export const REGISTRAR_ADDRESS = '0x607A819b8406A5E00F6FC649D67A11DFE2d57efd'.toLowerCase()
export const CONTROLLER_ADDRESS = '0x0Fc565C7B8dD952281eB3829A3e95067d41363e5'.toLowerCase()
export const L2_RESOLVER_ADDRESS = '0xB483A20cd7482EBEf468c970953BDdb6faf3c03e'.toLowerCase()
const FROM = 5935701

console.log(`Controller address: ${CONTROLLER_ADDRESS}`)
console.log(`Registrar address: ${REGISTRAR_ADDRESS}`)
console.log(`L2 Resolver address: ${L2_RESOLVER_ADDRESS}`)

export const processor = new EvmBatchProcessor()
    // .setGateway('https://v2.archive.subsquid.io/network/ethereum-mainnet')
    .setRpcEndpoint({
        url: 'http://rpc.darwinia.network',
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
        range: {from: FROM},
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

