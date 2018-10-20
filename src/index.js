//@ts-check

const polka = require('polka')
const send = require('@polka/send-type')
const morgan = require('morgan')
const fs = require('fs')
const { exec } = require('child_process')
const dotenv = require('dotenv')
const path = require('path')

const config = require('./config')

const ROOT = path.resolve(__dirname, '../')

dotenv.config({ path: path.join(ROOT, '.env') })

polka()
  .use(morgan('dev'))
  .get('/', (_req, res) => {
    send(res, 200, 'OK')
  })
  .post('/print', async (req, res) => {
    const content = req.body
    const filePath = path.join(ROOT, '../storage/logs', Date.now().toString())
    const printerPath = config.PRINTER_PATH

    try {
      fs.writeFileSync(filePath, content)
      await exec(`copy /n ${filePath} ${printerPath}`)

      const message = `filepath: ${filePath} printed successfully`

      res.send(res, 200, { message }, { 'Content-Type': 'application/json' })
    } catch (error) {
      console.error('something wrong :(', error)
      return send(
        res,
        500,
        JSON.stringify({ error: { message: error.message } }),
        {
          'Content-Type': 'application/json'
        }
      )
    }
  })
  .listen(config.PORT, _err => {
    console.log(`Chisa is listening on localhost:${config.PORT}`)
  })
