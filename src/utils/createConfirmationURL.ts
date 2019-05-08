import { v4 } from 'uuid';
import { redis } from './RedisStore';
import { confirmUserPrefix } from '../constants/redisPrefixes';

export const createConfirmationToken = async (userId: number) => {
  const token = v4();
  await redis.set(confirmUserPrefix + token, userId, 'ex', 60 * 60 * 24); // 1 day expiration

  return token;
};
