interface MySession {
  userId: number;
}

export interface MyContext {
  session?: MySession;
  cookies?: any;
  req: any;
  res: any;
}
