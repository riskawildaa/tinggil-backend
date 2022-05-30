import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Domisilis extends BaseSchema {
  protected tableName = 'domisilis'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pemohon_id').unsigned().references('pemohons.id').onDelete('CASCADE')
      table.string('keperluan')

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
