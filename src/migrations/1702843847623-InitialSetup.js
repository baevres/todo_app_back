export class InitialSetup1702843847623 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY NOT NULL,
        name VARCHAR(20) NOT NULL,
        age SMALLINT CHECK (age >= 18 AND age <= 60) NOT NULL,
        link TEXT NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT NOT NULL,
        login TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT UNIQUE NOT NULL,
        salt TEXT UNIQUE NOT NULL
      );
    `)
    await queryRunner.query(
      `
      INSERT INTO users (
        name, 
        age, 
        link, 
        gender, 
        phone, 
        login, 
        email, 
        password, 
        salt
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      );
    `,
      [
        'test',
        18,
        'test.co',
        'male',
        '123456789012',
        'username',
        'username@test.co',
        process.env.FIRST_USER_PASSWORD,
        process.env.FIRST_USER_SALT,
      ],
    )
    await queryRunner.query(`
      CREATE TABLE tokens (
        id SERIAL PRIMARY KEY NOT NULL,
        token TEXT NOT NULL UNIQUE,
        userid INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
      );
    `)
    await queryRunner.query(`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        checked BOOLEAN DEFAULT false NOT NULL,
        userid INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
      );
    `)
  }

  async down(queryRunner) {}
}
