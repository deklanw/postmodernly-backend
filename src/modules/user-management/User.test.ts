import faker from 'faker';
import Container from 'typedi';
import { Connection } from 'typeorm';

import { testConn, setupTOContainer } from '../../test-utils/util';
import { UserService } from './User.service';

let conn: Connection;
let service: UserService;
beforeAll(async () => {
  jest.setTimeout(600 * 1000);
  setupTOContainer();
  conn = await testConn();
  service = Container.get(UserService);
});
afterAll(async () => {
  await conn.close();
});

describe('Register', () => {
  it('Creates user.', async () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const { user: registeredUser } = await service.createUserAndToken({
      email: user.email,
      password: user.password
    });

    expect(registeredUser.email).toEqual(user.email);
    expect(registeredUser.password).not.toEqual(user.password);
    const dbUser = await service.findUser({ where: { email: user.email } });

    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeFalsy();
  });
});

describe('Login', () => {
  it('Logs a user in', async () => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const { user: registeredUser, token } = await service.createUserAndToken({
      email: user.email,
      password: user.password
    });

    await service.confirmUser(token);

    const response = await service.login(user.email, user.password);
    expect(response!.id).toEqual(registeredUser.id);
    expect(response!.email).toEqual(registeredUser.email);
  });
});
