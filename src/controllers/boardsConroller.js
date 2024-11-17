import boardsEntity from '../entities/boardsEntity.js'
import tasksEntity from '../entities/tasksEntity.js'

import taskListsController from './taskListsController.js'

import successResponse from '../utils/successResponses.js'
import { badRequest } from '../utils/errorResponses.js'
import checkOwnerOrInvitedUser from '../utils/checkOwnerOrInvitedUser.js'

const boardsController = (fastify, options, done) => {
  const boardsRepository = fastify.orm.getRepository(boardsEntity)
  const taskRepository = fastify.orm.getRepository(tasksEntity)
  const dataSource = fastify.orm

  fastify.register(taskListsController, {
    prefix: '/:boardId/task-list',
  })

  // GET
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

    const boards = await boardsRepository
      .createQueryBuilder('boards')
      .leftJoin('boards.invited_users', 'shared_boards')
      .leftJoin('boards.users', 'users')
      .select([
        'boards.id',
        'boards.title',
        'boards.user_id',
        'users.id',
        'users.name',
        'users.email',
      ])
      .where('boards.id = :boardId', { boardId })
      .andWhere(checkOwnerOrInvitedUser(userId))
      .orderBy('boards.id', 'ASC')
      .getMany()

    return successResponse(reply, 200, headers, boards)
  })

  fastify.get('/:id/invited-users', async (req, reply) => {
    const boardId = req.params.id
    const userId = req.userId
    const headers = req.resHeaders

    const boards = await boardsRepository
      .createQueryBuilder('boards')
      .leftJoin('boards.invited_users', 'shared_boards')
      .select([
        'boards.id',
        'boards.title',
        'shared_boards.id',
        'shared_boards.email',
        'shared_boards.name',
      ])
      .where('boards.id = :boardId', { boardId })
      .getMany()

    return successResponse(reply, 200, headers, boards)
  })

  fastify.get('/:id/board-task', async (req, reply) => {
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
      .where('task_lists.board_id = :boardId', { boardId })
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

  // POST
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

  // PUT
  fastify.put('/:id', async (req, reply) => {
    const headers = req.resHeaders
    const boardId = req.params.id
    const userId = req.userId

    const { id, title, closed } = req.body
    if (boardId != id) return badRequest(reply, headers, null)

    const boards = await boardsRepository
      .createQueryBuilder('boards')
      .leftJoin('boards.invited_users', 'shared_boards')
      .select(['boards.id', 'boards.title'])
      .where('boards.id = :boardId', { boardId })
      .andWhere(checkOwnerOrInvitedUser(userId))
      .getMany()

    if (boards.length === 0) {
      return badRequest(reply, headers, null)
    }

    const queryBuilder = await dataSource
      .createQueryBuilder()
      .update(boardsEntity)
      .set({ title, closed })
      .where('id = :id', { id })

    await queryBuilder.execute()

    const updatedBoards = await boardsRepository.find({
      select: ['id', 'title', 'closed'],
      where: {
        id,
      },
    })

    return successResponse(reply, 200, headers, updatedBoards)
  })

  // DELETE
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
