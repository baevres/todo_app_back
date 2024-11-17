import { EntitySchema } from 'typeorm'

const sharedBoardsEntity = new EntitySchema({
  name: 'SharedBoards',
  tableName: 'shared_boards',
  columns: {
    user_id: {
      type: 'int',
      primary: true,
    },
    board_id: {
      type: 'int',
      primary: true,
    },
  },
  relations: {
    users: {
      target: 'Users',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
    },
    boards: {
      target: 'Boards',
      type: 'many-to-one',
      joinColumn: {
        name: 'board_id',
        referencedColumnName: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
    },
  },
})

export default sharedBoardsEntity
