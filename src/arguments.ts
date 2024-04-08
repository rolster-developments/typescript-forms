import { ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayGroup,
  AbstractArrayGroupControls,
  AbstractGroupControls,
  FormArrayProps,
  FormControlProps,
  FormGroupProps,
  FormState,
  ValidatorArrayFn,
  ValidatorGroupFn
} from './types';

type ArgsControlProps<T = any> = [
  FormControlProps<T> | FormState<T>,
  Undefined<ValidatorFn<T>[]>
];

type ArgsGroupProps<C extends AbstractGroupControls> = [
  FormGroupProps<C> | C,
  Undefined<ValidatorGroupFn<C>[]>
];

type ArgsArrayProps<
  C extends AbstractArrayGroupControls,
  R,
  G extends AbstractArrayGroup<C, R>
> = [
  Undefined<FormArrayProps<C, R, G> | AbstractArrayGroup<C, R>[]>,
  Undefined<ValidatorArrayFn<C, R, G>[]>
];

function instanceOfFormControlProps<T, C extends FormControlProps<T>>(
  props: any
): props is C {
  return (
    typeof props === 'object' && ('state' in props || 'validators' in props)
  );
}

function instanceOfFormGroupProps<
  C extends AbstractGroupControls,
  G extends FormGroupProps<C>
>(props: any): props is G {
  return typeof props === 'object' && 'controls' in props;
}

function instanceOfFormArrayProps<
  C extends AbstractArrayGroupControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  A extends FormArrayProps<C, R, G>
>(props: any): props is A {
  return (
    typeof props === 'object' && ('groups' in props || 'validators' in props)
  );
}

export function createFormControlProps<T, C extends FormControlProps<T>>(
  ...argsProps: ArgsControlProps<T>
): C {
  const [props, validators] = argsProps;

  if (!props) {
    return { state: undefined, validators } as C;
  }

  if (!validators && instanceOfFormControlProps<T, C>(props)) {
    return props;
  }

  return { state: props as FormState<T>, validators } as C;
}

export function createFormGroupProps<
  C extends AbstractGroupControls,
  G extends FormGroupProps<C>
>(...argsProps: ArgsGroupProps<C>): G {
  const [props, validators] = argsProps;

  if (!validators && instanceOfFormGroupProps<C, G>(props)) {
    return props;
  }

  return { controls: props as C, validators } as G;
}

export function createFormArrayProps<
  C extends AbstractArrayGroupControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  A extends FormArrayProps<C, R, G>
>(...argsProps: ArgsArrayProps<C, R, G>): A {
  const [props, validators] = argsProps;

  if (!props) {
    return { groups: undefined, validators } as A;
  }

  if (!validators && instanceOfFormArrayProps<C, R, G, A>(props)) {
    return props;
  }

  return { groups: props as AbstractArrayGroup<C, R>[], validators } as A;
}
