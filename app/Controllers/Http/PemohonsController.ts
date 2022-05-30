import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import fs from 'fs'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Pemohon from 'App/Models/Pemohon'
import Application from '@ioc:Adonis/Core/Application'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'

export default class PemohonsController {
  public async index({ request }: HttpContextContract) {
    const perPage = request.input('limit', 5)
    const pageInput = request.input('page', 0)
    const search = request.input('search')
    // const offset = params.offset
    const pemohons = search
      ? await Pemohon.query()
          .where('nama', 'like', `%${search}%`)
          .orWhere('nik', 'like', `%${search}%`)
          .orderBy('id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)
      : await Pemohon.query()
          .orderBy('id', 'asc')
          .paginate(parseInt(pageInput) + 1, perPage)

    return pemohons
  }

  public async getAll() {
    return await Pemohon.all()
  }

  public async store({ request, response }: HttpContextContract) {
    const pemohonSchema = schema.create({
      nik: schema.string({}, [rules.unique({ table: 'pemohons', column: 'nik' })]),
      tempat_lahir: schema.string(),
      tanggal_lahir: schema.date(),
      jenis_kelamin: schema.string(),
      kewarganegaraan: schema.string(),
      agama: schema.string(),
      pekerjaan: schema.string(),
      telpon: schema.string(),
      nama: schema.string(),
      alamat: schema.string(),
      kk: schema.file({ size: '2mb' }),
    })

    const userSchema = schema.create({
      username: schema.string({}, [rules.unique({ table: 'users', column: 'username' })]),
    })

    const userValidated = await request.validate({
      schema: userSchema,
      messages: {
        'username.unique': 'Username sudah terdaftar',
      },
    })

    const dataValidated = await request.validate({
      schema: pemohonSchema,
      messages: {
        'nik.unique': 'NIK sudah terdaftar',
      },
    })

    const kk = request.file('kk')

    const name = kk?.clientName
    const ext = name?.split('.')[1]
    const ts = new Date().valueOf()
    const fileName = ts + '.' + ext

    const data = {
      nik: dataValidated.nik,
      tempat_lahir: dataValidated.tempat_lahir,
      tanggal_lahir: dataValidated.tanggal_lahir,
      jenis_kelamin: dataValidated.jenis_kelamin,
      kewarganegaraan: dataValidated.kewarganegaraan,
      agama: dataValidated.agama,
      pekerjaan: dataValidated.pekerjaan,
      telpon: dataValidated.telpon,
      alamat: dataValidated.alamat,
      nama: dataValidated.nama,
      kk: fileName,
    }

    const userData = {
      username: userValidated.username,
      password: 'pemohon',
      level: 4,
      nama: dataValidated.nama,
    }

    fs.mkdirSync(Application.publicPath('/uploads'), { recursive: true })
    await kk?.moveToDisk(Application.publicPath('/uploads'), { name: fileName })
    if (kk?.state == 'moved') {
      console.log('upload berhasil')
    } else {
      console.log(kk?.errors)
    }
    try {
      await Pemohon.create(data)
      await User.create(userData)
      return response.created()
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async show({ params }: HttpContextContract) {
    const data = await Pemohon.findBy('nik', params.nik)
    const fileUrl = await Drive.getUrl('' + data?.kk)
    const url = Env.get('APP_URL') + fileUrl
    const pemohon = {
      pemohon: data,
      kk_link: url,
    }
    return pemohon
  }

  public async update({ params, request, response }: HttpContextContract) {
    const pemohon = await Pemohon.findByOrFail('nik', params.nik)
    const userSchema = schema.create({
      nama: schema.string(),
      jenis_kelamin: schema.string.optional(),
      tempat_lahir: schema.string.optional(),
      tanggal_lahir: schema.date.optional(),
      agama: schema.string.optional(),
      kewarganegaraan: schema.string.optional(),
      alamat: schema.string.optional(),
      telpon: schema.string.optional(),
      pekerjaan: schema.string.optional(),
    })

    const data = await request.validate({ schema: userSchema })
    try {
      pemohon.nama = data.nama
      pemohon.jenis_kelamin = data.jenis_kelamin!
      pemohon.tempat_lahir = data.tempat_lahir!
      pemohon.tanggal_lahir = data.tanggal_lahir!
      pemohon.agama = data.agama!
      pemohon.kewarganegaraan = data.kewarganegaraan!
      pemohon.alamat = data.alamat!
      pemohon.telpon = data.telpon!
      pemohon.pekerjaan = data.pekerjaan!

      await pemohon.save()

      return response.status(200)
    } catch (error) {
      console.log(error)
      return response.badRequest(error)
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const pemohon = await Pemohon.findByOrFail('nik', params.nik)
    try {
      await Drive.delete(pemohon.kk)
      await pemohon.delete()
      return response.status(200)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  public async showById({ params }) {
    const data = await Pemohon.findBy('user_id', params.id)
    const fileUrl = await Drive.getUrl('' + data?.kk)
    const url = Env.get('APP_URL') + fileUrl
    const pemohon = {
      pemohon: data,
      kk_link: url,
    }
    return pemohon
  }

  public async uploadKK({ request, response }: HttpContextContract) {
    const pemohon = await Pemohon.findByOrFail('nik', request.input('nik'))
    const kk = request.file('file_kk')

    const name = kk?.clientName
    const ext = name?.split('.')[1]
    const ts = new Date().valueOf()
    const fileName = ts + '.' + ext

    try {
      try {
        fs.mkdirSync(Application.publicPath('/uploads'), { recursive: true })
        await kk?.moveToDisk(Application.publicPath('/uploads'), { name: fileName })
      } catch (error) {
        console.log(error)
      }

      pemohon.kk = fileName
      await pemohon.save()

      return response.status(200)
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
  }

  public async getSurat({ params }: HttpContextContract) {
    const surat = await Database.rawQuery(
      `select created_at,status, 'SKTM' as jenis_surat from sktms where pemohon_nik = '${params.nik}'
      union
      select created_at , status, 'SKCK' as jenis_surat from skcks where pemohon_nik = '${params.nik}'
      union
      select created_at, status, 'DOMISILI' as jenis_surat from domisilis where pemohon_nik = '${params.nik}'
      union
      select created_at, status, 'KEHILANGAN KK'as jenis_surat from kehilangan_kks where pemohon_nik = '${params.nik}'
      union 
      select created_at, status, 'SKU' as jenis_surat from skus where pemohon_nik = '${params.nik}'
      union 
      select created_at, status, 'SURAT KETERANGAN' as jenis_surat from surat_keterangans where pemohon_nik = '${params.nik}'
      ORDER BY created_at DESC
      `
    )

    return surat.rows
  }
}
