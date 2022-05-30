import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pemohons extends BaseSchema {
  protected tableName = 'pemohons'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nama')
      table.string('tempat_lahir')
      table.string('tanggal_lahir')
      table.string('jenis_kelamin')
      table.string('kewarganegaraan')
      table.integer('nik')
      table.string('agama')
      table.string('pekerjaan')
      table.string('telpon')
      table.string('alamat')
      table.string('kk')

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
