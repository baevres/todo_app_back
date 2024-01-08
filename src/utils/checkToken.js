import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const checkTokenAndGetId = (headers) => {
  const authorization = headers.authorization.replace('Bearer ', '')
  if (!authorization) throw err
  const data = verifyAccessToken(authorization)
  return data.userId
}

const verifyAccessToken = (token) => {
  const secretKey = process.env.SECRET_KEY

  return jwt.verify(token, secretKey, function (err, decoded) {
    if (err) {
      throw err
    }
    return decoded
  })
}

const createHashedPassword = (password) => {
  const saltRounds = process.env.HASH_ROUNDS
  const userSalt = bcrypt.genSaltSync(+saltRounds)
  const hashedPassword = generateHashedPassword(password, userSalt)

  return { hashedPassword, salt: userSalt }
}

const generateHashedPassword = (password, salt) => {
  const hashRound1 = bcrypt.hashSync(password, salt)
  const hashRound2 = bcrypt.hashSync(hashRound1, process.env.GLOBAL_SALT)
  return hashRound2
}

const generateNewTokens = (userData) => {
  const { id, name } = userData
  const secretKey = process.env.SECRET_KEY
  const refreshSecretKey = process.env.REFRESH_SECRET_KEY
  const accessToken = jwt.sign({ userId: id, name }, secretKey, {
    expiresIn: '5m',
  })
  const refreshToken = jwt.sign({ userId: id, name }, refreshSecretKey, {
    expiresIn: '7d',
  })

  return { accessToken, refreshToken }
}

const verifyToken = (token) => {
  const refreshSecretKey = process.env.REFRESH_SECRET_KEY

  return jwt.verify(token, refreshSecretKey, (err, decoded) => {
    if (err) {
      throw err
    }
    const userData = {
      id: decoded.userId,
      name: decoded.name,
    }
    return userData
  })
}

export default checkTokenAndGetId
export {
  createHashedPassword,
  generateHashedPassword,
  generateNewTokens,
  verifyToken,
}
