import { testConn, customDrop } from './testConn';

testConn(false)
  .then(() => customDrop())
  .then(() => process.exit());
