import { DataSource } from 'typeorm'

const AppDataSource = new DataSource({
  type: 'postgres',
  user: 'postgres',
  host: 'localhost',
  database: 'todoDB',
  password: '1234567890',
  port: 5050,
  entities: ['./src/entities/**/*.js'],
  migrations: ['./src/migrations/**/*.js'],
  migrationsTableName: 'AddManyToMany',
  logging: false,
})

export default AppDataSource
