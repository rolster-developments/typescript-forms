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

export interface AbstractGroupControl<T = any> extends AbstractControl<T> {
  reset: () => void;
}

export interface AbstractBaseControl<T = any> extends AbstractGroupControl<T> {
  active: boolean;
  disabled: boolean;
  setActive: (active: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  setState: (state?: FormState<T>) => void;
}

export interface AbstractFormControl<T = any> extends AbstractBaseControl<T> {
  setValidators: (validators?: ValidatorFn<T>[]) => void;
  subscribe: (subscriber: SubscriberControl<T>) => Subscription;
}

export type AbstractControls<T extends AbstractGroupControl = any> = Record<
  string,
  T
>;

export interface AbstractGroup<T extends AbstractControls> {
  controls: T;
  errors: ValidatorError[];
  invalid: boolean;
  valid: boolean;
  error?: ValidatorError;
}

export type JsonControls<T extends AbstractControls> = {
  [K in keyof T]: T[K]['state'];
};

export type ValidatorGroupFn<T extends AbstractControls, V = any> = (
  controls: T
) => ValidatorResult<V>;

export interface AbstractFormGroup<T extends AbstractControls>
  extends AbstractGroup<T> {
  json: () => JsonControls<T>;
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<T>[]) => void;
  updateValueAndValidity: () => void;
}

export interface AbstractArrayControl<T = any> extends AbstractBaseControl<T> {
  uuid: string;
}

export type AbstractArrayControls = Record<string, AbstractArrayControl>;

export interface AbstractArrayGroup<T extends AbstractArrayControls>
  extends AbstractGroup<T> {
  uuid: string;
}

export type ArrayState<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['state'];
};

export type ArrayValue<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['value'];
};

export interface AbstractArray<T extends AbstractArrayControls>
  extends AbstractGroupControl<ArrayState<T>[]> {
  groups: AbstractArrayGroup<T>[];
  push: (state: Partial<ArrayState<T>>) => void;
  refresh: (control: AbstractArrayControl) => void;
  remove: (group: AbstractArrayGroup<T>) => void;
  value: ArrayValue<T>[];
}

export interface FormControlProps<T = any> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormGroupProps<T extends AbstractControls> {
  controls: T;
  validators?: ValidatorGroupFn<T>[];
}
