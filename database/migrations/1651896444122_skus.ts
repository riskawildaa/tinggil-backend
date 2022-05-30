import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Skus extends BaseSchema {
  protected tableName = 'skus'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pemohon_id').unsigned().references('pemohons.id').onDelete('CASCADE')
      table.string('nama_usaha')
      table.string('jenis_usaha')
      table.string('alamat_usaha')

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
