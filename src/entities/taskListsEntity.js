import { EntitySchema } from 'typeorm'

const taskListsEntity = new EntitySchema({
  name: 'TaskLists',
  tableName: 'task_lists',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      nullable: false,
    },
    title: {
      type: 'varchar',
      length: 200,
      nullable: false,
    },
    archived: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
    board_id: {
      type: 'int',
      generatedType: 'STORED',
      nullable: false,
    },
  },
  relations: {
    boards: {
      target: 'Boards',
      joinColumn: { name: 'board_id', referencedColumnName: 'id' },
      type: 'many-to-one',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    tasks: {
      target: 'Tasks',
      type: 'one-to-many',
      mappedBy: 'task_lists',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
})

export default taskListsEntity
