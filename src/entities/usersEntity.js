import { EntitySchema } from 'typeorm'

const usersEntity = new EntitySchema({
  name: 'Users',
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
    boards: {
      target: 'Boards',
      type: 'one-to-many',
      mappedBy: 'users',
      cascade: true,
    },
    tokens: {
      target: 'Tokens',
      type: 'one-to-many',
      mappedBy: 'users',
      cascade: true,
    },
  },
})

export default usersEntity
