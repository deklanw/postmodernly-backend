import faker from 'faker';
import { Connection } from 'typeorm';

import { gCall } from '../../test-utils/gCall';
import { User } from '../../entities/User';
import { testConn } from '../../test-utils/testConn';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
  jest.setTimeout(20 * 1000);
});
afterAll(async () => {
  await conn.close();
});

const registerMutation = `
mutation Register($data: RegisterInput!) {
  register(
    data: $data
  ) {
    id
    email
  }
}
`;

describe('Register', () => {
  it('Creates user.', async () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const response = await gCall({
      source: registerMutation,
      variableValues: {
        data: user
      }
    });

    expect(response).toMatchObject({
      data: {
        register: {
          email: user.email
        }
      }
    });

    const dbUser = await User.findOne({ where: { email: user.email } });
    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeFalsy();
  });
});
