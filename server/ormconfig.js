const database = process.env.DATABASE_NAME;
const host = process.env.DATABASE_HOST;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const port = process.env.DATABASE_PORT;

module.exports = {
  synchronize: true,
  logging: false,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber'
  },
  type: 'postgres',
  database,
  host,
  port,
  username,
  password
};
