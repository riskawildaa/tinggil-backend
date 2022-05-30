import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import KehilanganKk from 'App/Models/KehilanganKk'
import { schema } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'

export default class KehilanganKksController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const kehilangan_kks = search
      ? await Database.from('kehilangan_kks')
          .join('pemohons', 'kehilangan_kks.pemohon_nik', 'pemohons.nik')
          .select('kehilangan_kks.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('kehilangan_kks.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('kehilangan_kks')
          .join('pemohons', 'kehilangan_kks.pemohon_nik', 'pemohons.nik')
          .select('kehilangan_kks.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('kehilangan_kks.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return kehilangan_kks
  }

  public async store({ request, response }: HttpContextContract) {
    const kehilangan_kkSchema = schema.create({
      pemohonNik: schema.string(),
      keterangan: schema.string(),
    })

    const data = await request.validate({
      schema: kehilangan_kkSchema,
      messages: {},
    })
    try {
      await KehilanganKk.create(data)
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('kehilangan_kks')
      .join('pemohons', 'kehilangan_kks.pemohon_nik', 'pemohons.nik')
      .select('kehilangan_kks.*', 'pemohons.*')
      .where('kehilangan_kks.id', params.id)
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const kehilangan_kk = {
      kehilangan_kk: data,
      kk_link: url,
    }
    return kehilangan_kk
  }

  public async destroy({ params, response }: HttpContextContract) {
    const kehilangan_kk = await KehilanganKk.findByOrFail('id', params.id)
    try {
      await kehilangan_kk.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const kehilangan_kk = await KehilanganKk.find(params.id)
    try {
      kehilangan_kk.status = request.input('status')
      await kehilangan_kk?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
