import checkOwnerOrInvitedUser from './checkOwnerOrInvitedUser.js'

const setBoardFilter = async (
  boardsRepository,
  boardId,
  userId,
  queryBuilder,
) => {
  const boards = await boardsRepository
    .createQueryBuilder('boards')
    .innerJoin('boards.invited_users', 'shared_boards')
    .select(['boards.id', 'boards.title'])
    .where('boards.id = :boardId', { boardId })
    .andWhere(checkOwnerOrInvitedUser(userId))
    .getMany()

  if (boards.length > 0) {
    queryBuilder
      .innerJoin('boards.invited_users', 'shared_boards')
      .andWhere(checkOwnerOrInvitedUser(userId))
  } else {
    queryBuilder.andWhere('boards.user_id = :userId', { userId })
  }

  return queryBuilder
}

export default setBoardFilter
