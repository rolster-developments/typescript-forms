import { ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayGroup,
  AbstractArrayControls,
  AbstractControls,
  FormArrayOptions,
  FormControlOptions,
  FormGroupOptions,
  ValidatorArrayFn,
  ValidatorGroupFn
} from './types';

type ArgsControlOptions<T = any> = [
  FormControlOptions<T> | T | undefined,
  Undefined<ValidatorFn<T>[]>
];

type ArgsGroupOptions<C extends AbstractControls> = [
  FormGroupOptions<C> | C,
  Undefined<ValidatorGroupFn<C>[]>
];

type ArgsArrayOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>
> = [
  Undefined<FormArrayOptions<C, R, G> | AbstractArrayGroup<C, R>[]>,
  Undefined<ValidatorArrayFn<C, R, G>[]>
];

function itIsFormControlOptions<T, C extends FormControlOptions<T>>(
  props: any
): props is C {
  return (
    typeof props === 'object' && ('value' in props || 'validators' in props)
  );
}

function itIsFormGroupOptions<
  C extends AbstractControls,
  G extends FormGroupOptions<C>
>(props: any): props is G {
  return typeof props === 'object' && 'controls' in props;
}

function itIsFormArrayOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  A extends FormArrayOptions<C, R, G>
>(props: any): props is A {
  return (
    typeof props === 'object' && ('groups' in props || 'validators' in props)
  );
}

export function createFormControlOptions<T, C extends FormControlOptions<T>>(
  ...argsProps: ArgsControlOptions<T>
): C {
  const [props, validators] = argsProps;

  if (!props) {
    return { value: props, validators } as C;
  }

  if (!validators && itIsFormControlOptions<T, C>(props)) {
    return props;
  }

  return {
    value: props as T,
    validators
  } as C;
}

export function createFormGroupOptions<
  C extends AbstractControls,
  G extends FormGroupOptions<C>
>(...argsProps: ArgsGroupOptions<C>): G {
  const [props, validators] = argsProps;

  if (!validators && itIsFormGroupOptions<C, G>(props)) {
    return props;
  }

  return {
    controls: props as C,
    validators
  } as G;
}

export function createFormArrayOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  A extends FormArrayOptions<C, R, G>
>(...argsProps: ArgsArrayOptions<C, R, G>): A {
  const [props, validators] = argsProps;

  if (!props) {
    return { groups: props, validators } as A;
  }

  if (!validators && itIsFormArrayOptions<C, R, G, A>(props)) {
    return props;
  }

  return {
    groups: props as AbstractArrayGroup<C, R>[],
    validators
  } as A;
}
