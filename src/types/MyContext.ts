import DataLoader from 'dataloader';

import { Fragment } from '../entities/Fragment';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';
import { User } from '../entities/User';
import { Portman } from '../entities/Portman';

interface MySession {
  userId: number;
}

export interface koaCtx {
  session?: MySession;
  cookies?: any;
  req: any;
  res: any;
}

export interface MyContext {
  koaCtx: koaCtx;
  bookLoader: DataLoader<string, Book>;
  authorLoader: DataLoader<string, Author>;
  fragmentLoader: DataLoader<string, Fragment>;
  userLoader: DataLoader<string, User>;
  portmanLoader: DataLoader<string, Portman>;
}
