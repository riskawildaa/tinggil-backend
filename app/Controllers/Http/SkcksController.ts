import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Skck from 'App/Models/Skck'
import { schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Keterangan from 'App/Models/Keterangan'
import { DateTime } from 'luxon'

export default class SkcksController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    const skcks = search
      ? await Database.from('skcks')
          .join('pemohons', 'skcks.pemohon_nik', 'pemohons.nik')
          .select('skcks.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('skcks.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('skcks')
          .join('pemohons', 'skcks.pemohon_nik', 'pemohons.nik')
          .select('skcks.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('skcks.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return skcks
  }

  public async store({ request, response }: HttpContextContract) {
    const skckSchema = schema.create({
      pemohonNik: schema.string(),
      keperluan: schema.string(),
    })

    const data = await request.validate({
      schema: skckSchema,
      messages: {},
    })
    try {
      const skck = await Skck.create(data)
      request.input('keterangan').forEach(async (element) => {
        await Keterangan.create({
          keterangan: element,
          jenis_permohonan: 'skck',
          permohonanId: skck.id,
        })
      })
      // return response.notFound()
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('skcks')
      .join('pemohons', 'skcks.pemohon_nik', 'pemohons.nik')
      .select(
        'skcks.*',
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
      .where('skcks.id', params.id)

    const keterangan = await Keterangan.query()
      .where('permohonanId', data[0].id)
      .andWhere('jenis_permohonan', 'skck')
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const tanggal_lahir = DateTime.fromJSDate(data[0].tanggal_lahir).toFormat('yyyy-LL-dd')
    const skck = {
      skck: data,
      tanggal_lahir: tanggal_lahir,
      keterangan: keterangan,
      kk_link: url,
    }
    return skck
  }

  public async destroy({ params, response }: HttpContextContract) {
    const skck = await Skck.findByOrFail('id', params.id)
    try {
      await Keterangan.query().where('permohonanId', skck.id).delete()
      await skck.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const skck = await Skck.find(params.id)
    try {
      skck.status = request.input('status')
      await skck?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
