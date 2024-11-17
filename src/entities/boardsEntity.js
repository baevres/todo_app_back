import { EntitySchema } from 'typeorm'

const boardsEntity = new EntitySchema({
  name: 'Boards',
  tableName: 'boards',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      nullable: false,
    },
    title: {
      type: 'varchar',
      length: 250,
      nullable: false,
    },
    closed: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
    user_id: {
      type: 'int',
      generatedType: 'STORED',
      nullable: false,
    },
  },
  relations: {
    users: {
      type: 'many-to-one',
      target: 'Users',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    invited_users: {
      type: 'many-to-many',
      target: 'Users',
      joinTable: {
        name: 'shared_boards',
        joinColumn: {
          name: 'board_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
        },
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    task_lists: {
      target: 'TaskLists',
      type: 'one-to-many',
      mappedBy: 'boards',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
})

export default boardsEntity
