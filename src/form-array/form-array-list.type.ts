import { AbstractArrayControl } from './form-array-control.type';
import {
  AbstractArrayControls,
  ArrayControlsValue
} from './form-array-group.type';

export interface AbstractArrayList<
  C extends AbstractArrayControls = AbstractArrayControls
> extends AbstractArrayControl<ArrayControlsValue<C>[]> {
  controls: C[];
  push(controls: C): void;
  remove(controls: C): void;
}

export type ArrayListValueToControls<
  C extends AbstractArrayControls = AbstractArrayControls
> = (value: ArrayControlsValue<C>) => C;
