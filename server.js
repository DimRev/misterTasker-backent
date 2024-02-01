import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import http from 'http'
import { config } from 'dotenv'

config()

import { loggerService } from './services/logger.service.js'
loggerService.info('server.js loaded...')

const app = express()
const server = http.createServer(app)

//Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

import { taskRoutes } from './api/object/task.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

setupSocketAPI(server)

app.use('/api/task', taskRoutes)

const port = process.env.PORT || 3030

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

server.listen(port, () => {
  loggerService.info('Server is running on port: ' + port)
})
