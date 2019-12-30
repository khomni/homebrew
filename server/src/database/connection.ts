require('pg');
import { createConnection } from 'typeorm';

export default async () => {
  return createConnection({
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD
  });
};
