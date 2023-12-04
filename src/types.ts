import {
  ValidatorError,
  ValidatorFn,
  ValidatorResult
} from '@rolster/validators';
import { Subscription } from 'rxjs';

export type FormState<T = any> = T | undefined | null;

export type ValidationFormType = 'control' | 'group' | 'array';

export interface ValidationFormError<T = any> extends ValidatorError<T> {
  type: ValidationFormType;
}

export type SubscriberControl<T> = (state?: FormState<T>) => void;

export interface AbstractControl<T = any> {
  errors: ValidatorError[];
  value: T;
  error?: ValidatorError;
  state?: FormState<T>;
  dirty: boolean;
  pristine: boolean;
  touched: boolean;
  untouched: boolean;
  valid: boolean;
  invalid: boolean;
}

export type AbstractControls<T extends AbstractControl = AbstractControl> =
  Record<string, T>;

export interface AbstractGroupControl<T = any> extends AbstractControl<T> {
  reset: () => void;
}

export interface AbstractBaseControl<T = any> extends AbstractGroupControl<T> {
  focused: boolean;
  unfocused: boolean;
  disabled: boolean;
  enabled: boolean;
  focus: () => void;
  blur: () => void;
  enable: () => void;
  disable: () => void;
  touch: () => void;
  untouch: () => void;
  setState: (state?: FormState<T>) => void;
}

export interface AbstractFormControl<T = any> extends AbstractBaseControl<T> {
  setValidators: (validators?: ValidatorFn<T>[]) => void;
  subscribe: (subscriber: SubscriberControl<T>) => Subscription;
}

export type AbstractGroupControls<
  T extends AbstractGroupControl = AbstractGroupControl
> = Record<string, T>;

export interface AbstractGroup<
  T extends AbstractGroupControls = AbstractGroupControls
> {
  controls: T;
  errors: ValidatorError[];
  error?: ValidatorError;
  dirty: boolean;
  dirties: boolean;
  pristine: boolean;
  pristines: boolean;
  touched: boolean;
  toucheds: boolean;
  untouched: boolean;
  untoucheds: boolean;
  valid: boolean;
  invalid: boolean;
}

export type StateGroup<
  T extends AbstractGroupControls = AbstractGroupControls
> = {
  [K in keyof T]: T[K]['state'];
};

export type ValueGroup<
  T extends AbstractGroupControls = AbstractGroupControls
> = {
  [K in keyof T]: T[K]['value'];
};

export type ValidatorGroupFn<
  T extends AbstractGroupControls = AbstractGroupControls,
  V = any
> = (controls: T) => ValidatorResult<V>;

export interface AbstractFormGroup<
  T extends AbstractGroupControls = AbstractGroupControls
> extends AbstractGroup<T> {
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<T>[]) => void;
  state: StateGroup<T>;
  value: ValueGroup<T>;
}

export interface AbstractArrayControl<T = any> extends AbstractBaseControl<T> {
  uuid: string;
}

export type AbstractArrayControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractControls<T>;

export interface AbstractArrayGroup<T extends AbstractArrayControls, R = any>
  extends AbstractGroup<T> {
  state: ArrayStateGroup<T>;
  uuid: string;
  value: ArrayValueGroup<T>;
  resource?: R;
}

export type ArrayStateGroup<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['state'];
};

export type ArrayValueGroup<T extends AbstractArrayControls> = {
  [K in keyof T]: T[K]['value'];
};

export type ValidatorArrayFn<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>,
  V = any
> = (groups: G[]) => ValidatorResult<V>;

export interface AbstractArray<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>
> extends AbstractGroupControl<ArrayStateGroup<T>[]> {
  controls: T[];
  dirties: boolean;
  groups: G[];
  merge: (groups: G[]) => void;
  pristines: boolean;
  push: (group: G) => void;
  remove: (group: G) => void;
  set: (groups: G[]) => void;
  setValidators: (validators: ValidatorArrayFn<T, R>[]) => void;
  state: ArrayStateGroup<T>[];
  toucheds: boolean;
  untoucheds: boolean;
  value: ArrayValueGroup<T>[];
}

export interface FormControlProps<T = any> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormGroupProps<
  T extends AbstractGroupControls = AbstractGroupControls
> {
  controls: T;
  validators?: ValidatorGroupFn<T>[];
}

export interface FormArrayControlProps<T = any> {
  uuid: string;
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormArrayGroupProps<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any
> {
  controls: T;
  uuid: string;
  resource?: R;
  validators?: ValidatorGroupFn<T>[];
}

export interface FormArrayProps<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>
> {
  groups?: G[];
  validators?: ValidatorArrayFn<T, R>[];
}
