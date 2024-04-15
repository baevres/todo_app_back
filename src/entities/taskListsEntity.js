import { EntitySchema } from 'typeorm'

const taskListsEntity = new EntitySchema({
  name: 'TaskLists',
  tableName: 'task_lists',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    archived: {
      type: 'boolean',
    },
    board_id: {
      type: 'int',
      generatedType: 'STORED',
    },
  },
  relations: {
    boards: {
      target: 'Boards',
      joinColumn: { name: 'board_id', referencedColumnName: 'id' },
      type: 'many-to-one',
    },
    tasks: {
      target: 'Tasks',
      type: 'one-to-many',
      mappedBy: 'task_lists',
      cascade: true,
    },
  },
})

export default taskListsEntity
