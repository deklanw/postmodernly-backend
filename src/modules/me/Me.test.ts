import { Connection } from 'typeorm';
import faker from 'faker';
import jsc from 'jsverify';

import { testConn } from '../../test-utils/testConn';
import { gCall } from '../../test-utils/gCall';
import { User } from '../../entities/User';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  jest.setTimeout(20000);
  console.log('Connection established');
});

afterAll(async () => {
  await conn.close();
});

const meQuery = `
query {
  me {
    id
    email
  }
}
`;

describe('Me', () => {
  it('Get user', async () => {
    const user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password() // hash pass?
    }).save();

    const response = await gCall({
      source: meQuery,
      userId: user.id
    });

    expect(response).toMatchObject({
      data: {
        me: {
          id: user.id.toString(),
          email: user.email
        }
      }
    });
  });

  it('Return null', async () => {
    const response = await gCall({
      source: meQuery
    });

    expect(response).toMatchObject({
      data: {
        me: null
      }
    });
  });
});
