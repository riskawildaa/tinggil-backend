import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Keterangans extends BaseSchema {
  protected tableName = 'keterangans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('jenis_permohonan')
      table.string('keterangan')
      table
        .integer('permohonan_id')
        .unsigned()
        .references('skcks.id')
        .references('sktms.id')
        .references('domisilis.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
