export type Maybe<T> = T | null;

export interface UserPostLikeInput {
  postId: number;

  like: boolean;
}

export interface PostInput {
  fragments: FragInput[];
}

export interface FragInput {
  fragmentId: number;

  order: number;
}

export interface ReorderOptionsInput {
  fragments: FragInput[];
}

export interface RegisterInput {
  password: string;

  email: string;
}

/** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
export type DateTime = any;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  me?: Maybe<User>;

  getPosts: Post[];

  hello: string;
}

export interface User {
  id: string;

  email: string;

  created: DateTime;

  lastPosted?: Maybe<DateTime>;

  lastRolled?: Maybe<DateTime>;

  posts?: Maybe<Post[]>;

  postLikes: UserPostLike[];

  fragmentOptions: FragmentOptionUser[];
}

export interface Post {
  id: string;

  created: DateTime;

  creator: User;

  portman: Portman;

  book1: Book;

  book2: Book;

  likeCount: number;

  usedFragments: PostFragment[];
}

export interface Portman {
  id: string;

  portman: string;

  posts?: Maybe<Post[]>;

  author1: Author;

  author2: Author;
}

export interface Author {
  id: string;

  name: string;

  books: Book[];
}

export interface Book {
  id: string;

  gbId: number;

  title: string;

  language: string;

  author: Author;

  fragments: Fragment[];
}

export interface Fragment {
  id: string;

  fragment: string;

  context: string;

  postsWhichUse?: Maybe<PostFragment[]>;

  book: Book;
}

export interface PostFragment {
  order: number;

  fragment: Fragment;

  post: Post;
}

export interface UserPostLike {
  user: User;

  post: Post;
}

export interface FragmentOptionUser {
  order: number;

  fragment: Fragment;
}

export interface Mutation {
  login?: Maybe<User>;

  logout: boolean;

  likePost: boolean;

  deletePost: boolean;

  makePost?: Maybe<number>;

  reorderOptions: boolean;

  getNewPostOptions: PostOptions;

  confirmUser: boolean;

  register: User;

  deleteUser: boolean;
}

export interface PostOptions {
  book1Options: BookFragmentOptions;

  book2Options: BookFragmentOptions;

  portman: Portman;
}

export interface BookFragmentOptions {
  book: Book;

  fragmentOptions: FragmentOptionUser[];
}

export interface Subscription {
  newPost: number;
}

// ====================================================
// Arguments
// ====================================================

export interface LoginMutationArgs {
  password: string;

  email: string;
}
export interface LikePostMutationArgs {
  data: UserPostLikeInput;
}
export interface DeletePostMutationArgs {
  postId: number;
}
export interface MakePostMutationArgs {
  data: PostInput;
}
export interface ReorderOptionsMutationArgs {
  data: ReorderOptionsInput;
}
export interface ConfirmUserMutationArgs {
  token: string;
}
export interface RegisterMutationArgs {
  data: RegisterInput;
}
