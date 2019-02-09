import DataLoader from 'dataloader';

import { Fragment } from '../entities/Fragment';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';

interface MySession {
  userId: number;
}

interface koaCtx {
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
}
