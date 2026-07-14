import { ValidatorError, ValidatorFn } from '@rolster/validators';

import { FormControlOptions } from './form-control.type';

type ControlArgsOptions<T = any> = [
  FormControlOptions<T> | T | undefined,
  Undefined<ValidatorFn<T>[]>
];

interface ControlValidOptions<T> {
  validators: ValidatorFn<T>[];
  value: T;
}

function valueIsControlOptions<T, O extends FormControlOptions<T>>(
  options: any
): options is O {
  return (
    typeof options === 'object' &&
    ('value' in options || 'validators' in options)
  );
}

export function createFormControlOptions<T, O extends FormControlOptions<T>>(
  ...argsOptions: ControlArgsOptions<T>
): O {
  const [options, validators] = argsOptions;

  if (!options) {
    return { value: options, validators } as O;
  }

  if (!validators && valueIsControlOptions<T, O>(options)) {
    return options;
  }

  return {
    value: options as T,
    validators
  } as O;
}

export const formControlIsValid = <T>({
  value,
  validators
}: ControlValidOptions<T>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(value);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};
