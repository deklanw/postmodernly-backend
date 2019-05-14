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

export interface ChangePasswordInput {
  password: string;

  token: string;
}

export interface PasswordInput {
  password: string;
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
  getPosts: Post[];

  me?: Maybe<User>;
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

export interface User {
  id: string;

  email: string;

  created: DateTime;

  posts?: Maybe<Post[]>;

  postLikes: UserPostLike[];

  fragmentOptions: FragmentOptionUser[];
}

export interface UserPostLike {
  user: User;

  post: Post;
}

export interface FragmentOptionUser {
  order: number;

  fragment: Fragment;
}

export interface Fragment {
  id: string;

  fragmentText: string;

  context: string;

  postsWhichUse?: Maybe<PostFragment[]>;

  book: Book;
}

export interface PostFragment {
  order: number;

  fragment: Fragment;

  post: Post;
}

export interface Book {
  id: string;

  gbId: number;

  title: string;

  language: string;

  author: Author;

  fragments: Fragment[];
}

export interface Author {
  id: string;

  name: string;

  books: Book[];
}

export interface Portman {
  id: string;

  name: string;

  posts?: Maybe<Post[]>;

  author1: Author;

  author2: Author;
}

export interface Mutation {
  likePost: boolean;

  deletePost: boolean;

  makePost?: Maybe<number>;

  getOptions: PostOptions;

  reorderOptions: boolean;

  getNewPostOptions: PostOptions;

  register: User;

  confirmUser: boolean;

  login?: Maybe<User>;

  changePassword?: Maybe<User>;

  forgotPassword: boolean;

  logout: boolean;

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

export interface FragmentOption {
  order: number;

  fragment: Fragment;
}

export interface FragmentOptionAnon {
  order: number;

  fragment: Fragment;
}

// ====================================================
// Arguments
// ====================================================

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
export interface RegisterMutationArgs {
  data: RegisterInput;
}
export interface ConfirmUserMutationArgs {
  token: string;
}
export interface LoginMutationArgs {
  password: string;

  email: string;
}
export interface ChangePasswordMutationArgs {
  data: ChangePasswordInput;
}
export interface ForgotPasswordMutationArgs {
  email: string;
}
