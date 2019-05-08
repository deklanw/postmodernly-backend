import path from 'path';
import { buildSchema, ContainerType } from 'type-graphql';

export const createSchema = (container: ContainerType) =>
  buildSchema({
    container,
    resolvers: [
      path.join(__dirname, '../modules/**/*.resolver.{ts,js}'),
      path.join(__dirname, '../field-resolvers/**/*.resolver.{ts,js}')
    ]
  });
