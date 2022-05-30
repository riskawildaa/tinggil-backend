import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Sktm extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public pemohonNik: string

  @column()
  public keperluan: string

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

  // @belongsTo(() => Pemohon)
  // public pemohonId: BelongsTo<typeof Pemohon>
}
