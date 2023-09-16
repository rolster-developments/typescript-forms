import { FormState, ValidatorError, ValidatorFn } from './types';

interface EvalProps<T> {
  state: FormState<T>;
  validators: ValidatorFn<T>[];
}

interface EvalResult {
  errors: ValidatorError[];
  valid: boolean;
}

export const evalFormStateValid = <T>(props: EvalProps<T>): EvalResult => {
  const { state, validators } = props;

  const errors = validators.reduce((errors, validator) => {
    const error = validator(state);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);

  return {
    errors,
    valid: errors.length === 0
  };
};
