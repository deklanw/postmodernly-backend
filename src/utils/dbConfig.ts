import path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SnakeNamingStrategy } from './snakeNaming';

export const options: PostgresConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  dropSchema: false,
  logging: true,
  entities: [path.join(__dirname, '../entities/*.{ts,js}')],
  namingStrategy: new SnakeNamingStrategy()
};
