import { Block, Context, Transaction } from '../processor'

export interface NameRegisteredEvent {
    id: string
    block: Block
    transaction: Transaction
    name: string
    label: string
    owner: string
    expires: bigint
}

export interface TransferEvent {
    id: string
    block: Block
    transaction: Transaction
    from: string
    to: string
    tokenId: bigint
}

export interface NameRenewedEvent {
    id: string
    block: Block
    transaction: Transaction
    name: string
    label: string
    expires: bigint
}

export interface AddressChangedEvent {
    id: string
    block: Block
    transaction: Transaction
    node: string
    coinType: bigint
    newAddress: string
}

export interface NameChangedEvent {
    id: string
    block: Block
    transaction: Transaction
    node: string
    name: string
}
