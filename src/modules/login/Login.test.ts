import faker from 'faker';
import bcrypt from 'bcryptjs';
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

const loginMutation = `
mutation($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    id
    email
  }
}
`;

describe('Login', () => {
  it('Logs a user in', async () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const dbUser = await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 15),
      confirmed: true
    }).save();

    const response = await gCall({
      source: loginMutation,
      variableValues: {
        email: user.email,
        password: user.password
      }
    });

    expect(response).toMatchObject({
      data: {
        login: {
          id: dbUser.id.toString(),
          email: user.email
        }
      }
    });
  });
});
