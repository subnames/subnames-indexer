module.exports = class Data1731409089711 {
    name = 'Data1731409089711'

    async up(db) {
        await db.query(`CREATE TABLE "ownership_transferred" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "old_owner_id" character varying, "new_owner_id" character varying, CONSTRAINT "PK_f6d006434fd73398928f8110040" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_0a3963ab9835d1e2086ec6e816" ON "ownership_transferred" ("old_owner_id") `)
        await db.query(`CREATE INDEX "IDX_28a5941b4f280b44ef77341e06" ON "ownership_transferred" ("new_owner_id") `)
        await db.query(`CREATE TABLE "name_renewed" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "name" text NOT NULL, "label" bytea NOT NULL, "expires" numeric NOT NULL, CONSTRAINT "PK_2b4e60a0ad8136512a71c8be2a3" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "subname" ("id" character varying NOT NULL, "name" text NOT NULL, "label" bytea NOT NULL, "expires" numeric NOT NULL, "owner_id" character varying, CONSTRAINT "PK_7d4ea98ca2a363d17fe0b5cfb2e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bafd15775867888bd5aa336ca4" ON "subname" ("owner_id") `)
        await db.query(`ALTER TABLE "ownership_transferred" ADD CONSTRAINT "FK_0a3963ab9835d1e2086ec6e8167" FOREIGN KEY ("old_owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "ownership_transferred" ADD CONSTRAINT "FK_28a5941b4f280b44ef77341e06c" FOREIGN KEY ("new_owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "subname" ADD CONSTRAINT "FK_bafd15775867888bd5aa336ca41" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "ownership_transferred"`)
        await db.query(`DROP INDEX "public"."IDX_0a3963ab9835d1e2086ec6e816"`)
        await db.query(`DROP INDEX "public"."IDX_28a5941b4f280b44ef77341e06"`)
        await db.query(`DROP TABLE "name_renewed"`)
        await db.query(`DROP TABLE "subname"`)
        await db.query(`DROP INDEX "public"."IDX_bafd15775867888bd5aa336ca4"`)
        await db.query(`ALTER TABLE "ownership_transferred" DROP CONSTRAINT "FK_0a3963ab9835d1e2086ec6e8167"`)
        await db.query(`ALTER TABLE "ownership_transferred" DROP CONSTRAINT "FK_28a5941b4f280b44ef77341e06c"`)
        await db.query(`ALTER TABLE "subname" DROP CONSTRAINT "FK_bafd15775867888bd5aa336ca41"`)
    }
}
