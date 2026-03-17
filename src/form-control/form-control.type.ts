import { Observer } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';

export interface AbstractControl<T = any> {
  readonly dirty: boolean;
  readonly disabled: boolean;
  readonly enabled: boolean;
  readonly errors: ValidatorError[];
  hasError: (key: string) => boolean;
  readonly invalid: boolean;
  readonly pristine: boolean;
  reset: () => void;
  someErrors: (key: string[]) => boolean;
  readonly touched: boolean;
  readonly untouched: boolean;
  readonly valid: boolean;
  readonly value: T;
  readonly wrong: boolean;
  readonly error?: ValidatorError;
}

export interface AbstractFormControl<T = any> extends AbstractControl<T> {
  blur: () => void;
  disable: () => void;
  enable: () => void;
  focus: () => void;
  readonly focused: boolean;
  setDefaultValue: (value: T) => void;
  setStartValue: (value: T) => void;
  setValue: (value: T) => void;
  setValidators: (validators?: ValidatorFn<T>[]) => void;
  touch: () => void;
  readonly unfocused: boolean;
}

export interface ReactiveFormControl<T = any> extends AbstractFormControl<T> {
  subscribe: (subscriber: Observer<T>) => Unsubscription;
}

export interface FormControlOptions<T = any> {
  value: T;
  validators?: ValidatorFn<T>[];
}

export type FormValueOptions<T> = Omit<FormControlOptions<T>, 'validators'>;
export type FormValidatorsOptions<T> = Omit<FormControlOptions<T>, 'value'>;
