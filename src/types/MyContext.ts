import DataLoader from 'dataloader';

import { Fragment } from '../entities/Fragment';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';
import { User } from '../entities/User';
import { Portman } from '../entities/Portman';

interface UserInfo {
  userId: number;
}

interface MySession {
  userInfo?: UserInfo;
}

export interface MyContext {
  session: MySession;
  ipAddress: string;
  bookLoader: DataLoader<string, Book>;
  authorLoader: DataLoader<string, Author>;
  fragmentLoader: DataLoader<string, Fragment>;
  userLoader: DataLoader<string, User>;
  portmanLoader: DataLoader<string, Portman>;
}
