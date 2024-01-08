import userEntity from '../entities/usersEntity.js'
import tokensEntity from '../entities/tokensEntity.js'

import successResponse from '../utils/successResponses.js'
import { unauthorized, notFound } from '../utils/errorResponses.js'
import {
  createHashedPassword,
  generateHashedPassword,
  generateNewTokens,
  verifyToken,
} from '../utils/checkToken.js'

import {
  getUserByQuerySchema,
  getUserById,
  createUserSchema,
  authSchema,
  refreshSchema,
  logoutSchema,
} from '../schemas/userSchema.js'

const usersController = (fastify, options, done) => {
  const userRepository = fastify.orm.getRepository(userEntity)
  const tokensRepository = fastify.orm.getRepository(tokensEntity)

  fastify.get('/', { schema: getUserByQuerySchema }, async (req, reply) => {
    const queryParams = req.query
    const headers = req.resHeaders

    let user
    if (queryParams) {
      if (queryParams.email) {
        user = await userRepository.findOne({
          select: ['email'],
          where: {
            email: queryParams.email,
          },
        })
      } else if (queryParams.login) {
        user = await userRepository.findOne({
          select: ['login'],
          where: {
            login: queryParams.login,
          },
        })
      }
    }
    const data = user ? [user] : []
    return successResponse(reply, 200, headers, data)
  })

  fastify.get('/:id', { schema: getUserById }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.params.id

    const user = await userRepository.find({
      select: ['id', 'email', 'name'],
      where: {
        id: userId,
      },
    })

    if (user.length === 0) return notFound(reply, headers, 'User not found')

    return successResponse(reply, 200, headers, user)
  })

  fastify.post('/create', { schema: createUserSchema }, async (req, reply) => {
    const headers = req.resHeaders

    const { name, age, link, gender, phone, login, email, password } = req.body
    const { hashedPassword, salt } = createHashedPassword(password)

    const newUser = await userRepository.create({
      name,
      age,
      link,
      gender,
      phone,
      login,
      email,
      password: hashedPassword,
      salt,
    })
    const user = await userRepository.save(newUser)
    const data = [{ id: user.id }]

    return successResponse(reply, 201, headers, data)
  })

  fastify.post('/auth', { schema: authSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const { email, password } = req.body

    const user = await userRepository.find({
      select: ['id', 'name', 'email', 'password', 'salt'],
      where: {
        email,
      },
    })

    if (user.length === 0) return notFound(reply, headers, 'User not found')

    const userPassword = user[0].password
    const userSalt = user[0].salt
    const recievedPasswordHash = generateHashedPassword(password, userSalt)

    if (recievedPasswordHash === userPassword) {
      const tokens = generateNewTokens({
        id: user[0].id,
        name: user[0].name,
      })
      const newHeaders = {
        ...headers,
        'Set-Cookie': `refreshToken=${tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=None`,
      }
      const data = [
        {
          id: user[0].id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      ]
      await tokensRepository.insert({
        token: tokens.refreshToken,
        userid: user[0].id,
      })

      return successResponse(reply, 200, newHeaders, data)
    }
  })

  fastify.post(
    '/auth/refresh',
    { schema: refreshSchema },
    async (req, reply) => {
      const headers = req.resHeaders
      const cookies = req.headers.cookie.split('; ')
      const refreshToken = cookies
        .find((cookie) => cookie.split('=')[0] === 'refreshToken')
        .split('=')[1]

      try {
        const userData = verifyToken(refreshToken)
        const tokensFromDB = await tokensRepository.find({
          select: ['token'],
          where: {
            userid: userData.id,
          },
        })
        const matchedToken = tokensFromDB.filter(
          ({ token }) => token === refreshToken,
        )

        if (tokensFromDB.length === 0 || matchedToken.length === 0) {
          throw error
        }

        const tokens = generateNewTokens(userData)
        await tokensRepository.insert({
          token: tokens.refreshToken,
          userid: userData.id,
        })

        const newHeaders = {
          ...headers,
          'set-cookie': `refreshToken=${tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=None`,
        }

        successResponse(reply, 200, newHeaders, [tokens])
      } catch (err) {
        unauthorized(reply, headers, 'Token is invalid or not found')
      } finally {
        await tokensRepository.delete({
          token: refreshToken,
        })
      }
    },
  )

  fastify.post('/logout', { schema: logoutSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const cookies = req.headers.cookie.split('; ')
    const refreshToken = cookies
      .find((cookie) => cookie.split('=')[0] === 'refreshToken')
      .split('=')[1]

    try {
      const userData = verifyToken(refreshToken)
      const tokens = await tokensRepository.find({
        select: ['id'],
        where: {
          userid: userData.id,
        },
      })
      const tokensLength = tokens.length
      await tokensRepository.delete(tokens)
      successResponse(reply, 200, headers, [`Deleted ${tokensLength} items`])
    } catch (err) {
      await tokensRepository.delete({
        token: refreshToken,
      })
      unauthorized(reply, headers, 'Token is invalid or not found')
    }
  })

  done()
}

export default usersController
