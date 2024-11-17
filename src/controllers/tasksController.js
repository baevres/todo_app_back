import tasksEntity from '../entities/tasksEntity.js'
import taskListsEntity from '../entities/taskListsEntity.js'

import successResponse from '../utils/successResponses.js'
import { badRequest } from '../utils/errorResponses.js'
import checkOwnerOrInvitedUser from '../utils/checkOwnerOrInvitedUser.js'

import {
  getTodosSchema,
  getTodoByIdSchema,
  createTodoSchema,
  editManyTodosSchema,
  editOrDeleteTodoSchema,
} from '../schemas/todoSchema.js'

const tasksController = (fastify, options, done) => {
  const taskRepository = fastify.orm.getRepository(tasksEntity)
  const taskListsRepository = fastify.orm.getRepository(taskListsEntity)

  // GET
  const getTaskLists = async (taskListId, boardId, userId) => {
    const taskLists = await taskListsRepository
      .createQueryBuilder('task_lists')
      .select(['task_lists.id', 'task_lists.title'])
      .innerJoin('task_lists.boards', 'boards')
      .innerJoin('boards.users', 'users')
      .where('task_lists.id = :taskListId', { taskListId })
      .andWhere('task_lists.board_id = :boardId', { boardId })
      .leftJoin('boards.invited_users', 'shared_boards')
      .andWhere(checkOwnerOrInvitedUser(userId))
      .orderBy('task_lists.id', 'ASC')
      .getMany()

    return taskLists
  }

  fastify.get('/', { schema: getTodosSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.taskListId
    const queryParams = req.query

    const queryBuilder = await taskRepository
      .createQueryBuilder('tasks')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.checked',
        'tasks.task_list_id',
      ])
      .innerJoin('tasks.task_lists', 'task_lists')
      .innerJoin('task_lists.boards', 'boards')
      .innerJoin('boards.users', 'users')
      .where('tasks.task_list_id = :taskListId', { taskListId })
      .andWhere('task_lists.board_id = :boardId', { boardId })
      .leftJoin('boards.invited_users', 'shared_boards')
      .andWhere(checkOwnerOrInvitedUser(userId))

    if (queryParams.checked != undefined) {
      queryBuilder.andWhere('tasks.checked = :checked', {
        checked: queryParams.checked,
      })
    }

    const tasks = await queryBuilder.orderBy('tasks.id', 'ASC').getMany()

    return successResponse(reply, 200, headers, tasks)
  })

  fastify.get('/:id', { schema: getTodoByIdSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.taskListId
    const taskId = req.params.id

    const tasks = await taskRepository
      .createQueryBuilder('tasks')
      .select([
        'tasks.id',
        'tasks.title',
        'tasks.checked',
        'tasks.task_list_id',
      ])
      .innerJoin('tasks.task_lists', 'task_lists')
      .innerJoin('task_lists.boards', 'boards')
      .innerJoin('boards.users', 'users')
      .where('tasks.id = :taskId', { taskId })
      .andWhere('tasks.task_list_id = :taskListId', { taskListId })
      .andWhere('task_lists.board_id = :boardId', { boardId })
      .leftJoin('boards.invited_users', 'shared_boards')
      .andWhere(checkOwnerOrInvitedUser(userId))
      .orderBy('tasks.id', 'ASC')
      .getMany()

    return successResponse(reply, 200, headers, tasks)
  })

  // POST
  fastify.post('/', { schema: createTodoSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.taskListId

    const taskLists = await getTaskLists(taskListId, boardId, userId)
    if (taskLists.length === 0) {
      return badRequest(reply, headers, null)
    }

    const { title, checked } = req.body
    const newTask = await taskRepository.create({
      title,
      checked,
      task_list_id: taskListId,
    })
    const task = await taskRepository.save(newTask)
    const data = [
      {
        id: task.id,
        title: task.title,
        checked: task.checked,
        task_list_id: +task.task_list_id,
      },
    ]

    return successResponse(reply, 201, headers, data)
  })

  // PUT
  fastify.put('/', { schema: editManyTodosSchema }, async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.taskListId

    const taskLists = await getTaskLists(taskListId, boardId, userId)
    if (taskLists.length === 0) {
      return badRequest(reply, headers, null)
    }

    if (Array.isArray(req.body)) {
      const ids = []
      for (const body of req.body) {
        const { id, checked, task_list_id } = body

        await taskRepository.update(
          {
            id,
            task_list_id: taskListId,
          },
          {
            checked,
            task_list_id,
          },
        )

        ids.push({ id })
      }

      const tasks = await taskRepository.find({
        select: ['id', 'title', 'checked', 'task_list_id'],
        where: ids,
        order: {
          id: 'ASC',
        },
      })
      return successResponse(reply, 200, headers, tasks)
    }
  })

  fastify.put(
    '/:id',
    { schema: editOrDeleteTodoSchema },
    async (req, reply) => {
      const headers = req.resHeaders
      const userId = req.userId
      const boardId = req.params.boardId
      const taskListId = req.params.taskListId
      const taskId = req.params.id

      const taskLists = await getTaskLists(taskListId, boardId, userId)
      if (taskLists.length === 0) {
        return badRequest(reply, headers, null)
      }

      const { id, title, checked } = req.body
      if (taskId != id) return badRequest(reply, headers, null)

      await taskRepository.update(
        {
          id,
          task_list_id: taskListId,
        },
        {
          title,
          checked,
        },
      )
      const tasks = await taskRepository.find({
        select: ['id', 'title', 'checked', 'task_list_id'],
        where: {
          id,
          task_list_id: taskListId,
        },
      })

      return successResponse(reply, 200, headers, tasks)
    },
  )

  // DELETE
  fastify.delete('/', async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.taskListId

    const taskLists = await getTaskLists(taskListId, boardId, userId)
    if (taskLists.length === 0) {
      return badRequest(reply, headers, null)
    }

    const raw = await taskRepository
      .createQueryBuilder()
      .delete()
      .from('tasks')
      .where('task_list_id = :taskListId', { taskListId })
      .execute()
    const deleted = [{ deleted: raw.affected }]

    return successResponse(reply, 200, headers, deleted)
  })

  fastify.delete(
    '/:id',
    { schema: editOrDeleteTodoSchema },
    async (req, reply) => {
      const headers = req.resHeaders
      const userId = req.userId
      const boardId = req.params.boardId
      const taskListId = req.params.taskListId
      const taskId = req.params.id

      const taskLists = await getTaskLists(taskListId, boardId, userId)
      if (taskLists.length === 0) {
        return badRequest(reply, headers, null)
      }

      const { id } = req.body
      if (taskId != id) return badRequest(reply, headers, null)

      const task = await taskRepository.find({
        select: ['id', 'title', 'checked', 'task_list_id'],
        where: {
          id,
          task_list_id: taskListId,
        },
      })

      if (task.length < 1) return badRequest(reply, headers, null)
      await taskRepository.delete(task[0].id)

      return successResponse(reply, 200, headers, task)
    },
  )

  done()
}

export default tasksController
