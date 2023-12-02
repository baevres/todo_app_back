import pkg from 'pg'
const { Client } = pkg

const getClient = () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: process.env.POSTGRES_CLIENT_DATABASE,
    password: process.env.POSTGRES_CLIENT_PASSWORD,
    port: 5050,
  })
  return client
}

export default getClient
