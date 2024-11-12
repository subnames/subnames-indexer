import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Account} from "./account.model"

@Entity_()
export class OwnershipTransferred {
    constructor(props?: Partial<OwnershipTransferred>) {
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

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    oldOwner!: Account

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    newOwner!: Account
}
