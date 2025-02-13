import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Subname} from "./subname.model"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @PrimaryColumn_()
    id!: string

    @Column_("bytea", {nullable: false})
    node!: Uint8Array

    @Index_()
    @ManyToOne_(() => Subname, {nullable: true})
    primarySubname!: Subname | undefined | null
}
