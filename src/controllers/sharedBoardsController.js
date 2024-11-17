import { error } from 'console'

import sharedBoardsEntity from '../entities/sharedBoardsEntity.js'
import boardsEntity from '../entities/boardsEntity.js'

import successResponse from '../utils/successResponses.js'
import checkOwnerOrInvitedUser from '../utils/checkOwnerOrInvitedUser.js'

const sharedBoardsController = (fastify, options, done) => {
  const sharedBoardsRepository = fastify.orm.getRepository(sharedBoardsEntity)
  const boardsRepository = fastify.orm.getRepository(boardsEntity)
  const dataSource = fastify.orm

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
    const headers = req.resHeaders

    const sharedBoards = await sharedBoardsRepository
      .createQueryBuilder('shared_boards')
      .innerJoin('shared_boards.boards', 'boards')
      .innerJoin('shared_boards.users', 'users')
      .select(['shared_boards.user_id', 'boards.id', 'boards.title'])
      .where('shared_boards.user_id = :userId', { userId })
      .orderBy('shared_boards.board_id', 'ASC')
      .getMany()

    return successResponse(reply, 200, headers, sharedBoards)
  })

  fastify.get('/:id', async (req, reply) => {
    const boardId = req.params.id
    const userId = req.userId
    const headers = req.resHeaders

    const boards = await boardsRepository
      .createQueryBuilder('boards')
      .innerJoin('boards.invited_users', 'shared_boards')
      .select(['boards.id', 'boards.title'])
      .where('boards.id = :boardId', { boardId })
      .andWhere('shared_boards.id = :userId', { userId })
      .getMany()

    return successResponse(reply, 200, headers, boards)
  })

  // POST
  fastify.post('/:id', async (req, reply) => {
    const boardId = req.params.id
    const headers = req.resHeaders
    const userId = req.userId

    const boards = await getBoards(boardId, userId)
    if (boards.length === 0) throw error

    const { valueList } = req.body

    valueList.forEach(({ board_id, user_id }) => {
      if (+board_id !== +boardId || +user_id === +userId) throw error
    })

    const newSharedBoard = dataSource
      .createQueryBuilder()
      .insert()
      .into(sharedBoardsEntity)
      .values(valueList)
      .orIgnore()
      .execute()

    return successResponse(reply, 201, headers, newSharedBoard)
  })

  // DELETE
  fastify.delete('/:id', async (req, reply) => {
    const boardId = req.params.id
    const headers = req.resHeaders
    const userId = req.userId

    const boards = await getBoards(boardId, userId)

    const { board_id, user_id } = req.body
    if (+board_id !== +boardId || boards.length === 0) throw error

    const newSharedBoard = dataSource
      .createQueryBuilder()
      .delete()
      .from(sharedBoardsEntity)
      .where('shared_boards.board_id = :boardId', { boardId })
      .andWhere('shared_boards.user_id = :user_id', { user_id })
      .execute()

    return successResponse(reply, 201, headers, newSharedBoard)
  })

  done()
}

export default sharedBoardsController
