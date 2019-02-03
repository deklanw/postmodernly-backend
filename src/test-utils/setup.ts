import { testConn } from './testConn';

testConn(true).then(() => {
  console.log('Dropped test DB in preparation for tests');
  process.exit();
});
