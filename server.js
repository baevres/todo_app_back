import 'dotenv/config'
import http from 'http'

import router from './routes/router.js'

const host = 'localhost'
const port = 5555

const requestListener = async function (req, res) {
  const url = req.url

  if (url.indexOf('/api/') > -1) {
    let data
    const header = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:2525',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, content-type',
      'Access-Control-Allow-Credentials': true,
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(200, header)
      res.end()
    }
    try {
      data = await router(req, res)
      if (data && typeof data != 'string') {
        if (data.refreshToken) {
          res.setHeader(
            'Set-Cookie',
            `refreshToken=${data.refreshToken}; Path=/; HttpOnly`,
          )
        }
        res.writeHead(200, header)
        res.end(JSON.stringify(data))
      } else if (typeof data === 'string') {
        switch (data) {
          case 'Unauthorized':
            res.writeHead(401, header)
            data = {
              message: 'Token is invalid or not found',
              type: 'error',
              status: 401,
              reason: 'Unauthorized',
            }
            res.end(JSON.stringify(data))
            break
          case 'Forbidden':
            res.writeHead(403, header)
            data = {
              message: 'The current task does not belong to the user',
              type: 'error',
              status: 403,
              reason: data,
            }
            res.end(JSON.stringify(data))
            break
          case 'Path not found':
            res.writeHead(404, header)
            data = {
              message: data,
              type: 'error',
              status: 404,
              reason: 'Not found',
            }
            res.end(JSON.stringify(data))
            break
          case 'User not found':
            res.writeHead(404, header)
            data = {
              message: 'Username and password do not match',
              type: 'error',
              status: 404,
              reason: 'Not found',
            }
            res.end(JSON.stringify(data))
            break
          default:
            res.writeHead(400, header)
            data = {
              message: 'Invalid data',
              type: 'error',
              status: 400,
              reason: 'Bad request',
              error: data,
            }
            res.end(JSON.stringify(data))
            break
        }
      } else {
        res.writeHead(400, header)
        data = {
          message: 'Invalid data',
          type: 'error',
          status: 400,
          reason: 'Bad request',
          error: data,
        }
        res.end(JSON.stringify(data))
      }
    } catch (error) {
      console.error(error)
      res.writeHead(500, header)
      data = {
        message: 'Internal Server Error',
        type: 'error',
        status: 500,
      }
      res.end(JSON.stringify(data))
    }
  }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
