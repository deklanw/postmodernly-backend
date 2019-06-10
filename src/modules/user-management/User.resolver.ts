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

  @Mutation(() => Boolean)
  async register(
    @Arg('data')
    registerInput: RegisterInput
  ): Promise<boolean> {
    return this.userService.register(registerInput);
  }

  @Mutation(() => Boolean)
  async resendConfirmationEmail(@Arg('email') email: string): Promise<boolean> {
    return this.userService.resendConfirmationEmail(email);
  }

  @Mutation(() => Boolean)
  async confirmUser(@Arg('token') token: string): Promise<boolean> {
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

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      return this.userService.findUserById(ctx.session.userInfo.userId);
    }
    return undefined;
  }

  @Mutation(() => Boolean)
  async changePassword(
    @Arg('data')
    input: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await this.userService.changePassword(input);

    if (user) {
      return true;
    }

    return false;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string): Promise<boolean> {
    return this.userService.forgotPassword(email);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<boolean> {
    ctx.session.userInfo = undefined;
    return true;
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deleteUser(@Ctx() ctx: MyContext): Promise<boolean> {
    const { userId } = ctx.session.userInfo!;
    return this.userService.deleteUser(userId);
  }
}
