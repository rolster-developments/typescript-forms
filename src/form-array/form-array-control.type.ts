import { Observer } from '@rolster/commons';

import {
  AbstractFormControl,
  FormControlOptions
} from '../form-control/form-control.type';

export interface AbstractArrayControl<T = any> extends AbstractFormControl<T> {
  readonly uuid: string;
}

export interface ReactiveArrayControl<T = any> extends AbstractArrayControl<T> {
  subscribe: (subscriber: Observer<T>) => Unsubscription;
}

export interface FormArrayControlOptions<
  T = any
> extends FormControlOptions<T> {
  uuid: string;
}
