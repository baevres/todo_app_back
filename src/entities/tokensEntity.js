import { EntitySchema } from 'typeorm'

const tokensEntity = new EntitySchema({
  name: 'Tokens',
  tableName: 'tokens',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      nullable: false,
    },
    token: {
      type: 'text',
      unique: true,
      nullable: false,
    },
    user_id: {
      type: 'int',
      generatedType: 'STORED',
      nullable: false,
    },
  },
  relations: {
    users: {
      target: 'Users',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      type: 'many-to-one',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
})

export default tokensEntity
