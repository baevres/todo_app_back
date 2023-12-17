import { EntitySchema } from 'typeorm'

const userEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 20,
    },
    age: {
      type: 'int',
    },
    link: {
      type: 'text',
    },
    gender: {
      type: 'text',
    },
    phone: {
      type: 'text',
    },
    login: {
      type: 'text',
      unique: true,
    },
    email: {
      type: 'text',
      unique: true,
    },
    password: {
      type: 'text',
      unique: true,
    },
    salt: {
      type: 'text',
      unique: true,
    },
  },
  relations: {
    tasks: {
      target: 'Task',
      type: 'one-to-many',
      mappedBy: 'user',
      cascade: true,
    },
    tokens: {
      target: 'Token',
      type: 'one-to-many',
      mappedBy: 'user',
      cascade: true,
    },
  },
})

export default userEntity
