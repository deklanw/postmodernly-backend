import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/MyContext';

export const IsAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.session.userInfo || !context.session.userInfo.userId) {
    throw new Error('Not authenticated');
  }
  return next();
};
