import { Subscription } from 'rxjs';

export type FormState<T = any> = T | undefined | null;

export interface ValidatorError<T = any> {
  id: string;
  message: string;
  data?: T;
}

type ValidatorResult = ValidatorError | undefined;

export type ValidatorFn<T> = (state?: FormState<T>) => ValidatorResult;

export type SubscriberControl<T> = (state?: FormState<T>) => void;

export interface AbstractControl<T = any> {
  active: boolean;
  dirty: boolean;
  disabled: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  reset: () => void;
  setActive: (active: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  setGroup: (group: AbstractGroup<any>) => void;
  setState: (state?: FormState<T>) => void;
  setValidators: (validators: ValidatorFn<T>[]) => void;
  subscribe: (subscriber: SubscriberControl<T>) => Subscription;
  updateValueAndValidity: () => void;
  valid: boolean;
  value: T;
  error?: ValidatorError;
  state?: FormState<T>;
}

export type FormControls = Record<string, AbstractControl>;

export type JsonControl<T extends FormControls> = Record<keyof T, any>;

export type ValidatorGroupFn<T extends FormControls> = (
  controls: T
) => ValidatorResult;

export interface AbstractGroup<T extends FormControls> {
  controls: T;
  errors: ValidatorError[];
  invalid: boolean;
  json: () => JsonControl<T>;
  reset: () => void;
  updateValidity: () => void;
  updateValueAndValidity: () => void;
  valid: boolean;
  error?: ValidatorError;
}
