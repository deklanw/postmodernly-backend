import faker from 'faker';
import { Connection } from 'typeorm';

import { gCall } from '../../test-utils/gCall';
import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { testConn } from '../../test-utils/testConn';
import { UnPromisify } from '../../types/unpromisify';
import { FragmentOptionUser as FOU } from '../../generated/graphql';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

const getNewOptionsMutation = `
mutation {
  getNewFragmentOptions {
    order
    fragment {
      id
      fragment
      context
      book {
        id
        title
        language
        author {
          id
          name
        }
      }
    }
  }
}
`;

describe('GetFragmentOptions', () => {
  let user: User;
  const makeCall = () =>
    gCall({
      source: getNewOptionsMutation,
      userId: user.id
    });
  let response: UnPromisify<ReturnType<typeof makeCall>>;

  beforeAll(async () => {
    user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password() // hash pass?
    }).save();
    response = await makeCall();
  });

  it('Returns a response', () => {
    expect(response.data).toBeTruthy();
    expect(response.data!.getNewFragmentOptions).toBeTruthy();
  });

  it('Options come from 2 books (and 2 authors).', () => {
    expect(response.data).toBeTruthy();
    expect(response.data!.getNewFragmentOptions).toBeTruthy();
    const options: FOU[] = response.data!.getNewFragmentOptions;
    const bookIds = new Set(options.map(el => el.fragment.book.id));
    const authorIds = new Set(options.map(el => el.fragment.book.author.id));

    expect(bookIds.size).toEqual(2);
    expect(authorIds.size).toEqual(2);
  });

  it('Thirty options are created in DB.', async () => {
    const options = await FragmentOptionUser.find({ userId: user.id });
    expect(options.length).toEqual(30);
  });

  it('Calling again will result in still 30 options.', async () => {
    await makeCall();
    const options = await FragmentOptionUser.find({ userId: user.id });
    expect(options.length).toEqual(30);
  });
});
