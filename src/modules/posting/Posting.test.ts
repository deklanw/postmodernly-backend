import faker from 'faker';
import { Connection } from 'typeorm';

import { gCall } from '../../test-utils/gCall';
import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { testConn } from '../../test-utils/testConn';
import { UnPromisify } from '../../types/unpromisify';
import { FragmentOptionUser as FOU } from '../../generated/graphql';
import { UserPostLike } from '../../entities/UserPostLike';

let conn: Connection;
let user1: User;
let user2: User;

beforeAll(async () => {
  conn = await testConn();
  user1 = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password() // hash pass?
  }).save();

  user2 = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password() // hash pass?
  }).save();
});

afterAll(async () => {
  await conn.close();
});

const getNewOptionsMutation = `
mutation {
  getNewPostOptions {
    portman {
      id
      portman
    }
    book1Options {
      book {
        id
        title
        language
        author {
          id
          name
        }
      }
      fragmentOptions {
        fragment {
          id
          context
          fragment
        }
      }
    }
    book2Options {
      book {
        id
        title
        language
        author {
          id
          name
        }
      }
      fragmentOptions {
        fragment {
          id
          context
          fragment
        }
      }
    }
  }
}

`;

const getOptionsMinimal = `
mutation {
  getNewPostOptions {
    portman {
      id
      portman
    }
    book1Options {
      fragmentOptions {
        order
        fragment {
          id
        }
      }
    }
    book2Options {
      fragmentOptions {
        order
        fragment {
          id
        }
      }
    }
  }
}
`;

const reorderMutation = `
mutation($data: ReorderOptionsInput!) {
  reorderOptions(data: $data)
}
`;

const makePostMutation = `
mutation($data: PostInput!) {
  makePost(data: $data)
}
`;

const likePostMutation = `
mutation($data: UserPostLikeInput!) {
  likePost(data: $data)
}
`;

describe('FragmentOptions', () => {
  const makeGetNewOptionsCall = () =>
    gCall({
      source: getNewOptionsMutation,
      userId: user1.id
    });
  const makeGetNewOptionsMinimalCall = () =>
    gCall({
      source: getOptionsMinimal,
      userId: user1.id
    });
  let response: UnPromisify<ReturnType<typeof makeGetNewOptionsCall>>;

  beforeAll(async () => {
    response = await makeGetNewOptionsCall();
  });

  it('Returns a response', () => {
    console.log(response);
    expect(response.data).toBeTruthy();
    expect(response.data!.getNewPostOptions).toBeTruthy();
  });

  it('There are 15 options for both books', () => {
    expect(response.data).toBeTruthy();
    expect(response.data!.getNewPostOptions).toBeTruthy();
    const book1Options: FOU[] = response.data!.getNewPostOptions.book1Options
      .fragmentOptions;
    const book2Options: FOU[] = response.data!.getNewPostOptions.book2Options
      .fragmentOptions;

    expect(book1Options.length).toEqual(15);
    expect(book2Options.length).toEqual(15);
  });

  it('Thirty options are created in DB.', async () => {
    const options = await FragmentOptionUser.find({ userId: user1.id });
    expect(options.length).toEqual(30);
  });

  it('Calling again will result in still 30 options.', async () => {
    await makeGetNewOptionsCall();
    const options = await FragmentOptionUser.find({ userId: user1.id });
    expect(options.length).toEqual(30);
  });

  it('Reorder Options succeeds with an identical reorder.', async () => {
    const splitOptions = (await makeGetNewOptionsMinimalCall()).data!
      .getNewPostOptions;
    const allOptions = splitOptions.book1Options.fragmentOptions
      .concat(splitOptions.book2Options.fragmentOptions)
      .map((el: any) => ({
        order: el.order,
        fragmentId: parseInt(el.fragment.id)
      }));
    const reorderResponse = await gCall({
      source: reorderMutation,
      userId: user1.id,
      variableValues: {
        data: {
          fragments: allOptions
        }
      }
    });
    expect(reorderResponse.data!.reorderOptions).toBeTruthy();
  });

  it('Reorder Options fails if not all options are given', async () => {
    const splitOptions = (await makeGetNewOptionsMinimalCall()).data!
      .getNewPostOptions;
    const allOptions = splitOptions.book1Options.fragmentOptions.map(
      (el: any) => ({
        order: el.order,
        fragmentId: parseInt(el.fragment.id)
      })
    );
    const reorderResponse = await gCall({
      source: reorderMutation,
      userId: user1.id,
      variableValues: {
        data: {
          fragments: allOptions
        }
      }
    });
    expect(reorderResponse.data!.reorderOptions).toBeFalsy();
  });

  it('Reorder Options fails if orders are duplicated', async () => {
    const splitOptions = (await makeGetNewOptionsMinimalCall()).data!
      .getNewPostOptions;
    const allOptions = splitOptions.book1Options.fragmentOptions
      .concat(splitOptions.book2Options.fragmentOptions)
      .map((el: any) => ({
        order: el.order,
        fragmentId: parseInt(el.fragment.id)
      }));

    allOptions[0].order = 1;
    allOptions[1].order = 1;
    const reorderResponse = await gCall({
      source: reorderMutation,
      userId: user1.id,
      variableValues: {
        data: {
          fragments: allOptions
        }
      }
    });
    expect(reorderResponse.data!.reorderOptions).toBeFalsy();
  });
});

describe('Posting', () => {
  const makeCall = () =>
    gCall({
      source: getNewOptionsMutation,
      userId: user1.id
    });
  let response: UnPromisify<ReturnType<typeof makeCall>>;

  let book1Options: FOU[];
  let book2Options: FOU[];

  beforeAll(async () => {
    response = await makeCall();

    book1Options = response.data!.getNewPostOptions.book1Options
      .fragmentOptions;
    book2Options = response.data!.getNewPostOptions.book2Options
      .fragmentOptions;
  });

  it('Successfully makes a post', async () => {
    const makePostResponse = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 1 }
          ]
        }
      },
      userId: user1.id
    });

    console.log(makePostResponse);

    expect(makePostResponse.data).toBeTruthy();
  });

  it('Post fails if fragments come from same book.', async () => {
    const makePostResponse = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book1Options[1].fragment.id), order: 1 }
          ]
        }
      },
      userId: user1.id
    });

    expect(makePostResponse.data!.makePost).toBeFalsy();
  });

  it('Post fails if order is duplicated', async () => {
    const makePostResponse = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 0 }
          ]
        }
      },
      userId: user1.id
    });

    expect(makePostResponse.data!.makePost).toBeFalsy();
  });

  it('Can successfully like a post.', async () => {
    const makePostResponseU1 = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 1 }
          ]
        }
      },
      userId: user1.id
    });
    const postId = makePostResponseU1.data!.makePost;

    const likePostResponse = await gCall({
      source: likePostMutation,
      variableValues: {
        data: {
          postId: parseInt(postId),
          like: true
        }
      },
      userId: user2.id
    });

    expect(likePostResponse.data!.likePost).toBeTruthy();
  });

  it('Liking your own post fails.', async () => {
    const makePostResponseU1 = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 1 }
          ]
        }
      },
      userId: user1.id
    });
    const postId = makePostResponseU1.data!.makePost;

    const likePostResponse = await gCall({
      source: likePostMutation,
      variableValues: {
        data: {
          postId: parseInt(postId),
          like: true
        }
      },
      userId: user1.id
    });

    expect(likePostResponse.data!.likePost).toBeFalsy();
  });

  it('Can unlike a post.', async () => {
    const makePostResponseU1 = await gCall({
      source: makePostMutation,
      variableValues: {
        data: {
          fragments: [
            { fragmentId: parseInt(book1Options[0].fragment.id), order: 0 },
            { fragmentId: parseInt(book2Options[0].fragment.id), order: 1 }
          ]
        }
      },
      userId: user1.id
    });
    const postId = makePostResponseU1.data!.makePost;

    await gCall({
      source: likePostMutation,
      variableValues: {
        data: {
          postId: parseInt(postId),
          like: true
        }
      },
      userId: user2.id
    });

    await gCall({
      source: likePostMutation,
      variableValues: {
        data: {
          postId: parseInt(postId),
          like: false
        }
      },
      userId: user2.id
    });

    const unliked = await UserPostLike.findOne({
      userId: user2.id,
      postId: parseInt(postId)
    });

    expect(unliked).toBeUndefined();
  });
});
