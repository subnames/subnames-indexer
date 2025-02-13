import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Approval: event("0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", "Approval(address,address,uint256)", {"owner": indexed(p.address), "account": indexed(p.address), "id": indexed(p.uint256)}),
    ApprovalForAll: event("0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31", "ApprovalForAll(address,address,bool)", {"owner": indexed(p.address), "operator": indexed(p.address), "isApproved": p.bool}),
    BatchMetadataUpdate: event("0x6bd5c950a8d8df17f772f5af37cb3655737899cbf903264b9795592da439661c", "BatchMetadataUpdate(uint256,uint256)", {"_fromTokenId": p.uint256, "_toTokenId": p.uint256}),
    ContractURIUpdated: event("0xa5d4097edda6d87cb9329af83fb3712ef77eeb13738ffe43cc35a4ce305ad962", "ContractURIUpdated()", {}),
    ControllerAdded: event("0x0a8bb31534c0ed46f380cb867bd5c803a189ced9a764e30b3a4991a9901d7474", "ControllerAdded(address)", {"controller": indexed(p.address)}),
    ControllerRemoved: event("0x33d83959be2573f5453b12eb9d43b3499bc57d96bd2f067ba44803c859e81113", "ControllerRemoved(address)", {"controller": indexed(p.address)}),
    NameRegistered: event("0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9", "NameRegistered(uint256,address,uint256)", {"id": indexed(p.uint256), "owner": indexed(p.address), "expires": p.uint256}),
    NameRegisteredWithRecord: event("0xfd724d251af149ea2929b9061ddab2bb31e2d87778cc0acfa1d68add62e222e8", "NameRegisteredWithRecord(uint256,address,uint256,address,uint64)", {"id": indexed(p.uint256), "owner": indexed(p.address), "expires": p.uint256, "resolver": p.address, "ttl": p.uint64}),
    NameRenewed: event("0x9b87a00e30f1ac65d898f070f8a3488fe60517182d0a2098e1b4b93a54aa9bd6", "NameRenewed(uint256,uint256)", {"id": indexed(p.uint256), "expires": p.uint256}),
    OwnershipHandoverCanceled: event("0xfa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c92", "OwnershipHandoverCanceled(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipHandoverRequested: event("0xdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d", "OwnershipHandoverRequested(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"oldOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", {"from": indexed(p.address), "to": indexed(p.address), "id": indexed(p.uint256)}),
}

export const functions = {
    addController: fun("0xa7fc7a07", "addController(address)", {"controller": p.address}, ),
    approve: fun("0x095ea7b3", "approve(address,uint256)", {"account": p.address, "id": p.uint256}, ),
    balanceOf: viewFun("0x70a08231", "balanceOf(address)", {"owner": p.address}, p.uint256),
    baseNode: viewFun("0xddf7fcb0", "baseNode()", {}, p.bytes32),
    cancelOwnershipHandover: fun("0x54d1f13d", "cancelOwnershipHandover()", {}, ),
    completeOwnershipHandover: fun("0xf04e283e", "completeOwnershipHandover(address)", {"pendingOwner": p.address}, ),
    contractURI: viewFun("0xe8a3d485", "contractURI()", {}, p.string),
    controllers: viewFun("0xda8c229e", "controllers(address)", {"controller": p.address}, p.bool),
    getApproved: viewFun("0x081812fc", "getApproved(uint256)", {"id": p.uint256}, p.address),
    isApprovedForAll: viewFun("0xe985e9c5", "isApprovedForAll(address,address)", {"owner": p.address, "operator": p.address}, p.bool),
    isAvailable: viewFun("0x3a178d99", "isAvailable(uint256)", {"id": p.uint256}, p.bool),
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    nameExpires: viewFun("0xd6e4fa86", "nameExpires(uint256)", {"id": p.uint256}, p.uint256),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    ownerOf: viewFun("0x6352211e", "ownerOf(uint256)", {"tokenId": p.uint256}, p.address),
    ownershipHandoverExpiresAt: viewFun("0xfee81cf4", "ownershipHandoverExpiresAt(address)", {"pendingOwner": p.address}, p.uint256),
    reclaim: fun("0x28ed4f6c", "reclaim(uint256,address)", {"id": p.uint256, "owner": p.address}, ),
    register: fun("0xfca247ac", "register(uint256,address,uint256)", {"id": p.uint256, "owner": p.address, "duration": p.uint256}, p.uint256),
    registerOnly: fun("0x0e297b45", "registerOnly(uint256,address,uint256)", {"id": p.uint256, "owner": p.address, "duration": p.uint256}, p.uint256),
    registerWithRecord: fun("0xeac2aa09", "registerWithRecord(uint256,address,uint256,address,uint64)", {"id": p.uint256, "owner": p.address, "duration": p.uint256, "resolver": p.address, "ttl": p.uint64}, p.uint256),
    registry: viewFun("0x7b103999", "registry()", {}, p.address),
    removeController: fun("0xf6a74ed7", "removeController(address)", {"controller": p.address}, ),
    renew: fun("0xc475abff", "renew(uint256,uint256)", {"id": p.uint256, "duration": p.uint256}, p.uint256),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    requestOwnershipHandover: fun("0x25692962", "requestOwnershipHandover()", {}, ),
    'safeTransferFrom(address,address,uint256)': fun("0x42842e0e", "safeTransferFrom(address,address,uint256)", {"from": p.address, "to": p.address, "id": p.uint256}, ),
    'safeTransferFrom(address,address,uint256,bytes)': fun("0xb88d4fde", "safeTransferFrom(address,address,uint256,bytes)", {"from": p.address, "to": p.address, "id": p.uint256, "data": p.bytes}, ),
    setApprovalForAll: fun("0xa22cb465", "setApprovalForAll(address,bool)", {"operator": p.address, "isApproved": p.bool}, ),
    setBaseTokenURI: fun("0x30176e13", "setBaseTokenURI(string)", {"baseURI_": p.string}, ),
    setContractURI: fun("0x938e3d7b", "setContractURI(string)", {"collectionURI_": p.string}, ),
    setResolver: fun("0x4e543b26", "setResolver(address)", {"resolver": p.address}, ),
    supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", {"interfaceID": p.bytes4}, p.bool),
    symbol: viewFun("0x95d89b41", "symbol()", {}, p.string),
    tokenURI: viewFun("0xc87b56dd", "tokenURI(uint256)", {"tokenId": p.uint256}, p.string),
    transferFrom: fun("0x23b872dd", "transferFrom(address,address,uint256)", {"from": p.address, "to": p.address, "id": p.uint256}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
}

export class Contract extends ContractBase {

    balanceOf(owner: BalanceOfParams["owner"]) {
        return this.eth_call(functions.balanceOf, {owner})
    }

    baseNode() {
        return this.eth_call(functions.baseNode, {})
    }

    contractURI() {
        return this.eth_call(functions.contractURI, {})
    }

    controllers(controller: ControllersParams["controller"]) {
        return this.eth_call(functions.controllers, {controller})
    }

    getApproved(id: GetApprovedParams["id"]) {
        return this.eth_call(functions.getApproved, {id})
    }

    isApprovedForAll(owner: IsApprovedForAllParams["owner"], operator: IsApprovedForAllParams["operator"]) {
        return this.eth_call(functions.isApprovedForAll, {owner, operator})
    }

    isAvailable(id: IsAvailableParams["id"]) {
        return this.eth_call(functions.isAvailable, {id})
    }

    name() {
        return this.eth_call(functions.name, {})
    }

    nameExpires(id: NameExpiresParams["id"]) {
        return this.eth_call(functions.nameExpires, {id})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    ownerOf(tokenId: OwnerOfParams["tokenId"]) {
        return this.eth_call(functions.ownerOf, {tokenId})
    }

    ownershipHandoverExpiresAt(pendingOwner: OwnershipHandoverExpiresAtParams["pendingOwner"]) {
        return this.eth_call(functions.ownershipHandoverExpiresAt, {pendingOwner})
    }

    registry() {
        return this.eth_call(functions.registry, {})
    }

    supportsInterface(interfaceID: SupportsInterfaceParams["interfaceID"]) {
        return this.eth_call(functions.supportsInterface, {interfaceID})
    }

    symbol() {
        return this.eth_call(functions.symbol, {})
    }

    tokenURI(tokenId: TokenURIParams["tokenId"]) {
        return this.eth_call(functions.tokenURI, {tokenId})
    }
}

/// Event types
export type ApprovalEventArgs = EParams<typeof events.Approval>
export type ApprovalForAllEventArgs = EParams<typeof events.ApprovalForAll>
export type BatchMetadataUpdateEventArgs = EParams<typeof events.BatchMetadataUpdate>
export type ContractURIUpdatedEventArgs = EParams<typeof events.ContractURIUpdated>
export type ControllerAddedEventArgs = EParams<typeof events.ControllerAdded>
export type ControllerRemovedEventArgs = EParams<typeof events.ControllerRemoved>
export type NameRegisteredEventArgs = EParams<typeof events.NameRegistered>
export type NameRegisteredWithRecordEventArgs = EParams<typeof events.NameRegisteredWithRecord>
export type NameRenewedEventArgs = EParams<typeof events.NameRenewed>
export type OwnershipHandoverCanceledEventArgs = EParams<typeof events.OwnershipHandoverCanceled>
export type OwnershipHandoverRequestedEventArgs = EParams<typeof events.OwnershipHandoverRequested>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type TransferEventArgs = EParams<typeof events.Transfer>

/// Function types
export type AddControllerParams = FunctionArguments<typeof functions.addController>
export type AddControllerReturn = FunctionReturn<typeof functions.addController>

export type ApproveParams = FunctionArguments<typeof functions.approve>
export type ApproveReturn = FunctionReturn<typeof functions.approve>

export type BalanceOfParams = FunctionArguments<typeof functions.balanceOf>
export type BalanceOfReturn = FunctionReturn<typeof functions.balanceOf>

export type BaseNodeParams = FunctionArguments<typeof functions.baseNode>
export type BaseNodeReturn = FunctionReturn<typeof functions.baseNode>

export type CancelOwnershipHandoverParams = FunctionArguments<typeof functions.cancelOwnershipHandover>
export type CancelOwnershipHandoverReturn = FunctionReturn<typeof functions.cancelOwnershipHandover>

export type CompleteOwnershipHandoverParams = FunctionArguments<typeof functions.completeOwnershipHandover>
export type CompleteOwnershipHandoverReturn = FunctionReturn<typeof functions.completeOwnershipHandover>

export type ContractURIParams = FunctionArguments<typeof functions.contractURI>
export type ContractURIReturn = FunctionReturn<typeof functions.contractURI>

export type ControllersParams = FunctionArguments<typeof functions.controllers>
export type ControllersReturn = FunctionReturn<typeof functions.controllers>

export type GetApprovedParams = FunctionArguments<typeof functions.getApproved>
export type GetApprovedReturn = FunctionReturn<typeof functions.getApproved>

export type IsApprovedForAllParams = FunctionArguments<typeof functions.isApprovedForAll>
export type IsApprovedForAllReturn = FunctionReturn<typeof functions.isApprovedForAll>

export type IsAvailableParams = FunctionArguments<typeof functions.isAvailable>
export type IsAvailableReturn = FunctionReturn<typeof functions.isAvailable>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type NameExpiresParams = FunctionArguments<typeof functions.nameExpires>
export type NameExpiresReturn = FunctionReturn<typeof functions.nameExpires>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type OwnerOfParams = FunctionArguments<typeof functions.ownerOf>
export type OwnerOfReturn = FunctionReturn<typeof functions.ownerOf>

export type OwnershipHandoverExpiresAtParams = FunctionArguments<typeof functions.ownershipHandoverExpiresAt>
export type OwnershipHandoverExpiresAtReturn = FunctionReturn<typeof functions.ownershipHandoverExpiresAt>

export type ReclaimParams = FunctionArguments<typeof functions.reclaim>
export type ReclaimReturn = FunctionReturn<typeof functions.reclaim>

export type RegisterParams = FunctionArguments<typeof functions.register>
export type RegisterReturn = FunctionReturn<typeof functions.register>

export type RegisterOnlyParams = FunctionArguments<typeof functions.registerOnly>
export type RegisterOnlyReturn = FunctionReturn<typeof functions.registerOnly>

export type RegisterWithRecordParams = FunctionArguments<typeof functions.registerWithRecord>
export type RegisterWithRecordReturn = FunctionReturn<typeof functions.registerWithRecord>

export type RegistryParams = FunctionArguments<typeof functions.registry>
export type RegistryReturn = FunctionReturn<typeof functions.registry>

export type RemoveControllerParams = FunctionArguments<typeof functions.removeController>
export type RemoveControllerReturn = FunctionReturn<typeof functions.removeController>

export type RenewParams = FunctionArguments<typeof functions.renew>
export type RenewReturn = FunctionReturn<typeof functions.renew>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type RequestOwnershipHandoverParams = FunctionArguments<typeof functions.requestOwnershipHandover>
export type RequestOwnershipHandoverReturn = FunctionReturn<typeof functions.requestOwnershipHandover>

export type SafeTransferFromParams_0 = FunctionArguments<typeof functions['safeTransferFrom(address,address,uint256)']>
export type SafeTransferFromReturn_0 = FunctionReturn<typeof functions['safeTransferFrom(address,address,uint256)']>

export type SafeTransferFromParams_1 = FunctionArguments<typeof functions['safeTransferFrom(address,address,uint256,bytes)']>
export type SafeTransferFromReturn_1 = FunctionReturn<typeof functions['safeTransferFrom(address,address,uint256,bytes)']>

export type SetApprovalForAllParams = FunctionArguments<typeof functions.setApprovalForAll>
export type SetApprovalForAllReturn = FunctionReturn<typeof functions.setApprovalForAll>

export type SetBaseTokenURIParams = FunctionArguments<typeof functions.setBaseTokenURI>
export type SetBaseTokenURIReturn = FunctionReturn<typeof functions.setBaseTokenURI>

export type SetContractURIParams = FunctionArguments<typeof functions.setContractURI>
export type SetContractURIReturn = FunctionReturn<typeof functions.setContractURI>

export type SetResolverParams = FunctionArguments<typeof functions.setResolver>
export type SetResolverReturn = FunctionReturn<typeof functions.setResolver>

export type SupportsInterfaceParams = FunctionArguments<typeof functions.supportsInterface>
export type SupportsInterfaceReturn = FunctionReturn<typeof functions.supportsInterface>

export type SymbolParams = FunctionArguments<typeof functions.symbol>
export type SymbolReturn = FunctionReturn<typeof functions.symbol>

export type TokenURIParams = FunctionArguments<typeof functions.tokenURI>
export type TokenURIReturn = FunctionReturn<typeof functions.tokenURI>

export type TransferFromParams = FunctionArguments<typeof functions.transferFrom>
export type TransferFromReturn = FunctionReturn<typeof functions.transferFrom>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

