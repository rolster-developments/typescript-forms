import { Observer } from '@rolster/commons';
import { ValidatorResult } from '@rolster/validators';

import { AbstractValueControl } from '../form-control/form-control.type';
import { AbstractArrayControl } from './form-array-control.type';
import {
  AbstractArrayControls,
  AbstractArrayGroup,
  ArrayControlsValue
} from './form-array-group.type';

export type ValidatorArrayFn<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>,
  V = any
> = (groups: G[]) => ValidatorResult<V>;

export interface AbstractArray<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> extends AbstractValueControl<ArrayControlsValue<C>[], G[]> {
  readonly controls: C[];
  readonly dirties: boolean;
  disable: () => void;
  enable: () => void;
  findByUuid: (uuid: string) => Undefined<G>;
  readonly groups: G[];
  merge: (groups: G[]) => void;
  readonly pristines: boolean;
  push: (group: G) => void;
  remove: (group: G) => void;
  setValidators: (validators: ValidatorArrayFn<C, R>[]) => void;
  readonly toucheds: boolean;
  readonly untoucheds: boolean;
  readonly value: ArrayControlsValue<C>[];
  readonly wrong: boolean;
}

export interface ReactiveArray<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> extends AbstractArray<C, R, G> {
  subscribe: (subscriber: SubscriberArray<C>) => Unsubscription;
}

export interface FormArrayOptions<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<C, R> = AbstractArrayGroup<C, R>
> {
  groups?: G[];
  validators?: ValidatorArrayFn<C, R>[];
}

export type ArrayFormControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractArrayControls<T>;

export type SubscriberArray<C extends ArrayFormControls> = Observer<
  ArrayControlsValue<C>[]
>;
