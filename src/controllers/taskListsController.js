import taskListsEntity from '../entities/taskListsEntity.js'
import boardsEntity from '../entities/boardsEntity.js'

import tasksController from './tasksController.js'

import successResponse from '../utils/successResponses.js'
import { unauthorized, notFound, badRequest } from '../utils/errorResponses.js'
import checkOwnerOrInvitedUser from '../utils/checkOwnerOrInvitedUser.js'

const taskListsController = (fastify, options, done) => {
  const taskListsRepository = fastify.orm.getRepository(taskListsEntity)
  const boardsRepository = fastify.orm.getRepository(boardsEntity)

  fastify.register(tasksController, {
    prefix: '/:taskListId/task',
  })

  // GET
  const getBoards = async (boardId, userId) => {
    const boards = await boardsRepository
      .createQueryBuilder('boards')
      .leftJoin('boards.invited_users', 'shared_boards')
      .select(['boards.id', 'boards.title'])
      .where('boards.id = :boardId', { boardId })
      .andWhere(checkOwnerOrInvitedUser(userId))
      .getMany()

    return boards
  }

  fastify.get('/', async (req, reply) => {
    const userId = req.userId
    const boardId = req.params.boardId
    const headers = req.resHeaders

    const taskLists = await taskListsRepository
      .createQueryBuilder('task_lists')
      .select(['task_lists.id', 'task_lists.title'])
      .innerJoin('task_lists.boards', 'boards')
      .innerJoin('boards.users', 'users')
      .where('task_lists.board_id = :boardId', { boardId })
      .leftJoin('boards.invited_users', 'shared_boards')
      .andWhere(checkOwnerOrInvitedUser(userId))
      .orderBy('task_lists.id', 'ASC')
      .getMany()

    return successResponse(reply, 200, headers, taskLists)
  })

  fastify.get('/:id', async (req, reply) => {
    const userId = req.userId
    const boardId = req.params.boardId
    const taskListId = req.params.id
    const headers = req.resHeaders

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

    return successResponse(reply, 200, headers, taskLists)
  })

  // POST
  fastify.post('/', async (req, reply) => {
    const userId = req.userId
    const boardId = req.params.boardId
    const headers = req.resHeaders

    const boards = await getBoards(boardId, userId)
    if (boards.length === 0) {
      return badRequest(reply, headers, null)
    }

    const { title } = req.body
    const newTaskList = await taskListsRepository.create({
      title,
      board_id: boardId,
    })
    const taskList = await taskListsRepository.save(newTaskList)
    const data = [
      {
        id: taskList.id,
        title: taskList.title,
      },
    ]

    return successResponse(reply, 201, headers, data)
  })

  // PUT
  fastify.put('/:id', async (req, reply) => {
    const userId = req.userId
    const boardId = req.params.boardId
    const headers = req.resHeaders
    const taskListId = req.params.id

    const boards = await getBoards(boardId, userId)
    if (boards.length === 0) {
      return badRequest(reply, headers, null)
    }

    const { id, title, board_id } = req.body
    if (taskListId != id) return badRequest(reply, headers, null)

    await taskListsRepository.update(
      {
        id,
        board_id: boardId,
      },
      {
        title,
        board_id,
      },
    )
    const taskLists = await taskListsRepository.find({
      select: ['id', 'title', 'board_id'],
      where: {
        id,
        board_id: boardId,
      },
    })

    return successResponse(reply, 200, headers, taskLists)
  })

  // DELETE
  fastify.delete('/:id', async (req, reply) => {
    const userId = req.userId
    const boardId = req.params.boardId
    const headers = req.resHeaders
    const taskListId = req.params.id

    const boards = await getBoards(boardId, userId)
    if (boards.length === 0) {
      return badRequest(reply, headers, null)
    }

    const { id } = req.body
    if (taskListId != id) return badRequest(reply, headers, null)

    const taskList = await taskListsRepository.find({
      select: ['id', 'title'],
      where: {
        id,
        board_id: boardId,
      },
    })
    if (taskList.length < 1) return badRequest(reply, headers, null)
    await taskListsRepository.delete(taskList[0].id)

    return successResponse(reply, 200, headers, taskList)
  })

  done()
}

export default taskListsController
