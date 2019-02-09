import faker from 'faker';
import { Connection } from 'typeorm';

import { gCall } from '../../test-utils/gCall';
import { User } from '../../entities/User';
import { testConn } from '../../test-utils/testConn';
import { UnPromisify } from '../../types/unpromisify';
import { FragmentOptionUser } from '../../generated/graphql';

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
          name
          id
        }
      }
    }
  }
}
`;

const makePostMutation = `
mutation($data: PostInput!) {
  makePost(data: $data)
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
  });

  it('Successfully makes a post', async () => {
    response = await makeCall();

    const options: FragmentOptionUser[] = response.data!.getNewFragmentOptions;
    const bookIdOptions = [
      ...new Set(options.map((el: any) => el.fragment.book.id))
    ] as string[];
    const book1Id = bookIdOptions[0];
    const book2Id = bookIdOptions[1];

    const book1Options = options.filter(el => el.fragment.book.id === book1Id);
    const book2Options = options.filter(el => el.fragment.book.id === book2Id);

    const author1Id = book1Options[0].fragment.book.author.id;
    const author2Id = book2Options[0].fragment.book.author.id;

    const makePostResponse = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          book1Id: parseInt(book1Id),
          book2Id: parseInt(book2Id),
          author1Id: parseInt(author1Id),
          author2Id: parseInt(author2Id),
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 1 }
          ]
        }
      },
      userId: user.id
    });
    console.log(makePostResponse);

    expect(makePostResponse.data).toBeTruthy();
  });
});
