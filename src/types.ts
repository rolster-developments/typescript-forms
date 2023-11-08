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

export type AbstractControls<T extends AbstractControl = any> = Record<
  string,
  T
>;

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

export type AbstractGroupControls<T extends AbstractGroupControl = any> =
  Record<string, T>;

export interface AbstractGroup<T extends AbstractGroupControls> {
  controls: T;
  dirty: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  valid: boolean;
  error?: ValidatorError;
}

export type JsonControls<T extends AbstractGroupControls> = {
  [K in keyof T]: T[K]['state'];
};

export type ValidatorGroupFn<T extends AbstractGroupControls, V = any> = (
  controls: T
) => ValidatorResult<V>;

export interface AbstractFormGroup<T extends AbstractGroupControls>
  extends AbstractGroup<T> {
  json: () => JsonControls<T>;
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<T>[]) => void;
  updateValueAndValidity: () => void;
}

export interface AbstractArrayControl<T = any> extends AbstractBaseControl<T> {
  uuid: string;
}

export type AbstractArrayControls<T extends AbstractArrayControl = any> =
  Record<string, T>;

export interface AbstractArrayGroup<T extends AbstractArrayControls>
  extends AbstractGroup<T> {
  uuid: string;
}

export type AbstractArrayState<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['state'];
};

export type AbstractArrayValue<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['value'];
};

export interface AbstractArray<T extends AbstractArrayControls>
  extends AbstractGroupControl<AbstractArrayState<T>[]> {
  groups: AbstractArrayGroup<T>[];
  push: (state: Partial<AbstractArrayState<T>>) => void;
  refresh: (control: AbstractArrayControl) => void;
  remove: (group: AbstractArrayGroup<T>) => void;
  value: AbstractArrayValue<T>[];
}

export interface FormControlProps<T = any> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormGroupProps<T extends AbstractGroupControls> {
  controls: T;
  validators?: ValidatorGroupFn<T>[];
}

export interface FormArrayControlProps<T = any> {
  uuid: string;
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormArrayGroupProps<T extends AbstractArrayControls> {
  controls: T;
  uuid: string;
  validators?: ValidatorGroupFn<T>[];
}

export type FormArrayBuilderControl<T = any> = Record<
  string,
  Omit<FormArrayControlProps<T>, 'uuid'>
>;

export type FormArrayBuilderState<T extends AbstractArrayControls> = (
  state: Partial<AbstractArrayState<T>>
) => FormArrayBuilderControl;

export interface FormArrayProps<T extends AbstractArrayControls> {
  builder: FormArrayBuilderState<T>;
  state?: AbstractArrayState<T>[];
  validators?: ValidatorGroupFn<T>[];
}
