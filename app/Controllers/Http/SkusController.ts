import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sku from 'App/Models/Sku'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'

export default class SkusController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const skus = search
      ? await Database.from('skus')
          .join('pemohons', 'skus.pemohon_nik', 'pemohons.nik')
          .select('skus.*', 'pemohons.nik', 'pemohons.nama')
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('skus.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Database.from('skus')
          .join('pemohons', 'skus.pemohon_nik', 'pemohons.nik')
          .select('skus.*', 'pemohons.nik', 'pemohons.nama')
          .orderBy('skus.id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return skus
  }

  public async store({ request, response }: HttpContextContract) {
    const skuSchema = schema.create({
      pemohonNik: schema.string(),
      namaUsaha: schema.string(),
      alamatUsaha: schema.string(),
      jenisUsaha: schema.string(),
    })

    const data = await request.validate({
      schema: skuSchema,
      data: {
        pemohonNik: request.input('pemohonNik'),
        namaUsaha: request.input('nama_usaha'),
        alamatUsaha: request.input('alamat_usaha'),
        jenisUsaha: request.input('jenis_usaha'),
      },
    })
    try {
      await Sku.create(data)
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Database.from('skus')
      .join('pemohons', 'skus.pemohon_nik', 'pemohons.nik')
      .select('skus.*', 'pemohons.*')
      .where('skus.id', params.id)
    const fileUrl = await Drive.getUrl('' + data[0].kk)
    const url = Env.get('APP_URL') + fileUrl
    const sku = {
      sku: data,
      kk_link: url,
    }
    return sku
  }

  public async destroy({ params, response }: HttpContextContract) {
    const sku = await Sku.findByOrFail('id', params.id)
    try {
      await sku.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const sku = await Sku.find(params.id)
    try {
      sku.status = request.input('status')
      await sku?.save()
      return response.status(200)
    } catch (err) {
      return response.badRequest(err)
    }
  }
}
