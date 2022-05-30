import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SuratKeterangan from 'App/Models/SuratKeterangan'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'

export default class SuratKeterangansController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const surat_keterangans = search
      ? await Database.from('surat_keterangans')
          .join('pemohons', 'surat_keterangans.pemohon_nik', 'pemohons.nik')
          .select('surat_keterangans.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('surat_keterangans.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('surat_keterangans')
          .join('pemohons', 'surat_keterangans.pemohon_nik', 'pemohons.nik')
          .select('surat_keterangans.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('surat_keterangans.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return surat_keterangans
  }

  public async store({ request, response }: HttpContextContract) {
    const surat_keteranganSchema = schema.create({
      pemohonNik: schema.string(),
      keterangan: schema.string(),
    })

    const data = await request.validate({
      schema: surat_keteranganSchema,
      messages: {},
    })
    try {
      await SuratKeterangan.create(data)
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('surat_keterangans')
      .join('pemohons', 'surat_keterangans.pemohon_nik', 'pemohons.nik')
      .select('surat_keterangans.*', 'pemohons.*')
      .where('surat_keterangans.id', params.id)
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const surat_keterangan = {
      surat_keterangan: data,
      kk_link: url,
    }
    return surat_keterangan
  }

  public async destroy({ params, response }: HttpContextContract) {
    const surat_keterangan = await SuratKeterangan.findByOrFail('id', params.id)
    try {
      await surat_keterangan.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const surat_ketarangan = await SuratKeterangan.find(params.id)
    try {
      surat_ketarangan.status = request.input('status')
      await surat_ketarangan?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
