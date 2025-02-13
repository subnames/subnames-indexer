import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    ABIChanged: event("0xaa121bbeef5f32f5961a2a28966e769023910fc9479059ee3495d4c1a696efe3", "ABIChanged(bytes32,uint256)", {"node": indexed(p.bytes32), "contentType": indexed(p.uint256)}),
    AddrChanged: event("0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2", "AddrChanged(bytes32,address)", {"node": indexed(p.bytes32), "a": p.address}),
    AddressChanged: event("0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752", "AddressChanged(bytes32,uint256,bytes)", {"node": indexed(p.bytes32), "coinType": p.uint256, "newAddress": p.bytes}),
    ApprovalForAll: event("0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31", "ApprovalForAll(address,address,bool)", {"owner": indexed(p.address), "operator": indexed(p.address), "approved": p.bool}),
    Approved: event("0xf0ddb3b04746704017f9aa8bd728fcc2c1d11675041205350018915f5e4750a0", "Approved(address,bytes32,address,bool)", {"owner": p.address, "node": indexed(p.bytes32), "delegate": indexed(p.address), "approved": indexed(p.bool)}),
    ContenthashChanged: event("0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578", "ContenthashChanged(bytes32,bytes)", {"node": indexed(p.bytes32), "hash": p.bytes}),
    DNSRecordChanged: event("0x52a608b3303a48862d07a73d82fa221318c0027fbbcfb1b2329bface3f19ff2b", "DNSRecordChanged(bytes32,bytes,uint16,bytes)", {"node": indexed(p.bytes32), "name": p.bytes, "resource": p.uint16, "record": p.bytes}),
    DNSRecordDeleted: event("0x03528ed0c2a3ebc993b12ce3c16bb382f9c7d88ef7d8a1bf290eaf35955a1207", "DNSRecordDeleted(bytes32,bytes,uint16)", {"node": indexed(p.bytes32), "name": p.bytes, "resource": p.uint16}),
    DNSZonehashChanged: event("0x8f15ed4b723ef428f250961da8315675b507046737e19319fc1a4d81bfe87f85", "DNSZonehashChanged(bytes32,bytes,bytes)", {"node": indexed(p.bytes32), "lastzonehash": p.bytes, "zonehash": p.bytes}),
    InterfaceChanged: event("0x7c69f06bea0bdef565b709e93a147836b0063ba2dd89f02d0b7e8d931e6a6daa", "InterfaceChanged(bytes32,bytes4,address)", {"node": indexed(p.bytes32), "interfaceID": indexed(p.bytes4), "implementer": p.address}),
    NameChanged: event("0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7", "NameChanged(bytes32,string)", {"node": indexed(p.bytes32), "name": p.string}),
    OwnershipHandoverCanceled: event("0xfa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c92", "OwnershipHandoverCanceled(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipHandoverRequested: event("0xdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d", "OwnershipHandoverRequested(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"oldOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    PubkeyChanged: event("0x1d6f5e03d3f63eb58751986629a5439baee5079ff04f345becb66e23eb154e46", "PubkeyChanged(bytes32,bytes32,bytes32)", {"node": indexed(p.bytes32), "x": p.bytes32, "y": p.bytes32}),
    RegistrarControllerUpdated: event("0x1877ffeba0b0229d8385c284d9b459f592be2d0f4acc2696fccfb0ae4b73b6b9", "RegistrarControllerUpdated(address)", {"newRegistrarController": indexed(p.address)}),
    ReverseRegistrarUpdated: event("0xd192c0b229b00473ccb6ccfebf6642805bca1dcdf2d9fb4fd102c7dc7ea4ce23", "ReverseRegistrarUpdated(address)", {"newReverseRegistrar": indexed(p.address)}),
    TextChanged: event("0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1", "TextChanged(bytes32,string,string,string)", {"node": indexed(p.bytes32), "indexedKey": indexed(p.string), "key": p.string, "value": p.string}),
    VersionChanged: event("0xc6621ccb8f3f5a04bb6502154b2caf6adf5983fe76dfef1cfc9c42e3579db444", "VersionChanged(bytes32,uint64)", {"node": indexed(p.bytes32), "newVersion": p.uint64}),
}

export const functions = {
    ABI: viewFun("0x2203ab56", "ABI(bytes32,uint256)", {"node": p.bytes32, "contentTypes": p.uint256}, {"_0": p.uint256, "_1": p.bytes}),
    'addr(bytes32)': viewFun("0x3b3b57de", "addr(bytes32)", {"node": p.bytes32}, p.address),
    'addr(bytes32,uint256)': viewFun("0xf1cb7e06", "addr(bytes32,uint256)", {"node": p.bytes32, "coinType": p.uint256}, p.bytes),
    approve: fun("0xa4b91a01", "approve(bytes32,address,bool)", {"node": p.bytes32, "delegate": p.address, "approved": p.bool}, ),
    cancelOwnershipHandover: fun("0x54d1f13d", "cancelOwnershipHandover()", {}, ),
    clearRecords: fun("0x3603d758", "clearRecords(bytes32)", {"node": p.bytes32}, ),
    completeOwnershipHandover: fun("0xf04e283e", "completeOwnershipHandover(address)", {"pendingOwner": p.address}, ),
    contenthash: viewFun("0xbc1c58d1", "contenthash(bytes32)", {"node": p.bytes32}, p.bytes),
    dnsRecord: viewFun("0xa8fa5682", "dnsRecord(bytes32,bytes32,uint16)", {"node": p.bytes32, "name": p.bytes32, "resource": p.uint16}, p.bytes),
    ens: viewFun("0x3f15457f", "ens()", {}, p.address),
    hasDNSRecords: viewFun("0x4cbf6ba4", "hasDNSRecords(bytes32,bytes32)", {"node": p.bytes32, "name": p.bytes32}, p.bool),
    interfaceImplementer: viewFun("0x124a319c", "interfaceImplementer(bytes32,bytes4)", {"node": p.bytes32, "interfaceID": p.bytes4}, p.address),
    isApprovedFor: viewFun("0xa9784b3e", "isApprovedFor(address,bytes32,address)", {"owner": p.address, "node": p.bytes32, "delegate": p.address}, p.bool),
    isApprovedForAll: viewFun("0xe985e9c5", "isApprovedForAll(address,address)", {"account": p.address, "operator": p.address}, p.bool),
    multicall: fun("0xac9650d8", "multicall(bytes[])", {"data": p.array(p.bytes)}, p.array(p.bytes)),
    multicallWithNodeCheck: fun("0xe32954eb", "multicallWithNodeCheck(bytes32,bytes[])", {"nodehash": p.bytes32, "data": p.array(p.bytes)}, p.array(p.bytes)),
    name: viewFun("0x691f3431", "name(bytes32)", {"node": p.bytes32}, p.string),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    ownershipHandoverExpiresAt: viewFun("0xfee81cf4", "ownershipHandoverExpiresAt(address)", {"pendingOwner": p.address}, p.uint256),
    pubkey: viewFun("0xc8690233", "pubkey(bytes32)", {"node": p.bytes32}, {"x": p.bytes32, "y": p.bytes32}),
    recordVersions: viewFun("0xd700ff33", "recordVersions(bytes32)", {"_0": p.bytes32}, p.uint64),
    registrarController: viewFun("0xf9cd32c5", "registrarController()", {}, p.address),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    requestOwnershipHandover: fun("0x25692962", "requestOwnershipHandover()", {}, ),
    resolve: viewFun("0x9061b923", "resolve(bytes,bytes)", {"_0": p.bytes, "data": p.bytes}, p.bytes),
    reverseRegistrar: viewFun("0x80869853", "reverseRegistrar()", {}, p.address),
    setABI: fun("0x623195b0", "setABI(bytes32,uint256,bytes)", {"node": p.bytes32, "contentType": p.uint256, "data": p.bytes}, ),
    'setAddr(bytes32,uint256,bytes)': fun("0x8b95dd71", "setAddr(bytes32,uint256,bytes)", {"node": p.bytes32, "coinType": p.uint256, "a": p.bytes}, ),
    'setAddr(bytes32,address)': fun("0xd5fa2b00", "setAddr(bytes32,address)", {"node": p.bytes32, "a": p.address}, ),
    setApprovalForAll: fun("0xa22cb465", "setApprovalForAll(address,bool)", {"operator": p.address, "approved": p.bool}, ),
    setContenthash: fun("0x304e6ade", "setContenthash(bytes32,bytes)", {"node": p.bytes32, "hash": p.bytes}, ),
    setDNSRecords: fun("0x0af179d7", "setDNSRecords(bytes32,bytes)", {"node": p.bytes32, "data": p.bytes}, ),
    setInterface: fun("0xe59d895d", "setInterface(bytes32,bytes4,address)", {"node": p.bytes32, "interfaceID": p.bytes4, "implementer": p.address}, ),
    setName: fun("0x77372213", "setName(bytes32,string)", {"node": p.bytes32, "newName": p.string}, ),
    setPubkey: fun("0x29cd62ea", "setPubkey(bytes32,bytes32,bytes32)", {"node": p.bytes32, "x": p.bytes32, "y": p.bytes32}, ),
    setRegistrarController: fun("0x29448e1d", "setRegistrarController(address)", {"registrarController_": p.address}, ),
    setReverseRegistrar: fun("0x557499ba", "setReverseRegistrar(address)", {"reverseRegistrar_": p.address}, ),
    setText: fun("0x10f13a8c", "setText(bytes32,string,string)", {"node": p.bytes32, "key": p.string, "value": p.string}, ),
    setZonehash: fun("0xce3decdc", "setZonehash(bytes32,bytes)", {"node": p.bytes32, "hash": p.bytes}, ),
    supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", {"interfaceID": p.bytes4}, p.bool),
    text: viewFun("0x59d1d43c", "text(bytes32,string)", {"node": p.bytes32, "key": p.string}, p.string),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    zonehash: viewFun("0x5c98042b", "zonehash(bytes32)", {"node": p.bytes32}, p.bytes),
}

export class Contract extends ContractBase {

    ABI(node: ABIParams["node"], contentTypes: ABIParams["contentTypes"]) {
        return this.eth_call(functions.ABI, {node, contentTypes})
    }

    'addr(bytes32)'(node: AddrParams_0["node"]) {
        return this.eth_call(functions['addr(bytes32)'], {node})
    }

    'addr(bytes32,uint256)'(node: AddrParams_1["node"], coinType: AddrParams_1["coinType"]) {
        return this.eth_call(functions['addr(bytes32,uint256)'], {node, coinType})
    }

    contenthash(node: ContenthashParams["node"]) {
        return this.eth_call(functions.contenthash, {node})
    }

    dnsRecord(node: DnsRecordParams["node"], name: DnsRecordParams["name"], resource: DnsRecordParams["resource"]) {
        return this.eth_call(functions.dnsRecord, {node, name, resource})
    }

    ens() {
        return this.eth_call(functions.ens, {})
    }

    hasDNSRecords(node: HasDNSRecordsParams["node"], name: HasDNSRecordsParams["name"]) {
        return this.eth_call(functions.hasDNSRecords, {node, name})
    }

    interfaceImplementer(node: InterfaceImplementerParams["node"], interfaceID: InterfaceImplementerParams["interfaceID"]) {
        return this.eth_call(functions.interfaceImplementer, {node, interfaceID})
    }

    isApprovedFor(owner: IsApprovedForParams["owner"], node: IsApprovedForParams["node"], delegate: IsApprovedForParams["delegate"]) {
        return this.eth_call(functions.isApprovedFor, {owner, node, delegate})
    }

    isApprovedForAll(account: IsApprovedForAllParams["account"], operator: IsApprovedForAllParams["operator"]) {
        return this.eth_call(functions.isApprovedForAll, {account, operator})
    }

    name(node: NameParams["node"]) {
        return this.eth_call(functions.name, {node})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    ownershipHandoverExpiresAt(pendingOwner: OwnershipHandoverExpiresAtParams["pendingOwner"]) {
        return this.eth_call(functions.ownershipHandoverExpiresAt, {pendingOwner})
    }

    pubkey(node: PubkeyParams["node"]) {
        return this.eth_call(functions.pubkey, {node})
    }

    recordVersions(_0: RecordVersionsParams["_0"]) {
        return this.eth_call(functions.recordVersions, {_0})
    }

    registrarController() {
        return this.eth_call(functions.registrarController, {})
    }

    resolve(_0: ResolveParams["_0"], data: ResolveParams["data"]) {
        return this.eth_call(functions.resolve, {_0, data})
    }

    reverseRegistrar() {
        return this.eth_call(functions.reverseRegistrar, {})
    }

    supportsInterface(interfaceID: SupportsInterfaceParams["interfaceID"]) {
        return this.eth_call(functions.supportsInterface, {interfaceID})
    }

    text(node: TextParams["node"], key: TextParams["key"]) {
        return this.eth_call(functions.text, {node, key})
    }

    zonehash(node: ZonehashParams["node"]) {
        return this.eth_call(functions.zonehash, {node})
    }
}

/// Event types
export type ABIChangedEventArgs = EParams<typeof events.ABIChanged>
export type AddrChangedEventArgs = EParams<typeof events.AddrChanged>
export type AddressChangedEventArgs = EParams<typeof events.AddressChanged>
export type ApprovalForAllEventArgs = EParams<typeof events.ApprovalForAll>
export type ApprovedEventArgs = EParams<typeof events.Approved>
export type ContenthashChangedEventArgs = EParams<typeof events.ContenthashChanged>
export type DNSRecordChangedEventArgs = EParams<typeof events.DNSRecordChanged>
export type DNSRecordDeletedEventArgs = EParams<typeof events.DNSRecordDeleted>
export type DNSZonehashChangedEventArgs = EParams<typeof events.DNSZonehashChanged>
export type InterfaceChangedEventArgs = EParams<typeof events.InterfaceChanged>
export type NameChangedEventArgs = EParams<typeof events.NameChanged>
export type OwnershipHandoverCanceledEventArgs = EParams<typeof events.OwnershipHandoverCanceled>
export type OwnershipHandoverRequestedEventArgs = EParams<typeof events.OwnershipHandoverRequested>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PubkeyChangedEventArgs = EParams<typeof events.PubkeyChanged>
export type RegistrarControllerUpdatedEventArgs = EParams<typeof events.RegistrarControllerUpdated>
export type ReverseRegistrarUpdatedEventArgs = EParams<typeof events.ReverseRegistrarUpdated>
export type TextChangedEventArgs = EParams<typeof events.TextChanged>
export type VersionChangedEventArgs = EParams<typeof events.VersionChanged>

/// Function types
export type ABIParams = FunctionArguments<typeof functions.ABI>
export type ABIReturn = FunctionReturn<typeof functions.ABI>

export type AddrParams_0 = FunctionArguments<typeof functions['addr(bytes32)']>
export type AddrReturn_0 = FunctionReturn<typeof functions['addr(bytes32)']>

export type AddrParams_1 = FunctionArguments<typeof functions['addr(bytes32,uint256)']>
export type AddrReturn_1 = FunctionReturn<typeof functions['addr(bytes32,uint256)']>

export type ApproveParams = FunctionArguments<typeof functions.approve>
export type ApproveReturn = FunctionReturn<typeof functions.approve>

export type CancelOwnershipHandoverParams = FunctionArguments<typeof functions.cancelOwnershipHandover>
export type CancelOwnershipHandoverReturn = FunctionReturn<typeof functions.cancelOwnershipHandover>

export type ClearRecordsParams = FunctionArguments<typeof functions.clearRecords>
export type ClearRecordsReturn = FunctionReturn<typeof functions.clearRecords>

export type CompleteOwnershipHandoverParams = FunctionArguments<typeof functions.completeOwnershipHandover>
export type CompleteOwnershipHandoverReturn = FunctionReturn<typeof functions.completeOwnershipHandover>

export type ContenthashParams = FunctionArguments<typeof functions.contenthash>
export type ContenthashReturn = FunctionReturn<typeof functions.contenthash>

export type DnsRecordParams = FunctionArguments<typeof functions.dnsRecord>
export type DnsRecordReturn = FunctionReturn<typeof functions.dnsRecord>

export type EnsParams = FunctionArguments<typeof functions.ens>
export type EnsReturn = FunctionReturn<typeof functions.ens>

export type HasDNSRecordsParams = FunctionArguments<typeof functions.hasDNSRecords>
export type HasDNSRecordsReturn = FunctionReturn<typeof functions.hasDNSRecords>

export type InterfaceImplementerParams = FunctionArguments<typeof functions.interfaceImplementer>
export type InterfaceImplementerReturn = FunctionReturn<typeof functions.interfaceImplementer>

export type IsApprovedForParams = FunctionArguments<typeof functions.isApprovedFor>
export type IsApprovedForReturn = FunctionReturn<typeof functions.isApprovedFor>

export type IsApprovedForAllParams = FunctionArguments<typeof functions.isApprovedForAll>
export type IsApprovedForAllReturn = FunctionReturn<typeof functions.isApprovedForAll>

export type MulticallParams = FunctionArguments<typeof functions.multicall>
export type MulticallReturn = FunctionReturn<typeof functions.multicall>

export type MulticallWithNodeCheckParams = FunctionArguments<typeof functions.multicallWithNodeCheck>
export type MulticallWithNodeCheckReturn = FunctionReturn<typeof functions.multicallWithNodeCheck>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type OwnershipHandoverExpiresAtParams = FunctionArguments<typeof functions.ownershipHandoverExpiresAt>
export type OwnershipHandoverExpiresAtReturn = FunctionReturn<typeof functions.ownershipHandoverExpiresAt>

export type PubkeyParams = FunctionArguments<typeof functions.pubkey>
export type PubkeyReturn = FunctionReturn<typeof functions.pubkey>

export type RecordVersionsParams = FunctionArguments<typeof functions.recordVersions>
export type RecordVersionsReturn = FunctionReturn<typeof functions.recordVersions>

export type RegistrarControllerParams = FunctionArguments<typeof functions.registrarController>
export type RegistrarControllerReturn = FunctionReturn<typeof functions.registrarController>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type RequestOwnershipHandoverParams = FunctionArguments<typeof functions.requestOwnershipHandover>
export type RequestOwnershipHandoverReturn = FunctionReturn<typeof functions.requestOwnershipHandover>

export type ResolveParams = FunctionArguments<typeof functions.resolve>
export type ResolveReturn = FunctionReturn<typeof functions.resolve>

export type ReverseRegistrarParams = FunctionArguments<typeof functions.reverseRegistrar>
export type ReverseRegistrarReturn = FunctionReturn<typeof functions.reverseRegistrar>

export type SetABIParams = FunctionArguments<typeof functions.setABI>
export type SetABIReturn = FunctionReturn<typeof functions.setABI>

export type SetAddrParams_0 = FunctionArguments<typeof functions['setAddr(bytes32,uint256,bytes)']>
export type SetAddrReturn_0 = FunctionReturn<typeof functions['setAddr(bytes32,uint256,bytes)']>

export type SetAddrParams_1 = FunctionArguments<typeof functions['setAddr(bytes32,address)']>
export type SetAddrReturn_1 = FunctionReturn<typeof functions['setAddr(bytes32,address)']>

export type SetApprovalForAllParams = FunctionArguments<typeof functions.setApprovalForAll>
export type SetApprovalForAllReturn = FunctionReturn<typeof functions.setApprovalForAll>

export type SetContenthashParams = FunctionArguments<typeof functions.setContenthash>
export type SetContenthashReturn = FunctionReturn<typeof functions.setContenthash>

export type SetDNSRecordsParams = FunctionArguments<typeof functions.setDNSRecords>
export type SetDNSRecordsReturn = FunctionReturn<typeof functions.setDNSRecords>

export type SetInterfaceParams = FunctionArguments<typeof functions.setInterface>
export type SetInterfaceReturn = FunctionReturn<typeof functions.setInterface>

export type SetNameParams = FunctionArguments<typeof functions.setName>
export type SetNameReturn = FunctionReturn<typeof functions.setName>

export type SetPubkeyParams = FunctionArguments<typeof functions.setPubkey>
export type SetPubkeyReturn = FunctionReturn<typeof functions.setPubkey>

export type SetRegistrarControllerParams = FunctionArguments<typeof functions.setRegistrarController>
export type SetRegistrarControllerReturn = FunctionReturn<typeof functions.setRegistrarController>

export type SetReverseRegistrarParams = FunctionArguments<typeof functions.setReverseRegistrar>
export type SetReverseRegistrarReturn = FunctionReturn<typeof functions.setReverseRegistrar>

export type SetTextParams = FunctionArguments<typeof functions.setText>
export type SetTextReturn = FunctionReturn<typeof functions.setText>

export type SetZonehashParams = FunctionArguments<typeof functions.setZonehash>
export type SetZonehashReturn = FunctionReturn<typeof functions.setZonehash>

export type SupportsInterfaceParams = FunctionArguments<typeof functions.supportsInterface>
export type SupportsInterfaceReturn = FunctionReturn<typeof functions.supportsInterface>

export type TextParams = FunctionArguments<typeof functions.text>
export type TextReturn = FunctionReturn<typeof functions.text>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type ZonehashParams = FunctionArguments<typeof functions.zonehash>
export type ZonehashReturn = FunctionReturn<typeof functions.zonehash>

