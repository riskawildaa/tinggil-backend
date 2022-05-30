import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sktm from 'App/Models/Sktm'
import { schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Keterangan from 'App/Models/Keterangan'
import { DateTime } from 'luxon'

export default class SktmsController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const sktms = search
      ? await Database.from('sktms')
          .join('pemohons', 'sktms.pemohon_nik', 'pemohons.nik')
          .select('sktms.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('sktms.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('sktms')
          .join('pemohons', 'sktms.pemohon_nik', 'pemohons.nik')
          .select('sktms.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('sktms.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return sktms
  }

  public async store({ request, response }: HttpContextContract) {
    const sktmSchema = schema.create({
      pemohonNik: schema.string(),
      keperluan: schema.string(),
    })

    const data = await request.validate({
      schema: sktmSchema,
      messages: {},
    })
    try {
      const sktm = await Sktm.create(data)
      request.input('keterangan').forEach(async (element) => {
        await Keterangan.create({
          keterangan: element,
          jenis_permohonan: 'sktm',
          permohonanId: sktm.id,
        })
      })
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('sktms')
      .join('pemohons', 'sktms.pemohon_nik', 'pemohons.nik')
      .select(
        'sktms.*',
        'pemohons.nik',
        'pemohons.nama',
        'pemohons.jenis_kelamin',
        'pemohons.tanggal_lahir',
        'pemohons.tempat_lahir',
        'pemohons.pekerjaan',
        'pemohons.agama',
        'pemohons.kewarganegaraan',
        'pemohons.alamat',
        'keperluan',
        'kk'
      )
      .where('sktms.id', params.id)

    console.log(data[0].id)
    const keterangan = await Keterangan.query()
      .where('permohonanId', data[0].id)
      .andWhere('jenis_permohonan', 'sktm')
    console.log(keterangan)
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const tanggal_lahir = DateTime.fromJSDate(data[0].tanggal_lahir).toFormat('yyyy-LL-dd')
    const sktm = {
      sktm: data,
      tanggal_lahir: tanggal_lahir,
      keterangan: keterangan,
      kk_link: url,
    }
    return sktm
  }

  public async destroy({ params, response }: HttpContextContract) {
    const sktm = await Sktm.findByOrFail('id', params.id)
    try {
      await Keterangan.query().where('permohonanId', sktm.id).delete()
      await sktm.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const sktm = await Sktm.find(params.id)
    try {
      sktm.status = request.input('status')
      await sktm?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
