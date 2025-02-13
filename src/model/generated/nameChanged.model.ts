import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class NameChanged {
    constructor(props?: Partial<NameChanged>) {
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

    @Column_("text", {nullable: false})
    name!: string
}
