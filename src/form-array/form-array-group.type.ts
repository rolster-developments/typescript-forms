import {
  AbstractControls,
  AbstractGroup,
  FormGroupOptions,
  SubscriberGroup,
  ValidatorGroupFn
} from '../form-group/form-group.type';
import {
  AbstractArrayControl,
  ReactiveArrayControl
} from './form-array-control.type';

export type AbstractArrayControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractControls<T>;

export type FormArrayControls<
  T extends ReactiveArrayControl = ReactiveArrayControl
> = AbstractArrayControls<T>;

export type ArrayControlsValue<C extends AbstractArrayControls> = {
  [K in keyof C]: C[K]['value'];
};

export interface AbstractArrayGroup<
  C extends AbstractArrayControls,
  R = any
> extends AbstractGroup<C> {
  setValidators: (validators: ValidatorGroupFn<C>[]) => void;
  readonly uuid: string;
  readonly value: ArrayControlsValue<C>;
  resource?: R;
}

export interface ReactiveArrayGroup<
  C extends AbstractArrayControls,
  R = any
> extends AbstractArrayGroup<C, R> {
  subscribe: (subscriber: SubscriberGroup<C>) => Unsubscription;
}

export interface FormArrayGroupOptions<
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any
> extends FormGroupOptions<C> {
  uuid: string;
  resource?: R;
}
