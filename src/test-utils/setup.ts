import { testConn, customTruncate } from './util';

const go = async () => {
  await testConn(); // is it necessary to connect via TO just to truncate?
  await customTruncate();
  process.exit();
};

go();
