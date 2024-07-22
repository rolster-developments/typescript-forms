import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayGroupControls,
  AbstractArrayGroup,
  AbstractBaseControl,
  AbstractControls,
  AbstractGroup,
  AbstractGroupControls,
  StateGroup,
  ValidatorArrayFn,
  ValidatorGroupFn
} from './types';

const FALSY_VALUE = ['false', 'undefined', '0', 0];

function toBoolean(value: any): boolean {
  return !(
    !(typeof value !== 'undefined' && value !== null) ||
    value === false ||
    FALSY_VALUE.includes(value)
  );
}

interface ControlValidProps<T> {
  state: T;
  validators: ValidatorFn<T>[];
}

interface GroupValidProps<T extends AbstractGroupControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

interface ArrayValidProps<
  T extends AbstractArrayGroupControls = AbstractArrayGroupControls,
  R = any,
  G extends AbstractArrayGroup<T, R> = AbstractArrayGroup<T, R>
> {
  groups: G[];
  validators: ValidatorArrayFn<T, R>[];
}

export const controlIsValid = <T>(
  props: ControlValidProps<T>
): ValidatorError[] => {
  const { state, validators } = props;

  return validators.reduce((errors, validator) => {
    const error = validator(state);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export const controlsAllChecked = <T extends AbstractBaseControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value && toBoolean(control[props]),
    true
  );
};

export const controlsPartialChecked = <T extends AbstractBaseControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value || toBoolean(control[props]),
    false
  );
};

export const controlsToState = <C extends AbstractGroupControls>(
  controls: C
): StateGroup<C> => {
  return Object.entries(controls).reduce((result, [key, { state }]) => {
    result[key as keyof C] = state;

    return result;
  }, {} as StateGroup<C>);
};

export const groupIsValid = <C extends AbstractGroupControls>({
  controls,
  validators
}: GroupValidProps<C>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(controls);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export function groupAllChecked<C extends AbstractGroupControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce((value, group) => value && toBoolean(group[key]), true);
}

export function groupPartialChecked<C extends AbstractGroupControls>(
  groups: AbstractGroup<C>[],
  key: keyof AbstractGroup<C>
): boolean {
  return groups.reduce((value, group) => value || toBoolean(group[key]), false);
}

export const arrayIsValid = <
  C extends AbstractArrayGroupControls = AbstractArrayGroupControls,
  R = any
>({
  groups,
  validators
}: ArrayValidProps<C, R>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(groups);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};
