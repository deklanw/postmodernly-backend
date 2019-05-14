import { MiddlewareFn } from 'type-graphql';
import { redis } from '../utils/RedisStore';
import { MyContext } from '../types/MyContext';

type RequestsPerPeriod = {
  period: number; // seconds
  requests: number;
};

type Limit = {
  limitForAnon: RequestsPerPeriod;
  limitForUser: RequestsPerPeriod;
};

export const rateLimit: (limit: Limit) => MiddlewareFn<MyContext> = ({
  limitForAnon,
  limitForUser
}: Limit) => async ({ context: { session, ipAddress }, info }, next) => {
  let userId: number | undefined;
  if (session.userInfo) {
    ({ userId } = session.userInfo);
  }
  const isAnon = !userId;
  const key = `rate-limit:${info.fieldName}:${isAnon ? ipAddress : userId}`;

  const current = await redis.incr(key); // if key doesn't exist, sets to zero then increments

  if (
    (isAnon && current > limitForAnon.requests) ||
    (!isAnon && current > limitForUser.requests)
  ) {
    throw new Error(`you're doing that too much ${key}, ${current}`); // think about better error handling
  } else if (current === 1) {
    await redis.expire(key, isAnon ? limitForAnon.period : limitForUser.period);
  }

  return next();
};
