import {
  ValidatorError,
  ValidatorFn,
  ValidatorResult
} from '@rolster/validators';

export type FormState<T = any> = T | undefined | null;

export type ValidationFormType = 'control' | 'group' | 'array';

export interface ValidationFormError<T = any> extends ValidatorError<T> {
  type: ValidationFormType;
}

export type SubscriberControl<T> = (state?: FormState<T>) => void;

export interface AbstractControl<T = any> {
  dirty: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  pristine: boolean;
  touched: boolean;
  untouched: boolean;
  valid: boolean;
  value: T;
  wrong: boolean;
  error?: ValidatorError;
  state?: FormState<T>;
}

export type AbstractControls<T extends AbstractControl = AbstractControl> =
  Record<string, T>;

export interface AbstractGroupControl<T = any> extends AbstractControl<T> {
  reset: () => void;
  subscribe: (subscriber: SubscriberControl<T>) => Unsubscription;
}

export interface AbstractBaseControl<T = any> extends AbstractGroupControl<T> {
  blur: () => void;
  disable: () => void;
  disabled: boolean;
  enable: () => void;
  enabled: boolean;
  focus: () => void;
  focused: boolean;
  setState: (state?: FormState<T>) => void;
  touch: () => void;
  unfocused: boolean;
  untouch: () => void;
}

export interface AbstractFormControl<T = any> extends AbstractBaseControl<T> {
  setValidators: (validators?: ValidatorFn<T>[]) => void;
}

export type AbstractGroupControls<
  T extends AbstractGroupControl = AbstractGroupControl
> = Record<string, T>;

export interface AbstractGroup<
  T extends AbstractGroupControls = AbstractGroupControls
> {
  controls: T;
  dirty: boolean;
  dirties: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  pristine: boolean;
  pristines: boolean;
  touched: boolean;
  toucheds: boolean;
  untouched: boolean;
  untoucheds: boolean;
  valid: boolean;
  wrong: boolean;
  error?: ValidatorError;
}

export type StateGroup<
  C extends AbstractGroupControls = AbstractGroupControls
> = {
  [K in keyof C]: C[K]['state'];
};

export type ValueGroup<
  C extends AbstractGroupControls = AbstractGroupControls
> = {
  [K in keyof C]: C[K]['value'];
};

export type ValidatorGroupFn<
  C extends AbstractGroupControls = AbstractGroupControls,
  V = any
> = (controls: C) => ValidatorResult<V>;

export type SubscriberGroup<
  C extends AbstractGroupControls = AbstractGroupControls
> = (state: StateGroup<C>) => void;

export interface AbstractFormGroup<
  C extends AbstractGroupControls = AbstractGroupControls
> extends AbstractGroup<C> {
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  state: StateGroup<C>;
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
  value: ValueGroup<C>;
}

export interface AbstractArrayControl<T = any> extends AbstractFormControl<T> {
  uuid: string;
}

export type AbstractArrayGroupControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractControls<T>;

export interface AbstractArrayGroup<
  C extends AbstractArrayGroupControls,
  R = any
> extends AbstractGroup<C> {
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  state: ArrayStateGroup<C>;
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
  uuid: string;
  value: ArrayValueGroup<C>;
  resource?: R;
}

export type ArrayStateGroup<C extends AbstractArrayGroupControls> = {
  [K in keyof C]: C[K]['state'];
};

export type ArrayValueGroup<C extends AbstractArrayGroupControls> = {
  [K in keyof C]: C[K]['value'];
};

export type ValidatorArrayFn<
  T extends AbstractArrayGroupControls = AbstractArrayGroupControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>,
  V = any
> = (groups: G[]) => ValidatorResult<V>;

export interface AbstractArray<
  T extends AbstractArrayGroupControls = AbstractArrayGroupControls,
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
  wrong: boolean;
}

export interface FormControlProps<T = any> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export interface FormGroupProps<
  C extends AbstractGroupControls = AbstractGroupControls
> {
  controls: C;
  validators?: ValidatorGroupFn<C>[];
}

export interface FormArrayControlProps<T = any> extends FormControlProps<T> {
  uuid: string;
}

export interface FormArrayGroupProps<
  C extends AbstractArrayGroupControls = AbstractArrayGroupControls,
  R = any
> extends FormGroupProps<C> {
  uuid: string;
  resource?: R;
}

export interface FormArrayProps<
  C extends AbstractArrayGroupControls = AbstractArrayGroupControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> {
  groups?: G[];
  validators?: ValidatorArrayFn<C, R>[];
}
