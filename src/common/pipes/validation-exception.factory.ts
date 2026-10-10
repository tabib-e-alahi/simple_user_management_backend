import { BadRequestException, ValidationError } from '@nestjs/common';
import { FieldError } from '../interfaces/api-response.interface.js';

// Flattens class-validator errors (including nested DTOs) into [{ field, message }]
function flatten(errors: ValidationError[], parentPath = ''): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({ field, message }));
    return [...own, ...flatten(error.children ?? [], field)];
  });
}

export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    message: 'Validation failed',
    errors: flatten(errors),
  });
}
