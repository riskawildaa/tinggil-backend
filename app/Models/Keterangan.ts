import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Keterangan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public keterangan: string

  @column()
  public jenis_permohonan: string

  @column()
  public permohonanId: number

  @column()
  public status: string
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // @belongsTo
}
