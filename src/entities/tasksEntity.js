import { EntitySchema } from 'typeorm'

const tasksEntity = new EntitySchema({
  name: 'Tasks',
  tableName: 'tasks',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      nullable: false,
    },
    title: {
      type: 'text',
      nullable: false,
    },
    checked: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
    task_list_id: {
      type: 'int',
      generatedType: 'STORED',
      nullable: false,
    },
  },
  relations: {
    task_lists: {
      target: 'TaskLists',
      joinColumn: { name: 'task_list_id', referencedColumnName: 'id' },
      type: 'many-to-one',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
})

export default tasksEntity
