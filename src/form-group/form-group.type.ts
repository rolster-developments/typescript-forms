import { ValidatorError, ValidatorResult } from '@rolster/validators';

import { AbstractControl } from '../form-control/form-control.type';

export type AbstractControls<T extends AbstractControl = AbstractControl> =
  Record<string, T>;

export interface AbstractGroup<C extends AbstractControls = AbstractControls> {
  readonly controls: C;
  readonly dirties: boolean;
  readonly dirty: boolean;
  readonly errors: ValidatorError[];
  readonly invalid: boolean;
  readonly pristine: boolean;
  readonly pristines: boolean;
  readonly touched: boolean;
  readonly toucheds: boolean;
  readonly untouched: boolean;
  readonly untoucheds: boolean;
  readonly valid: boolean;
  readonly wrong: boolean;
  readonly error?: ValidatorError;
}

export type ControlsValue<C extends AbstractControls = AbstractControls> = {
  [K in keyof C]: C[K]['value'];
};

export type ValidatorGroupFn<
  C extends AbstractControls = AbstractControls,
  V = any
> = (controls: C) => ValidatorResult<V>;

export type SubscriberGroup<C extends AbstractControls = AbstractControls> = (
  value: ControlsValue<C>
) => void;

export interface AbstractFormGroup<
  C extends AbstractControls = AbstractControls
> extends AbstractGroup<C> {
  reset: () => void;
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  setValue(value: Partial<ControlsValue<C>>): void;
  readonly value: ControlsValue<C>;
}

export interface ReactiveFormGroup<
  C extends AbstractControls = AbstractControls
> extends AbstractFormGroup<C> {
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
}

export interface FormGroupOptions<
  C extends AbstractControls = AbstractControls
> {
  controls: C;
  validators?: ValidatorGroupFn<C>[];
}
