import { EntitySchema } from 'typeorm'

const tokensEntity = new EntitySchema({
  name: 'Token',
  tableName: 'tokens',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    token: {
      type: 'text',
      unique: true,
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

export default tokensEntity
