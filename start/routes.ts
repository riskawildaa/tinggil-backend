/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
// import CheckRole from 'App/Middleware/CheckRole'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/auth/register', 'UsersController.register')
Route.post('/auth/login', 'UsersController.login')
Route.post('/auth/logout', 'UsersController.logout')
Route.get('/auth/user', 'UsersController.me')
Route.get('/auth/check', 'UsersController.check')

Route.get('/check', async () => {
  return 'berhasil'
}).middleware(['auth', 'checkRole'])

Route.group(() => {
  Route.resource('pemohon', 'PemohonsController').except(['update', 'show', 'destroy']).apiOnly()
  Route.get('/pemohon/all', 'PemohonsController.getAll')
  Route.get('/pemohon/:nik', 'PemohonsController.show')
  Route.get('/pemohon/byId/:id', 'PemohonsController.showById')
  Route.get('/pemohon/getSurat/:nik', 'PemohonsController.getSurat')
  Route.post('/pemohon/upload-kk/', 'PemohonsController.uploadKK')
  Route.put('/pemohon/:nik', 'PemohonsController.update')
  Route.delete('/pemohon/:nik', 'PemohonsController.destroy')
  Route.resource('sktm', 'SktmsController').except(['update']).apiOnly()
  Route.put('/sktm/status/:id', 'SktmsController.updateStatus')
  Route.get('/sktm/all', 'SktmsController.getAll')
  Route.resource('domisili', 'DomisilisController').apiOnly()
  Route.get('/domisili/all', 'DomisilisController.getAll')
  Route.put('/domisili/status/:id', 'DomisilisController.updateStatus')
  Route.resource('sku', 'SkusController').apiOnly()
  Route.put('/sku/status/:id', 'SkusController.updateStatus')
  Route.resource('skck', 'SkcksController').apiOnly()
  Route.put('/skck/status/:id', 'SkcksController.updateStatus')
  Route.resource('surat-keterangan', 'SuratKeterangansController').apiOnly()
  Route.put('/surat-keterangan/status/:id', 'SuratKeterangansController.updateStatus')
  Route.resource('kehilangan-kk', 'KehilanganKksController').apiOnly()
  Route.put('/kehilangan-kk/status/:id', 'KehilanganKksController.updateStatus')
}).middleware('auth')

Route.get('/testApi', 'TestsController.testGet')
Route.post('/testPost', 'TestsController.testPost')
