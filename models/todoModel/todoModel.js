import { parse } from 'url'
import jwt from 'jsonwebtoken'

import getClient from '../../connections.js'

class TodoModel {
  #getParamtId = (req) => {
    const parsed = req.url.split('todo/')
    return +parsed[1].split('/')[0]
  }

  #checkTokenAndGetId = (req) => {
    const authorization = req.headers.authorization.replace('Bearer ', '')
    if (!authorization) throw err
    const data = this.#verifyToken(authorization)
    return data.userId
  }

  #verifyToken = (token) => {
    const secretKey = process.env.SECRET_KEY

    return jwt.verify(token, secretKey, function (err, decoded) {
      if (err) {
        throw err
      }
      return decoded
    })
  }

  #verifyAcceptedTodo = async (todoId, userId, client) => {
    const todos = await client.query(
      'SELECT id FROM tasks WHERE userid = $1 ORDER BY id',
      [userId],
    )

    if (todos.rows.length > 0) {
      const err = []
      todos.rows.forEach((todo) => {
        if (todo.id === todoId) err.push(todo)
      })
      if (err.length === 0) return 'Forbidden'
    }

    return true
  }

  getTodoAll = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const queryParams = parse(req.url, true)
    let todos

    const client = getClient()
    await client.connect()
    if (queryParams.search) {
      todos = await client.query(
        'SELECT id, title, checked FROM tasks WHERE userid = $1 AND checked = $2 ORDER BY id',
        [userId, queryParams.query.checked],
      )
    } else {
      todos = await client.query(
        'SELECT id, title, checked FROM tasks WHERE userid = $1 ORDER BY id',
        [userId],
      )
    }
    await client.end()

    return todos.rows
  }

  getTodo = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const todoId = this.#getParamtId(req)

    const client = getClient()
    await client.connect()
    const check = await this.#verifyAcceptedTodo(todoId, userId, client)
    if (check === 'Forbidden') {
      await client.end()
      return 'Forbidden'
    }
    const todos = await client.query(
      'SELECT id, title, checked FROM tasks WHERE userid = $1 AND id = $2',
      [userId, todoId],
    )
    await client.end()

    return todos.rows
  }

  createTodo = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const client = getClient()
    req.on('data', async (chunk) => {
      req.body = await JSON.parse(Buffer.from(chunk, 'binary').toString('utf8'))
    })

    await client.connect()

    try {
      const { title, checked } = req.body
      const todos = await client.query(
        'INSERT INTO tasks (title, checked, userid) VALUES ($1, $2, $3) RETURNING id, title, checked',
        [title, checked, userId],
      )
      await client.end()
      return todos.rows[0]
    } catch (err) {
      await client.end()
      return null
    }
  }

  updateTodo = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const todoId = this.#getParamtId(req)

    const client = getClient()
    req.on('data', async (chunk) => {
      req.body = await JSON.parse(Buffer.from(chunk, 'binary').toString('utf8'))
    })

    await client.connect()
    const check = await this.#verifyAcceptedTodo(todoId, userId, client)
    if (check === 'Forbidden') {
      await client.end()
      return 'Forbidden'
    }

    try {
      const { title, checked } = req.body
      const todos = await client.query(
        'UPDATE tasks SET title = $1, checked = $2 WHERE id = $3 AND userid = $4 RETURNING id, title, checked',
        [title, checked, todoId, userId],
      )
      await client.end()
      return todos.rows[0]
    } catch (err) {
      await client.end()
      return null
    }
  }

  updateMultipleTodos = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const client = getClient()
    req.on('data', async (chunk) => {
      req.body = await JSON.parse(Buffer.from(chunk, 'binary').toString('utf8'))
    })

    await client.connect()

    try {
      if (Array.isArray(req.body)) {
        const todos = []
        let todo
        for (const body of req.body) {
          const { id, checked } = body

          const check = await this.#verifyAcceptedTodo(id, userId, client)
          if (check === 'Forbidden') {
            await client.end()
            return 'Forbidden'
          }

          todo = await client.query(
            `UPDATE tasks SET checked = $1 WHERE id = $2 AND userid = $3 RETURNING id, title, checked;`,
            [checked, id, userId],
          )
          todos.push(todo.rows[0])
        }
        await client.end()
        return todos
      }

      throw err
    } catch (err) {
      await client.end()
      return null
    }
  }

  deleteTodo = async (req, res) => {
    let userId
    try {
      userId = this.#checkTokenAndGetId(req)
    } catch (err) {
      return 'Unauthorized'
    }

    const todoId = this.#getParamtId(req)

    const client = getClient()
    await client.connect()
    const check = await this.#verifyAcceptedTodo(todoId, userId, client)
    if (check === 'Forbidden') {
      await client.end()
      return 'Forbidden'
    }

    const todos = await client.query(
      'DELETE FROM tasks WHERE id = $1 AND userid = $2 RETURNING id, title, checked',
      [todoId, userId],
    )
    await client.end()

    return todos.rows[0]
  }

  notFound = () => {
    return 'Path not found'
  }
}

export default TodoModel
