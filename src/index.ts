import fastify from 'fastify';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import fastifyRedis from 'fastify-redis';
import abstractCache from 'abstract-cache';
import fastifyCaching from 'fastify-caching';
import fastifyServerSession from 'fastify-server-session';
import Container from 'typedi';
import { ApolloServer } from 'apollo-server-fastify';
import { createConnection, useContainer as useContainerTO } from 'typeorm';
import { useContainer as useContainerCV } from 'class-validator';
import 'reflect-metadata';

import { redis } from './utils/RedisStore';
import { createSchema } from './utils/createSchema';
import { sessionKey } from './constants/session';
import { options } from './utils/dbConfig';
import { bookLoader } from './loaders/bookLoader';
import { authorLoader } from './loaders/authorLoader';
import { fragmentLoader } from './loaders/fragmentLoader';
import { userLoader } from './loaders/userLoader';
import { portmanLoader } from './loaders/portmanLoader';

const secret = 'fjieosjfoejf09ofjeosijfiosejfoes3j90j)#(#()';
const SESSION_DURATION_S = 60 * 60 * 24 * 7; // 7 days

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};

const main = async () => {
  // typeorm use container
  useContainerTO(Container);
  // class-validator useContainer
  useContainerCV(Container);
  console.log('Setup TypeORM and class-validator containers');

  await createConnection(options);
  console.log('Created connection.');

  const schema = await createSchema(Container);
  console.log('Created schema.');

  const apolloServer = new ApolloServer({
    schema,
    context: request => ({
      session: request.session,
      ipAddress: request.ip,
      bookLoader: bookLoader(),
      authorLoader: authorLoader(),
      fragmentLoader: fragmentLoader(),
      userLoader: userLoader(),
      portmanLoader: portmanLoader()
    }),
    subscriptions: {
      path: '/subscriptions'
    }
  });

  const app = fastify();

  const abcache = abstractCache({
    useAwait: false,
    driver: {
      name: 'abstract-cache-redis',
      options: { client: redis }
    }
  });

  app.register(fastifyCors, corsOptions); // only needed for non-graphql requests
  app.register(fastifyCookie);
  app.register(fastifyRedis, { client: redis });
  app.register(fastifyCaching, { cache: abcache });
  app.register(fastifyServerSession, {
    secretKey: secret,
    sessionMaxAge: SESSION_DURATION_S * 1000,
    sessionCookieName: sessionKey,
    cookie: {
      httpOnly: true,
      maxAge: SESSION_DURATION_S,
      expires: SESSION_DURATION_S,
      sameSite: false
    }
  });

  app.register(apolloServer.createHandler({ cors: corsOptions }));

  app.listen(4000, () => {
    console.log('Server started on http://localhost:4000/graphql');
  });

  apolloServer.installSubscriptionHandlers(app.server);
};

main();
