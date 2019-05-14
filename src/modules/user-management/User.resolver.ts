import {
  Resolver,
  UseMiddleware,
  Mutation,
  Ctx,
  Arg,
  Query
} from 'type-graphql';
import { Service } from 'typedi';

import { User } from '../../entities/User';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';
import { UserService } from './User.service';
import { RegisterInput } from './RegisterInput';
import { ChangePasswordInput } from './ChangePasswordInput';

@Service()
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async register(
    @Arg('data')
    registerInput: RegisterInput
  ): Promise<User> {
    const { user } = await this.userService.register(registerInput);
    return user;
  }

  @Mutation(() => Boolean)
  async confirmUser(@Arg('token') token: string): Promise<Boolean> {
    return this.userService.confirmUser(token);
  }

  @Mutation(() => User, { nullable: true })
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    const user = await this.userService.login(email, password);

    if (user) {
      ctx.session.userInfo = { userId: user.id };
      return user;
    }

    return undefined;
  }

  @UseMiddleware(IsAuth)
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    return this.userService.findUserById(ctx.session.userInfo!.userId!);
  }

  @Mutation(() => User, { nullable: true })
  async changePassword(
    @Arg('data')
    input: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    const user = await this.userService.changePassword(input);

    if (user) {
      ctx.session.userInfo!.userId = user.id;
      return user;
    }

    return undefined;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string): Promise<Boolean> {
    return this.userService.forgotPassword(email);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    ctx.session.userInfo = undefined;
    return true;
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deleteUser(@Ctx() ctx: MyContext): Promise<Boolean> {
    const { userId } = ctx.session.userInfo!;
    return this.userService.deleteUser(userId);
  }
}
