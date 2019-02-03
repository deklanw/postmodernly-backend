import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SnakeNamingStrategy } from './snakeNaming';

export const options: PostgresConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postmodernly',
  synchronize: true,
  dropSchema: true,
  logging: true,
  entities: ['src/entities/*.{ts,js}'],
  namingStrategy: new SnakeNamingStrategy()
};
