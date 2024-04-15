import { EntitySchema } from 'typeorm'

const tasksEntity = new EntitySchema({
  name: 'Tasks',
  tableName: 'tasks',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    checked: {
      type: 'boolean',
    },
    task_list_id: {
      type: 'int',
      generatedType: 'STORED',
    },
  },
  relations: {
    task_lists: {
      target: 'TaskLists',
      joinColumn: { name: 'task_list_id', referencedColumnName: 'id' },
      type: 'many-to-one',
    },
  },
})

export default tasksEntity
