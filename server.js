import 'dotenv/config'
import Fastify from 'fastify'
import fastifyTypeorm from 'fastify-typeorm-plugin'

import usersEntity from './src/entities/usersEntity.js'
import tasksEntity from './src/entities/tasksEntity.js'
import tokensEntity from './src/entities/tokensEntity.js'
import boardsEntity from './src/entities/boardsEntity.js'
import taskListsEntity from './src/entities/taskListsEntity.js'

import usersController from './src/controllers/usersController.js'
import boardsConroller from './src/controllers/boardsConroller.js'

import successResponse from './src/utils/successResponses.js'
import { badRequest, unauthorized } from './src/utils/errorResponses.js'
import checkTokenAndGetId from './src/utils/checkToken.js'

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
  entities: [
    usersEntity,
    tasksEntity,
    tokensEntity,
    boardsEntity,
    taskListsEntity,
  ],
  migrations: ['./src/migrations'],
  logging: false,
})

fastify.addHook('onRequest', async (req, reply) => {
  req.resHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, content-type',
    'Access-Control-Allow-Credentials': true,
  }
})

fastify.addHook('preHandler', async (req, reply) => {
  if (req.method === 'OPTIONS') {
    return successResponse(reply, 200, req.resHeaders)
  } else if (!req.url.includes('/api/user')) {
    let userId
    try {
      userId = checkTokenAndGetId(req.headers)
    } catch (err) {
      return unauthorized(
        reply,
        req.resHeaders,
        'Token is invalid or not found',
      )
    }

    req.userId = userId
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
    console.log(error)
    badRequest(reply, req.resHeaders, error)
  }
})

fastify.register(usersController, { prefix: '/api/user' })
fastify.register(boardsConroller, { prefix: '/api/board' })

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server is running on http://localhost:${port}`)
})
