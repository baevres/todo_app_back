import { Brackets } from 'typeorm'

const checkOwnerOrInvitedUser = (userId) => {
  return new Brackets((qb) => {
    qb.where('boards.user_id = :userId', { userId }).orWhere(
      'shared_boards.id = :userId',
      { userId },
    )
  })
}

export default checkOwnerOrInvitedUser
