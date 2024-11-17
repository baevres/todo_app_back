import { EntitySchema } from 'typeorm'

const usersEntity = new EntitySchema({
  name: 'Users',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    age: {
      type: 'smallint',
      check: 'age >= 18 AND age <= 60',
      nullable: false,
    },
    link: {
      type: 'text',
      nullable: false,
    },
    gender: {
      type: 'text',
      nullable: false,
    },
    phone: {
      type: 'text',
      nullable: false,
    },
    login: {
      type: 'text',
      unique: true,
      nullable: false,
    },
    email: {
      type: 'text',
      unique: true,
      nullable: false,
    },
    password: {
      type: 'text',
      unique: true,
      nullable: false,
    },
    salt: {
      type: 'text',
      unique: true,
      nullable: false,
    },
  },
  relations: {
    boards: {
      target: 'Boards',
      type: 'one-to-many',
      inverseSide: 'creator',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    shared_boards: {
      type: 'many-to-many',
      target: 'Boards',
      joinTable: {
        name: 'shared_boards',
        joinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'board_id',
          referencedColumnName: 'id',
        },
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    tokens: {
      target: 'Tokens',
      type: 'one-to-many',
      mappedBy: 'users',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
})

export default usersEntity
