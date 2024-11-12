module.exports = class Data1731395024416 {
    name = 'Data1731395024416'

    async up(db) {
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "name_registered" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "name" text NOT NULL, "label" bytea NOT NULL, "expires" numeric NOT NULL, "owner_id" character varying, CONSTRAINT "PK_f4dbc3044737871329dc4871ee9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_c054607805817b7ec00148f7bb" ON "name_registered" ("owner_id") `)
        await db.query(`ALTER TABLE "name_registered" ADD CONSTRAINT "FK_c054607805817b7ec00148f7bbf" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "account"`)
        await db.query(`DROP TABLE "name_registered"`)
        await db.query(`DROP INDEX "public"."IDX_c054607805817b7ec00148f7bb"`)
        await db.query(`ALTER TABLE "name_registered" DROP CONSTRAINT "FK_c054607805817b7ec00148f7bbf"`)
    }
}
