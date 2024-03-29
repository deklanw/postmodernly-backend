import { IsEmail } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { IsEmailAlreadyExist } from './IsEmailAlreadyExist';
import { PasswordInput } from './PasswordInput';

@InputType()
export class RegisterInput extends PasswordInput {
  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: 'Email already in use.' })
  email: string;
}
