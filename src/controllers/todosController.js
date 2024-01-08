import successResponse from '../utils/successResponses.js'
import { badRequest, unauthorized } from '../utils/errorResponses.js'
import checkTokenAndGetId from '../utils/checkToken.js'

import taskEntity from '../entities/tasksEntity.js'

import {
  getTodosSchema,
  getTodoByIdSchema,
  createTodoSchema,
  editManyTodosSchema,
  editOrDeleteTodoSchema,
} from '../schemas/todoSchema.js'

const todosController = (fastify, options, done) => {
  const taskRepository = fastify.orm.getRepository(taskEntity)

  fastify.addHook('preHandler', async (req, reply) => {
    if (req.method !== 'OPTIONS') {
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

  // get
  fastify.get('/', { schema: getTodosSchema }, async (req, reply) => {
    const queryParams = req.query
    const userId = req.userId
    const headers = req.resHeaders

    let todos
    if (queryParams.checked != undefined) {
      todos = await taskRepository.find({
        select: ['id', 'title', 'checked'],
        where: {
          userid: userId,
          checked: queryParams.checked,
        },
        order: {
          id: 'ASC',
        },
      })
    } else {
      todos = await taskRepository.find({
        select: ['id', 'title', 'checked'],
        where: {
          userid: userId,
        },
        order: {
          id: 'ASC',
        },
      })
    }

    return successResponse(reply, 200, headers, todos)
  })

  fastify.get('/:id', { schema: getTodoByIdSchema }, async (req, reply) => {
    const todoId = req.params.id
    const userId = req.userId
    const headers = req.resHeaders

    const todos = await taskRepository.find({
      select: ['id', 'title', 'checked'],
      where: {
        id: todoId,
        userid: userId,
      },
    })

    return successResponse(reply, 200, headers, todos)
  })

  // post
  fastify.post('/', { schema: createTodoSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId

    const { title, checked } = req.body
    const newTodo = await taskRepository.create({
      title,
      checked,
      userid: userId,
    })
    const todo = await taskRepository.save(newTodo)
    const data = [
      {
        id: todo.id,
        title: todo.title,
        checked: todo.checked,
      },
    ]

    return successResponse(reply, 201, headers, data)
  })

  // put
  fastify.put('/', { schema: editManyTodosSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId

    if (Array.isArray(req.body)) {
      const ids = []
      for (const body of req.body) {
        const { id, checked } = body

        await taskRepository.update(
          {
            id,
            userid: userId,
          },
          {
            checked,
          },
        )

        ids.push({ id })
      }

      const todos = await taskRepository.find({
        select: ['id', 'title', 'checked'],
        where: ids,
        order: {
          id: 'ASC',
        },
      })
      return successResponse(reply, 200, headers, todos)
    }
  })

  fastify.put(
    '/:id',
    { schema: editOrDeleteTodoSchema },
    async (req, reply) => {
      const headers = req.resHeaders
      const todoId = req.params.id
      const userId = req.userId

      const { id, title, checked } = req.body
      if (todoId != id) return badRequest(reply, headers, null)

      await taskRepository.update(
        {
          id,
          userid: userId,
        },
        {
          title,
          checked,
        },
      )
      const todos = await taskRepository.find({
        select: ['id', 'title', 'checked'],
        where: {
          id,
          userid: userId,
        },
      })

      return successResponse(reply, 200, headers, todos)
    },
  )

  // delete
  fastify.delete(
    '/:id',
    { schema: editOrDeleteTodoSchema },
    async (req, reply) => {
      const headers = req.resHeaders
      const todoId = req.params.id
      const userId = req.userId

      const { id } = req.body
      if (todoId != id) return badRequest(reply, headers, null)

      const todo = await taskRepository.find({
        select: ['id', 'title', 'checked'],
        where: {
          id,
          userid: userId,
        },
      })
      if (todo.length < 1) return badRequest(reply, headers, null)
      await taskRepository.delete(todo[0].id)

      return successResponse(reply, 200, headers, todo)
    },
  )

  done()
}

export default todosController
