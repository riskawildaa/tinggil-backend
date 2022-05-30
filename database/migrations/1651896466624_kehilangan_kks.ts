import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KehilanganKks extends BaseSchema {
  protected tableName = 'kehilangan_kks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pemohon_id').unsigned().references('pemohons.id').onDelete('CASCADE')
      table.string('keterangan')
      table.string('ktp')

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
