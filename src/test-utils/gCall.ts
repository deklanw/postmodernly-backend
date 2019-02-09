import { graphql, GraphQLSchema, GraphQLArgs } from 'graphql';
import { createSchema } from '../utils/createSchema';

type Overwrite<T1, T2> = Pick<T1, Exclude<keyof T1, keyof T2>> & T2;

// make the schema optional
type GQLArgsOptionalSchema = Overwrite<GraphQLArgs, { schema?: GraphQLSchema }>;

interface Options extends GQLArgsOptionalSchema {
  userId?: number;
  // etc
}

let schema: GraphQLSchema;

export const gCall = async ({ source, variableValues, userId }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      koaCtx: {
        session: {
          userId
        }
      }
    }
  });
};
