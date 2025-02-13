import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class AddressChanged {
    constructor(props?: Partial<AddressChanged>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Column_("text", {nullable: false})
    txHash!: string

    @Column_("bytea", {nullable: false})
    node!: Uint8Array

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    coinType!: bigint

    @Column_("text", {nullable: false})
    newAddress!: string
}
