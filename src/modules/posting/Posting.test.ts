import faker from 'faker';
import Container from 'typedi';
import { Connection } from 'typeorm';

import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { testConn, setupTOContainer } from '../../test-utils/util';
import { UserPostLike } from '../../entities/UserPostLike';
import { PostOptions } from '../../tql-only/PostOptions';
import { PostingService } from './Posting.service';
import { PostOptionsService } from './PostOptions.service';
import { UserService } from '../user-management/User.service';
import { UserPostLikeService } from './LikePost.service';

let conn: Connection;
let user1: User;
let user2: User;

let postingService: PostingService;
let postOptionService: PostOptionsService;
let likePostService: UserPostLikeService;
let userService: UserService;

beforeAll(async () => {
  jest.setTimeout(20 * 1000);
  setupTOContainer();
  conn = await testConn();
  postingService = Container.get(PostingService);
  postOptionService = Container.get(PostOptionsService);
  likePostService = Container.get(UserPostLikeService);
  userService = Container.get(UserService);

  const { user: registeredUser1, token: token1 } = await userService.register({
    email: faker.internet.email(),
    password: faker.internet.password()
  });

  const { user: registeredUser2, token: token2 } = await userService.register({
    email: faker.internet.email(),
    password: faker.internet.password()
  });

  await userService.confirmUser(token1);
  await userService.confirmUser(token2);

  user1 = registeredUser1;
  user2 = registeredUser2;
});

afterAll(async () => {
  await conn.close();
});

describe('FragmentOptions', () => {
  let response: PostOptions;

  beforeAll(async () => {
    response = await postOptionService.getNewPostOptions(user1.id);
  });

  it('Returns a response', () => {
    expect(response).toBeTruthy();
  });

  it('There are 15 options for both books', () => {
    const book1Options = response.book1Options.fragmentOptions;
    const book2Options = response.book2Options.fragmentOptions;

    expect(book1Options.length).toEqual(15);
    expect(book2Options.length).toEqual(15);
  });

  it('Thirty options are created in DB.', async () => {
    const options = await FragmentOptionUser.find({ userId: user1.id });
    expect(options.length).toEqual(30);
  });

  it('Calling again will result in still 30 options.', async () => {
    await postOptionService.getNewPostOptions(user1.id);
    const options = await FragmentOptionUser.find({ userId: user1.id });
    expect(options.length).toEqual(30);
  });

  it('Reorder Options succeeds with an identical reorder.', async () => {
    const options = await postOptionService.getNewPostOptions(user1.id);

    const allOptions = options.book1Options.fragmentOptions
      .concat(options.book2Options.fragmentOptions)
      .map(el => ({
        order: el.order,
        fragmentId: el.fragment.id
      }));

    const reorderResponse = await postOptionService.reorderOptions(
      { fragments: allOptions },
      user1.id
    );
    expect(reorderResponse).toBeTruthy();
  });

  it('Reorder Options fails if not all options are given', async () => {
    const options = await postOptionService.getNewPostOptions(user1.id);

    const allOptions = options.book1Options.fragmentOptions.map(el => ({
      order: el.order,
      fragmentId: el.fragment.id
    }));

    const reorderResponse = await postOptionService.reorderOptions(
      { fragments: allOptions },
      user1.id
    );
    expect(reorderResponse).toBeFalsy();
  });

  it('Reorder Options fails if orders are duplicated', async () => {
    const options = await postOptionService.getNewPostOptions(user1.id);

    const allOptions = options.book1Options.fragmentOptions
      .concat(options.book2Options.fragmentOptions)
      .map(el => ({
        order: el.order,
        fragmentId: el.fragment.id
      }));

    allOptions[0].order = 1;
    allOptions[1].order = 1;

    const reorderResponse = await postOptionService.reorderOptions(
      { fragments: allOptions },
      user1.id
    );
    expect(reorderResponse).toBeFalsy();
  });
});

describe('Posting', () => {
  let options: PostOptions;

  beforeAll(async () => {
    options = await postOptionService.getNewPostOptions(user1.id);
  });

  it('Successfully makes a post', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 0
          },
          {
            fragmentId: options.book2Options.fragmentOptions[0].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    expect(makePostResponse).toBeTruthy();
  });

  it('Post fails if fragments come from same book.', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 0
          },
          {
            fragmentId: options.book1Options.fragmentOptions[1].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    expect(makePostResponse).toBeFalsy();
  });

  it('Post fails if order is duplicated', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 1
          },
          {
            fragmentId: options.book2Options.fragmentOptions[0].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    expect(makePostResponse).toBeFalsy();
  });

  it('Can successfully like a post.', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 0
          },
          {
            fragmentId: options.book2Options.fragmentOptions[0].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    const likePostResponse = await likePostService.likePost(
      {
        postId: makePostResponse!,
        like: true
      },
      user2.id
    );

    expect(likePostResponse).toBeTruthy();
  });

  it('Liking your own post fails.', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 0
          },
          {
            fragmentId: options.book2Options.fragmentOptions[0].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    const likePostResponse = await likePostService.likePost(
      {
        postId: makePostResponse!,
        like: true
      },
      user1.id
    );

    expect(likePostResponse).toBeFalsy();
  });

  it('Can unlike a post.', async () => {
    const makePostResponse = await postingService.makePost(
      {
        fragments: [
          {
            fragmentId: options.book1Options.fragmentOptions[0].fragment.id,
            order: 0
          },
          {
            fragmentId: options.book2Options.fragmentOptions[0].fragment.id,
            order: 1
          }
        ]
      },
      user1.id
    );

    await likePostService.likePost(
      {
        postId: makePostResponse!,
        like: true
      },
      user2.id
    );

    await likePostService.likePost(
      {
        postId: makePostResponse!,
        like: false
      },
      user2.id
    );

    const unliked = await UserPostLike.findOne({
      userId: user2.id,
      postId: makePostResponse!
    });

    expect(unliked).toBeUndefined();
  });
});
