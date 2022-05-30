import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestsController {
    public async testGet() {
        return {
            message: 'Get Request success'
        }
    }

    public async testPost({ request, response }: HttpContextContract) {
        // return response.status(200).json(request.all())
        return response.status(200).json(request.file('kk'))
    }
}
