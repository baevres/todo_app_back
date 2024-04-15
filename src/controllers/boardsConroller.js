import boardsEntity from '../entities/boardsEntity.js'
import tasksEntity from '../entities/tasksEntity.js'

import taskListsController from './taskListsController.js'

import successResponse from '../utils/successResponses.js'
import { unauthorized, notFound, badRequest } from '../utils/errorResponses.js'

const boardsController = (fastify, options, done) => {
  const boardsRepository = fastify.orm.getRepository(boardsEntity)
  const taskRepository = fastify.orm.getRepository(tasksEntity)

  fastify.register(taskListsController, {
    prefix: '/:boardId/task-list',
  })

  fastify.get('/', async (req, reply) => {
    const userId = req.userId
    const headers = req.resHeaders

    const boards = await boardsRepository.find({
      select: ['id', 'title'],
      where: {
        user_id: userId,
      },
      order: {
        id: 'ASC',
      },
    })

    return successResponse(reply, 200, headers, boards)
  })

  fastify.get('/:id', async (req, reply) => {
    const boardId = req.params.id
    const userId = req.userId
    const headers = req.resHeaders

    const boards = await boardsRepository.find({
      select: ['id', 'title'],
      where: {
        id: boardId,
        user_id: userId,
      },
    })

    return successResponse(reply, 200, headers, boards)
  })

  fastify.get('/:id/board-tasks', async (req, reply) => {
    const boardId = req.params.id
    const userId = req.userId
    const headers = req.resHeaders
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
      .where('task_lists.board_id = :boardId', { boardId })
      .andWhere('boards.user_id = :userId', { userId })

    if (queryParams.checked != undefined) {
      queryBuilder.andWhere('tasks.checked = :checked', {
        checked: queryParams.checked,
      })
    }

    const tasks = await queryBuilder.orderBy('tasks.id', 'ASC').getMany()

    return successResponse(reply, 200, headers, tasks)
  })

  // post
  fastify.post('/', async (req, reply) => {
    const headers = req.resHeaders
    const userId = req.userId

    const { title } = req.body
    const newBoard = await boardsRepository.create({
      title,
      user_id: userId,
    })
    const board = await boardsRepository.save(newBoard)
    const data = [
      {
        id: board.id,
        title: board.title,
      },
    ]

    return successResponse(reply, 201, headers, data)
  })

  // put
  fastify.put('/:id', async (req, reply) => {
    const headers = req.resHeaders
    const boardId = req.params.id
    const userId = req.userId

    const { id, title, closed } = req.body
    if (boardId != id) return badRequest(reply, headers, null)

    await boardsRepository.update(
      {
        id,
        user_id: userId,
      },
      {
        title,
        closed,
      },
    )
    const boards = await boardsRepository.find({
      select: ['id', 'title', 'closed'],
      where: {
        id,
        user_id: userId,
      },
    })

    return successResponse(reply, 200, headers, boards)
  })

  // delete
  fastify.delete('/:id', async (req, reply) => {
    const headers = req.resHeaders
    const boardId = req.params.id
    const userId = req.userId

    const { id } = req.body
    if (boardId != id) return badRequest(reply, headers, null)

    const board = await boardsRepository.find({
      select: ['id', 'title'],
      where: {
        id,
        user_id: userId,
      },
    })
    if (board.length < 1) return badRequest(reply, headers, null)
    await boardsRepository.delete(board[0].id)

    return successResponse(reply, 200, headers, board)
  })

  done()
}

export default boardsController
