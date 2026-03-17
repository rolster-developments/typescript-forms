import { parseBoolean } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import {
  AbstractArrayControls,
  AbstractArrayGroup
} from './form-array-group.type';
import { FormArrayOptions, ValidatorArrayFn } from './form-array.type';
import { AbstractControls, AbstractGroup } from '../form-group/form-group.type';

type ArrayArgsOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>
> = [
  Undefined<FormArrayOptions<C, R, G> | AbstractArrayGroup<C, R>[]>,
  Undefined<ValidatorArrayFn<C, R, G>[]>
];

interface ArrayValidOptions<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>
> {
  groups: G[];
  validators: ValidatorArrayFn<T, R>[];
}

function valueIsArrayOptions<
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

export function createFormArrayOptions<
  C extends AbstractArrayControls,
  R,
  G extends AbstractArrayGroup<C, R>,
  O extends FormArrayOptions<C, R, G>
>(...argsOptions: ArrayArgsOptions<C, R, G>): O {
  const [options, validators] = argsOptions;

  if (!options) {
    return { groups: options, validators } as O;
  }

  if (!validators && valueIsArrayOptions<C, R, G, O>(options)) {
    return options;
  }

  return {
    groups: options as AbstractArrayGroup<C, R>[],
    validators
  } as O;
}

export const formArrayIsValid = <
  C extends AbstractArrayControls = AbstractArrayControls,
  R = any
>({
  groups,
  validators
}: ArrayValidOptions<C, R>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(groups);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export function verifyAllTrueInGroups<C extends AbstractControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce(
    (value, group) => value && parseBoolean(group[key]),
    true
  );
}

export function verifyAnyTrueInGroups<C extends AbstractControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce(
    (value, group) => value || parseBoolean(group[key]),
    false
  );
}
