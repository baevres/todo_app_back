import { parse } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import getClient from '../../connections.js'

class UsersModel {
  #getParamtId = (req, param = 'user') => {
    const parsed = req.url.split(param + '/')
    return +parsed[1].split('/')[0]
  }

  #createHashedPassword = (password) => {
    const saltRounds = process.env.HASH_ROUNDS
    const userSalt = bcrypt.genSaltSync(+saltRounds)
    const hashedPassword = this.#generateHashedPassword(password, userSalt)

    return { hashedPassword, salt: userSalt }
  }

  #generateHashedPassword = (password, salt) => {
    const hashRound1 = bcrypt.hashSync(password, salt)
    const hashRound2 = bcrypt.hashSync(hashRound1, process.env.GLOBAL_SALT)
    return hashRound2
  }

  #generateNewTokens = (userData) => {
    const { id, name } = userData
    const secretKey = process.env.SECRET_KEY
    const refreshSecretKey = process.env.REFRESH_SECRET_KEY
    const accessToken = jwt.sign({ userId: id, name }, secretKey, {
      expiresIn: '15m',
    })
    const refreshToken = jwt.sign({ userId: id, name }, refreshSecretKey, {
      expiresIn: '7d',
    })

    return { accessToken, refreshToken }
  }

  #verifyRefreshToken = (token) => {
    const refreshSecretKey = process.env.REFRESH_SECRET_KEY

    return jwt.verify(token, refreshSecretKey, (err, decoded) => {
      if (err) {
        throw err
      }
      const userData = {
        id: decoded.userId,
        name: decoded.name,
      }
      const newTokens = this.#generateNewTokens(userData)
      return newTokens
    })
  }

  getUser = async (req, res) => {
    const usertId = this.#getParamtId(req)

    const client = getClient()
    await client.connect()
    const user = await client.query(
      'SELECT id, email, password FROM users WHERE id = $1 ORDER BY id',
      [usertId],
    )
    await client.end()

    if (user.rows.length === 0) return 'User not found'

    return user.rows
  }

  getUsersUniqueData = async (req, res) => {
    const queryParams = parse(req.url, true)

    const client = getClient()
    await client.connect()
    try {
      let user
      if (queryParams.search) {
        if (queryParams.query.email) {
          user = await client.query(
            'SELECT email FROM users WHERE email = $1 ORDER BY id',
            [queryParams.query.email],
          )
        } else if (queryParams.query.login) {
          user = await client.query(
            'SELECT login FROM users WHERE login = $1 ORDER BY id',
            [queryParams.query.login],
          )
        }
      }

      await client.end()

      return user.rows
    } catch (err) {
      await client.end()
      return null
    }
  }

  authUser = async (req, res) => {
    req.on('data', async (chunk) => {
      req.body = await JSON.parse(Buffer.from(chunk, 'binary').toString('utf8'))
    })

    const client = getClient()
    await client.connect()
    try {
      const { email, password } = req.body

      const user = await client.query(
        'SELECT id, name, email, password, salt FROM users WHERE email = $1 ORDER BY id',
        [email],
      )

      if (user.rows.length === 0) return 'User not found'

      const userPassword = user.rows[0].password
      const userSalt = user.rows[0].salt
      const recievedPasswordHash = this.#generateHashedPassword(
        password,
        userSalt,
      )

      if (recievedPasswordHash === userPassword) {
        await client.end()
        const tokens = this.#generateNewTokens({
          id: user.rows[0].id,
          name: user.rows[0].name,
        })
        return {
          id: user.rows[0].id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }
      }

      throw err
    } catch (err) {
      await client.end()
      return null
    }
  }

  refreshToken = async (req, res) => {
    const cookies = req.headers.cookie.split('; ')
    const refreshToken = cookies
      .find((cookie) => cookie.split('=')[0] === 'refreshToken')
      .split('=')[1]

    try {
      const tokens = this.#verifyRefreshToken(refreshToken)
      return tokens
    } catch (err) {
      return 'Unauthorized'
    }
  }

  createUser = async (req, res) => {
    req.on('data', async (chunk) => {
      req.body = await JSON.parse(Buffer.from(chunk, 'binary').toString('utf8'))
    })

    const client = getClient()
    await client.connect()
    try {
      const { name, age, link, gender, phone, login, email, password } =
        req.body

      const { hashedPassword, salt } = this.#createHashedPassword(password)
      const user = await client.query(
        'INSERT INTO users (name, age, link, gender, phone, login, email, password, salt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;',
        [name, age, link, gender, phone, login, email, hashedPassword, salt],
      )

      await client.end()
      return user.rows[0]
    } catch (err) {
      await client.end()
      return null
    }
  }

  notFound = () => {
    return 'Path not found'
  }
}

export default UsersModel
