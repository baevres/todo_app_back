import { EntitySchema } from 'typeorm'

const tokensEntity = new EntitySchema({
  name: 'Tokens',
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
  },
})

export default tokensEntity
