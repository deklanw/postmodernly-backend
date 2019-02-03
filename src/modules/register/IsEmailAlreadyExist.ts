import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { User } from '../../entities/User';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface {
  validate(email: string) {
    return User.findOne({ where: { email } }).then(user => {
      if (user) return false;
      return true;
    });
  }
}

export function IsEmailAlreadyExist(options?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      propertyName,
      options,
      target: object.constructor,
      constraints: [],
      validator: IsEmailAlreadyExistConstraint
    });
  };
}
