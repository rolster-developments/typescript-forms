import { Subscription } from 'rxjs';

export type FormState<T = any> = T | undefined | null;

export interface ValidatorError<T = any> {
  id: string;
  message: string;
  data?: T;
}

export type ValidatorResult<T = any> = ValidatorError<T> | undefined;

export type ValidatorFn<T> = (state?: FormState<T>) => ValidatorResult;

export type SubscriberControl<T> = (state?: FormState<T>) => void;

export interface AbstractControl<T = any> {
  dirty: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  valid: boolean;
  value: T;
  error?: ValidatorError;
  state?: FormState<T>;
}

export interface AbstractFormControl<T = any> extends AbstractControl<T> {
  active: boolean;
  disabled: boolean;
  reset: () => void;
  setActive: (active: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  setFormGroup: (formGroup: AbstractFormGroup<any>) => void;
  setState: (state?: FormState<T>) => void;
  setValidators: (validators: ValidatorFn<T>[]) => void;
  subscribe: (subscriber: SubscriberControl<T>) => Subscription;
  updateValueAndValidity: () => void;
}

export interface AbstractArrayControl<T = any> extends AbstractControl<T> {
  uuid: string;
  group?: AbstractArrayGroup<any>;
  validators?: ValidatorFn<T>[];
}

export type AbstractControls = Record<string, AbstractControl>;
export type AbstractFormControls = Record<string, AbstractFormControl>;
export type AbstractArrayControls = Record<string, AbstractArrayControl>;

export type JsonControls<T extends AbstractControls> = Record<keyof T, any>;

export type ValidatorGroupFn<T extends AbstractControls, V = any> = (
  controls: T
) => ValidatorResult<V>;

export interface AbstractGroup<T extends AbstractControls> {
  controls: T;
  errors: ValidatorError[];
  invalid: boolean;
  valid: boolean;
  error?: ValidatorError;
}

export interface AbstractFormGroup<T extends AbstractFormControls>
  extends AbstractGroup<T> {
  json: () => JsonControls<T>;
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<T>[]) => void;
  updateValueAndValidity: (controls?: boolean) => void;
}

export interface AbstractArrayGroup<T extends AbstractArrayControls>
  extends AbstractGroup<T> {
  uuid: string;
  validators?: ValidatorGroupFn<T>[];
}

export interface FormControlProps<T = any> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormGroupProps<T extends AbstractControls> {
  controls: T;
  validators?: ValidatorGroupFn<T>[];
}
