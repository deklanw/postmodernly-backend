import { ApolloServer } from 'apollo-server-koa';
import Koa from 'koa';
import session from 'koa-session';
import RedisStore from 'koa-redis';
import cors from '@koa/cors';
import { formatArgumentValidationError } from 'type-graphql';
import { createConnection } from 'typeorm';
import 'reflect-metadata';

import { koaCtx } from './types/MyContext';

import { redis } from './utils/RedisStore';
import { createSchema } from './utils/createSchema';
import { sessionKey } from './constants/session';
import { options } from './utils/dbConfig';
import { bookLoader } from './loaders/bookLoader';
import { authorLoader } from './loaders/authorLoader';
import { fragmentLoader } from './loaders/fragmentLoader';
import { userLoader } from './loaders/userLoader';
import { portmanLoader } from './loaders/portmanLoader';

const secret = 'fjieosjfoejf093j90j)#(#()';

const main = async () => {
  await createConnection(options);

  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError,
    context: ({ ctx }: { ctx: koaCtx }) => ({
      koaCtx: ctx,
      bookLoader: bookLoader(),
      authorLoader: authorLoader(),
      fragmentLoader: fragmentLoader(),
      userLoader: userLoader(),
      portmanLoader: portmanLoader()
    })
  });

  const app = new Koa();
  app.keys = [secret];

  // app.use(cors({ credentials: true, origin: 'localhost:3000/' }));
  app.use(cors({ credentials: true }));
  app.use(
    session(
      {
        key: sessionKey,
        store: new RedisStore({
          client: redis
        })
        // other options . . .
      },
      app
    )
  );

  const httpServer = app.listen(4000, () => {
    console.log('Server started on http://localhost:4000/graphql');
  });

  apolloServer.applyMiddleware({ app });
  apolloServer.installSubscriptionHandlers(httpServer);
};

main();
