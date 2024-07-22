import {
  ValidatorError,
  ValidatorFn,
  ValidatorResult
} from '@rolster/validators';

export type ValidationFormType = 'control' | 'group' | 'array';

export interface ValidationFormError<T = any> extends ValidatorError<T> {
  type: ValidationFormType;
}

export type SubscriberControl<T> = (state: T) => void;

export interface AbstractControl<T = any> {
  dirty: boolean;
  errors: ValidatorError[];
  invalid: boolean;
  pristine: boolean;
  reset: () => void;
  touched: boolean;
  untouched: boolean;
  valid: boolean;
  wrong: boolean;
  error?: ValidatorError;
  state?: T;
}

export interface AbstractFormControl<T = any> extends AbstractControl<T> {
  blur: () => void;
  disable: () => void;
  disabled: boolean;
  enable: () => void;
  enabled: boolean;
  focus: () => void;
  focused: boolean;
  setState: (state: T) => void;
  touch: () => void;
  unfocused: boolean;
  untouch: () => void;
  setValidators: (validators?: ValidatorFn<T>[]) => void;
}

export interface AbstractReactiveControl<T = any>
  extends AbstractFormControl<T> {
  subscribe: (subscriber: SubscriberControl<T>) => Unsubscription;
}

export type AbstractControls<T extends AbstractControl = AbstractControl> =
  Record<string, T>;

export interface AbstractGroup<T extends AbstractControls = AbstractControls> {
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

export type StateGroup<C extends AbstractControls = AbstractControls> = {
  [K in keyof C]: C[K]['state'];
};

export type ValidatorGroupFn<
  C extends AbstractControls = AbstractControls,
  V = any
> = (controls: C) => ValidatorResult<V>;

export type SubscriberGroup<C extends AbstractControls = AbstractControls> = (
  state: StateGroup<C>
) => void;

export interface AbstractFormGroup<
  C extends AbstractControls = AbstractControls
> extends AbstractGroup<C> {
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  state: StateGroup<C>;
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
}

export interface AbstractArrayControl<T = any> extends AbstractFormControl<T> {
  uuid: string;
}

export interface AbstractReactiveArrayControl<T = any>
  extends AbstractArrayControl<T> {
  subscribe: (subscriber: SubscriberControl<T>) => Unsubscription;
}

export type AbstractArrayControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractControls<T>;

export interface AbstractArrayGroup<C extends AbstractArrayControls, R = any>
  extends AbstractGroup<C> {
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  state: ArrayStateGroup<C>;
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
  uuid: string;
  resource?: R;
}

export type ArrayStateGroup<C extends AbstractArrayControls> = {
  [K in keyof C]: C[K]['state'];
};

export type ValidatorArrayFn<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>,
  V = any
> = (groups: G[]) => ValidatorResult<V>;

export type ArrayFormControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractArrayControls<T>;

export type SubscriberArray<C extends ArrayFormControls> = SubscriberControl<
  ArrayStateGroup<C>[]
>;

export interface AbstractArray<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> extends AbstractControl<ArrayStateGroup<C>[]> {
  controls: C[];
  dirties: boolean;
  groups: G[];
  merge: (groups: G[]) => void;
  pristines: boolean;
  push: (group: G) => void;
  remove: (group: G) => void;
  set: (groups: G[]) => void;
  setValidators: (validators: ValidatorArrayFn<C, R>[]) => void;
  subscribe: (subscriber: SubscriberArray<C>) => Unsubscription;
  toucheds: boolean;
  untoucheds: boolean;
  wrong: boolean;
}

export interface FormControlOptions<T = any> {
  state: T;
  validators?: ValidatorFn<T>[];
}

export type FormStateOptions<T> = Omit<FormControlOptions<T>, 'validators'>;
export type FormValidatorsOptions<T> = Omit<FormControlOptions<T>, 'state'>;

export interface FormGroupOptions<
  C extends AbstractControls = AbstractControls
> {
  controls: C;
  validators?: ValidatorGroupFn<C>[];
}

export interface FormArrayControlOptions<T = any>
  extends FormControlOptions<T> {
  uuid: string;
}

export interface FormArrayGroupOptions<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any
> extends FormGroupOptions<C> {
  uuid: string;
  resource?: R;
}

export interface FormArrayOptions<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> {
  groups?: G[];
  validators?: ValidatorArrayFn<C, R>[];
}
