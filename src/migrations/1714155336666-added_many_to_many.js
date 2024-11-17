export default class AddedManyToMany1714155336666 {
  name = 'AddedManyToMany1714155336666'

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "shared_boards" DROP CONSTRAINT "FK_dc1a84387279209e227204a3210"`,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" DROP CONSTRAINT "FK_c29867119e066173006748cc0a6"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc1a84387279209e227204a321"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c29867119e066173006748cc0a"`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_dc1a84387279209e227204a321" ON "shared_boards" ("user_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_c29867119e066173006748cc0a" ON "shared_boards" ("board_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" ADD CONSTRAINT "FK_dc1a84387279209e227204a3210" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" ADD CONSTRAINT "FK_c29867119e066173006748cc0a6" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "shared_boards" DROP CONSTRAINT "FK_c29867119e066173006748cc0a6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" DROP CONSTRAINT "FK_dc1a84387279209e227204a3210"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c29867119e066173006748cc0a"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc1a84387279209e227204a321"`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_c29867119e066173006748cc0a" ON "shared_boards" ("board_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_dc1a84387279209e227204a321" ON "shared_boards" ("user_id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" ADD CONSTRAINT "FK_c29867119e066173006748cc0a6" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "shared_boards" ADD CONSTRAINT "FK_dc1a84387279209e227204a3210" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}
