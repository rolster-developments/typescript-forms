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
  readonly dirty: boolean;
  readonly disabled: boolean;
  readonly enabled: boolean;
  readonly errors: ValidatorError[];
  readonly invalid: boolean;
  readonly pristine: boolean;
  reset: () => void;
  readonly touched: boolean;
  readonly untouched: boolean;
  readonly valid: boolean;
  readonly wrong: boolean;
  readonly error?: ValidatorError;
  readonly state?: T;
}

export interface AbstractFormControl<T = any> extends AbstractControl<T> {
  blur: () => void;
  disable: () => void;
  enable: () => void;
  focus: () => void;
  readonly focused: boolean;
  setState: (state: T) => void;
  setValidators: (validators?: ValidatorFn<T>[]) => void;
  touch: () => void;
  readonly unfocused: boolean;
}

export interface AbstractReactiveControl<T = any>
  extends AbstractFormControl<T> {
  subscribe: (subscriber: SubscriberControl<T>) => Unsubscription;
}

export type AbstractControls<T extends AbstractControl = AbstractControl> =
  Record<string, T>;

export interface AbstractGroup<T extends AbstractControls = AbstractControls> {
  readonly controls: T;
  readonly dirty: boolean;
  readonly dirtyAll: boolean;
  readonly errors: ValidatorError[];
  readonly invalid: boolean;
  readonly pristine: boolean;
  readonly pristineAll: boolean;
  readonly touched: boolean;
  readonly touchedAll: boolean;
  readonly untouched: boolean;
  readonly untouchedAll: boolean;
  readonly valid: boolean;
  readonly wrong: boolean;
  readonly error?: ValidatorError;
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
  readonly state: StateGroup<C>;
}

export interface AbstractReactiveGroup<
  C extends AbstractControls = AbstractControls
> extends AbstractFormGroup<C> {
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
}

export interface AbstractArrayControl<T = any> extends AbstractFormControl<T> {
  readonly uuid: string;
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
  readonly state: ArrayStateGroup<C>;
  readonly uuid: string;
  resource?: R;
}

export interface AbstractReactiveArrayGroup<
  C extends AbstractArrayControls,
  R = any
> extends AbstractArrayGroup<C, R> {
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
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
  readonly controls: C[];
  readonly dirtyAll: boolean;
  disable: () => void;
  enable: () => void;
  readonly groups: G[];
  merge: (groups: G[]) => void;
  readonly pristineAll: boolean;
  push: (group: G) => void;
  remove: (group: G) => void;
  set: (groups: G[]) => void;
  setValidators: (validators: ValidatorArrayFn<C, R>[]) => void;
  readonly touchedAll: boolean;
  readonly untouchedAll: boolean;
  readonly wrong: boolean;
}

export interface AbstractReactiveArray<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> extends AbstractArray<C, R, G> {
  subscribe: (subscriber: SubscriberArray<C>) => Unsubscription;
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
