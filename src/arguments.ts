import { ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayControls,
  AbstractArrayGroup,
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

function controlIsOptions<T, O extends FormControlOptions<T>>(
  options: any
): options is O {
  return (
    typeof options === 'object' &&
    ('value' in options || 'validators' in options)
  );
}

function groupIsOptions<
  C extends AbstractControls,
  O extends FormGroupOptions<C>
>(options: any): options is O {
  return typeof options === 'object' && 'controls' in options;
}

function arrayIsOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  O extends FormArrayOptions<C, R, G>
>(options: any): options is O {
  return (
    typeof options === 'object' &&
    ('groups' in options || 'validators' in options)
  );
}

export function createFormControlOptions<T, O extends FormControlOptions<T>>(
  ...controlOptions: ArgsControlOptions<T>
): O {
  const [options, validators] = controlOptions;

  if (!options) {
    return { value: options, validators } as O;
  }

  if (!validators && controlIsOptions<T, O>(options)) {
    return options;
  }

  return {
    value: options as T,
    validators
  } as O;
}

export function createFormGroupOptions<
  C extends AbstractControls,
  O extends FormGroupOptions<C>
>(...groupOptions: ArgsGroupOptions<C>): O {
  const [options, validators] = groupOptions;

  if (!validators && groupIsOptions<C, O>(options)) {
    return options;
  }

  return {
    controls: options as C,
    validators
  } as O;
}

export function createFormArrayOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  O extends FormArrayOptions<C, R, G>
>(...arrayOptions: ArgsArrayOptions<C, R, G>): O {
  const [options, validators] = arrayOptions;

  if (!options) {
    return { groups: options, validators } as O;
  }

  if (!validators && arrayIsOptions<C, R, G, O>(options)) {
    return options;
  }

  return {
    groups: options as AbstractArrayGroup<C, R>[],
    validators
  } as O;
}
