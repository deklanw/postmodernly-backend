import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Service } from 'typedi';

import { UserService } from './User.service';

@Service()
@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string) {
    const user = await this.userService.findUser({ where: { email } });
    return !user;
  }
}

export function IsEmailAlreadyExist(options?: ValidationOptions) {
  return (object: {}, propertyName: string) => {
    registerDecorator({
      propertyName,
      options,
      target: object.constructor,
      constraints: [],
      validator: IsEmailAlreadyExistConstraint
    });
  };
}
