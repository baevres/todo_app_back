import 'dotenv/config'
import Fastify from 'fastify'
import fastifyTypeorm from 'fastify-typeorm-plugin'

import userEntity from './src/entities/usersEntity.js'
import taskEntity from './src/entities/tasksEntity.js'
import tokensEntity from './src/entities/tokensEntity.js'

import usersController from './src/controllers/usersController.js'
import todosController from './src/controllers/todosController.js'

import successResponse from './src/utils/successResponses.js'
import { badRequest } from './src/utils/errorResponses.js'

const port = 5555
const fastify = Fastify({
  logger: true,
})

fastify.register(fastifyTypeorm, {
  type: 'postgres',
  user: 'postgres',
  host: 'localhost',
  port: 5050,
  database: process.env.POSTGRES_CLIENT_DATABASE,
  password: process.env.POSTGRES_CLIENT_PASSWORD,
  entities: [userEntity, taskEntity, tokensEntity],
  migrations: ['./src/migrations'],
  logging: false,
})

fastify.addHook('onRequest', async (req, reply) => {
  req.resHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:2525',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, content-type',
    'Access-Control-Allow-Credentials': true,
  }
})

fastify.addHook('preHandler', async (req, reply) => {
  if (req.method === 'OPTIONS') {
    return successResponse(reply, 200, req.resHeaders)
  }
})

fastify.setErrorHandler((error, req, reply) => {
  if (error.validation) {
    badRequest(
      reply,
      req.resHeaders,
      `validation error - ${error.validation[0].message}`,
    )
  } else {
    badRequest(reply, req.resHeaders, error)
  }
})

fastify.register(usersController, { prefix: '/api/user' })
fastify.register(todosController, { prefix: '/api/todo' })

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server is running on http://localhost:${port}`)
})
