import { parseBoolean } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractControl,
  AbstractControls,
  AbstractFormGroup,
  AbstractGroup,
  ControlsValue,
  ValidatorArrayFn,
  ValidatorGroupFn
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

function reduceErrors(errors: ValidatorError[]): string[] {
  return errors.reduce((keys: string[], { id }) => [...keys, id], []);
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
): ControlsValue<C> => {
  return Object.entries(controls).reduce((result, [key, { value }]) => {
    result[key as keyof C] = value;

    return result;
  }, {} as ControlsValue<C>);
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

export function hasError(errors: ValidatorError[], key: string): boolean {
  return reduceErrors(errors).includes(key);
}

export function someErrors(errors: ValidatorError[], keys: string[]): boolean {
  return reduceErrors(errors).some((key) => keys.includes(key));
}

export function reduceControlsToArray<
  T extends AbstractControl,
  C extends AbstractControls<T>,
  K extends keyof T
>(controls: C, key: K): T[K][] {
  return Object.values(controls).map((control) => control[key]);
}

export function reduceGroupToArray<
  T extends AbstractControl,
  C extends AbstractControls<T>,
  K extends keyof T
>(group: AbstractFormGroup<C>, key: K): T[K][] {
  return reduceControlsToArray(group.controls, key);
}
