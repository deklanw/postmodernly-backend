import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/MyContext';

export const IsAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.session!.userId) {
    throw new Error('Not authenticated');
  }
  return next();
};
