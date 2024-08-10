import { parseBoolean } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  AbstractControl,
  AbstractArrayGroup,
  AbstractArrayControls,
  AbstractGroup,
  AbstractControls,
  ValidatorArrayFn,
  ValidatorGroupFn,
  ValueGroup
} from './types';

interface ControlValidOptions<T> {
  value: T;
  validators: ValidatorFn<T>[];
}

interface GroupValidOptions<T extends AbstractControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

interface ArrayValidOptions<
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>
> {
  groups: G[];
  validators: ValidatorArrayFn<T, R>[];
}

export const controlIsValid = <T>({
  value,
  validators
}: ControlValidOptions<T>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(value);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export const controlsAllChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  key: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) =>
      control.disabled ? value : value && parseBoolean(control[key]),
    true
  );
};

export const controlsPartialChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  key: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) =>
      control.disabled ? value : value || parseBoolean(control[key]),
    false
  );
};

export const controlsToValue = <C extends AbstractControls>(
  controls: C
): ValueGroup<C> => {
  return Object.entries(controls).reduce((result, [key, { value }]) => {
    result[key as keyof C] = value;

    return result;
  }, {} as ValueGroup<C>);
};

export const groupIsValid = <C extends AbstractControls>({
  controls,
  validators
}: GroupValidOptions<C>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(controls);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export function groupAllChecked<C extends AbstractControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce(
    (value, group) => value && parseBoolean(group[key]),
    true
  );
}

export function groupPartialChecked<C extends AbstractControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce(
    (value, group) => value || parseBoolean(group[key]),
    false
  );
}

export const arrayIsValid = <
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
