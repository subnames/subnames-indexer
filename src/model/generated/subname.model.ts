import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"

@Entity_()
export class Subname {
    constructor(props?: Partial<Subname>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    tokenId!: bigint

    @Column_("text", {nullable: false})
    name!: string

    @Column_("bytea", {nullable: false})
    label!: Uint8Array

    @Column_("bytea", {nullable: false})
    node!: Uint8Array

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    owner!: Account

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    expires!: bigint

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    resolvedTo!: Account

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    reverseResolvedFrom!: Account | undefined | null
}
