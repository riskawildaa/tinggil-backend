import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SuratKeterangans extends BaseSchema {
  protected tableName = 'surat_keterangans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pemohon_id').unsigned().references('pemohons.id').onDelete('CASCADE')
      table.string('keterangan')

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
