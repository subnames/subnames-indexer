import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as controller from './abi/RegistrarController'
import * as registrar from './abi/BaseRegistrar'
import * as l2Resolver from './abi/L2Resolver'
import {CONTROLLER_ADDRESS, REGISTRAR_ADDRESS, L2_RESOLVER_ADDRESS, processor} from './processor'
import {
    NameRegisteredEvent, TransferEvent, NameRenewedEvent, AddressChangedEvent, NameChangedEvent,
    getNameRegistered, processNameRegistered,
    getTransfer, processTransfer,
    getNameRenewed, processNameRenewed,
    getAddressChanged, processAddressChanged,
    getNameChanged, processNameChanged
} from './events'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    let nameRegisteredList: NameRegisteredEvent[] = []
    let transferList: TransferEvent[] = []
    let nameRenewedList: NameRenewedEvent[] = []
    let addressChangedList: AddressChangedEvent[] = []
    let nameChangedList: NameChangedEvent[] = []

    const nameRegisteredTopic = controller.events.NameRegistered.topic.toLowerCase()
    const nameRenewedTopic = controller.events.NameRenewed.topic.toLowerCase()
    const transferTopic = registrar.events.Transfer.topic.toLowerCase()
    const addressChangedTopic = l2Resolver.events.AddressChanged.topic.toLowerCase()
    const nameChangedTopic = l2Resolver.events.NameChanged.topic.toLowerCase()

    for (let block of ctx.blocks) {
        // console.log(`Processing block ${block.header.height}`)
        for (let log of block.logs) {
            const address = log.address.toLowerCase()
            const topic0 = log.topics[0].toLowerCase()

            if (address == CONTROLLER_ADDRESS) {
                if (topic0 === nameRegisteredTopic) {
                    nameRegisteredList.push(getNameRegistered(ctx, log))
                } else if (topic0 === nameRenewedTopic) {
                    nameRenewedList.push(getNameRenewed(ctx, log))
                }
            } else if (address == REGISTRAR_ADDRESS) {
                if (topic0 === transferTopic) {
                    const transfer = getTransfer(ctx, log)
                    if (transfer.from != "0x0000000000000000000000000000000000000000") {
                        transferList.push(transfer)
                    }
                }
            } else if (address == L2_RESOLVER_ADDRESS) {
                if (topic0 === addressChangedTopic) {
                    const addressChanged = getAddressChanged(ctx, log)
                    addressChangedList.push(addressChanged)
                } else if (topic0 === nameChangedTopic) {
                    const nameChanged = getNameChanged(ctx, log)
                    nameChangedList.push(nameChanged)
                }
            }
        }
    }

    await processNameRegistered(ctx, nameRegisteredList)
    await processNameRenewed(ctx, nameRenewedList)
    await processTransfer(ctx, transferList)
    await processAddressChanged(ctx, addressChangedList)
    await processNameChanged(ctx, nameChangedList)
})
