import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { FormatterOptions, FormControlOptions } from './form-control.type';

type ControlArgsOptions<T = any> = [
  FormControlOptions<T> | T | undefined,
  Undefined<ValidatorFn<T>[]>
];

interface ControlValidOptions<T> {
  validators: ValidatorFn<T>[];
  value: T;
}

const CONTROL_OPTIONS_KEYS = ['value', 'validators', 'formatter', 'formatOn'];

function valueIsControlOptions<T, O extends FormControlOptions<T>>(
  options: any
): options is O {
  return (
    typeof options === 'object' &&
    options !== null &&
    CONTROL_OPTIONS_KEYS.some((key) => key in options)
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

/**
 * Aplica el formateador cuando el control formatea en `input` (modo por defecto).
 */
export function formatInputValue<T>(
  value: T,
  { formatter, formatOn }: FormatterOptions<T>
): T {
  return formatter && formatOn !== 'blur' ? formatter(value) : value;
}

/**
 * Aplica el formateador cuando el control formatea en `blur`.
 */
export function formatBlurValue<T>(
  value: T,
  { formatter, formatOn }: FormatterOptions<T>
): T {
  return formatter && formatOn === 'blur' ? formatter(value) : value;
}
