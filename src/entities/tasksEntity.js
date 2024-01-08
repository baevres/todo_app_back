import { EntitySchema } from 'typeorm'

const taskEntity = new EntitySchema({
  name: 'Task',
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
    userid: {
      type: 'int',
      generatedType: 'STORED',
    },
  },
  relations: {
    users: {
      target: 'User',
      joinColumn: { name: 'userid', referencedColumnName: 'id' },
      type: 'many-to-one',
    },
  },
})

export default taskEntity
