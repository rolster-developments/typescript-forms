import { AbstractArrayControls, AbstractReactiveArrayControl } from '../types';

export type FormArrayControls<
  T extends AbstractReactiveArrayControl = AbstractReactiveArrayControl
> = AbstractArrayControls<T>;
