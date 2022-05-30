import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Domisili from 'App/Models/Domisili'
import { schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Keterangan from 'App/Models/Keterangan'
import { DateTime } from 'luxon'

export default class DomisilisController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const domisilis = search
      ? await Database.from('domisilis')
          .join('pemohons', 'domisilis.pemohon_nik', 'pemohons.nik')
          .select('domisilis.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('domisilis.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('domisilis')
          .join('pemohons', 'domisilis.pemohon_nik', 'pemohons.nik')
          .select('domisilis.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('domisilis.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return domisilis
  }

  public async store({ request, response }: HttpContextContract) {
    const domisiliSchema = schema.create({
      pemohonNik: schema.string(),
      keperluan: schema.string(),
    })

    const data = await request.validate({
      schema: domisiliSchema,
      messages: {},
    })
    try {
      const domisili = await Domisili.create(data)
      request.input('keterangan').forEach(async (element) => {
        await Keterangan.create({
          keterangan: element,
          jenis_permohonan: 'domisili',
          permohonanId: domisili.id,
        })
      })
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('domisilis')
      .join('pemohons', 'domisilis.pemohon_nik', 'pemohons.nik')
      .select(
        'domisilis.*',
        'pemohons.nik',
        'pemohons.nama',
        'pemohons.jenis_kelamin',
        'pemohons.tanggal_lahir',
        'pemohons.pekerjaan',
        'pemohons.tempat_lahir',
        'pemohons.agama',
        'pemohons.kewarganegaraan',
        'pemohons.alamat',
        'keperluan',
        'kk'
      )
      .where('domisilis.id', params.id)

    const keterangan = await Keterangan.query()
      .where('permohonanId', data[0].id)
      .andWhere('jenis_permohonan', 'domisili')
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const tanggal_lahir = DateTime.fromJSDate(data[0].tanggal_lahir).toFormat('yyyy-LL-dd')

    const domisili = {
      domisili: data,
      tanggal_lahir: tanggal_lahir,
      keterangan: keterangan,
      kk_link: url,
    }
    return domisili
  }

  public async destroy({ params, response }: HttpContextContract) {
    const domisili = await Domisili.findByOrFail('id', params.id)
    try {
      await Keterangan.query().where('permohonanId', domisili.id).delete()
      await domisili.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const domisili = await Domisili.find(params.id)
    try {
      domisili.status = request.input('status')
      await domisili?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
