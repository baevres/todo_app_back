import { EntitySchema } from 'typeorm'

const boardsEntity = new EntitySchema({
  name: 'Boards',
  tableName: 'boards',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    closed: {
      type: 'boolean',
    },
    user_id: {
      type: 'int',
      generatedType: 'STORED',
    },
  },
  relations: {
    users: {
      target: 'Users',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      type: 'many-to-one',
    },
    task_lists: {
      target: 'TaskLists',
      type: 'one-to-many',
      mappedBy: 'boards',
      cascade: true,
    },
  },
})

export default boardsEntity
