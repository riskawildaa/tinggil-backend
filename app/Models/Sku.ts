import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Sku extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public pemohonNik: string

  @column()
  public namaUsaha: string

  @column()
  public jenisUsaha: string

  @column()
  public alamatUsaha: string

  @column()
  public status: string

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-LL-dd') : value
    },
  })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
