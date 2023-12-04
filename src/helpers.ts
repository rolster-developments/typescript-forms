import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractControl,
  AbstractControls,
  AbstractGroup,
  AbstractGroupControls,
  FormState,
  StateGroup,
  ValidatorArrayFn,
  ValidatorGroupFn,
  ValueGroup
} from './types';

const FALSY_VALUE = ['false', 'undefined', '0', 0];

const toBoolean = (value: any): boolean => {
  return !(
    !(typeof value !== 'undefined' && value !== null) ||
    value === false ||
    FALSY_VALUE.includes(value)
  );
};

interface ControlValidProps<T> {
  state: FormState<T>;
  validators: ValidatorFn<T>[];
}

interface GroupValidProps<T extends AbstractGroupControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

interface ArrayValidProps<
  T extends AbstractArrayControls = AbstractArrayControls,
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

export const controlsAllChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value && toBoolean(control[props]),
    true
  );
};

export const controlsPartialChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value || toBoolean(control[props]),
    false
  );
};

export const controlsToState = <T extends AbstractGroupControls>(
  controls: T
): StateGroup<T> => {
  return Object.entries(controls).reduce((json, [key, { state }]) => {
    json[key as keyof T] = state;

    return json;
  }, {} as StateGroup<T>);
};

export const controlsToValue = <T extends AbstractGroupControls>(
  controls: T
): ValueGroup<T> => {
  return Object.entries(controls).reduce((json, [key, { value }]) => {
    json[key as keyof T] = value;

    return json;
  }, {} as ValueGroup<T>);
};

export const groupIsValid = <T extends AbstractGroupControls>({
  controls,
  validators
}: GroupValidProps<T>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(controls);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export function groupAllChecked<T extends AbstractGroupControls>(
  groups: AbstractGroup<T>[],
  key: keyof AbstractGroup<T>
): boolean {
  return groups.reduce((value, group) => value && toBoolean(group[key]), true);
}

export function groupPartialChecked<T extends AbstractGroupControls>(
  groups: AbstractGroup<T>[],
  key: keyof AbstractGroup<T>
): boolean {
  return groups.reduce((value, group) => value || toBoolean(group[key]), false);
}

export const arrayIsValid = <
  T extends AbstractArrayControls = AbstractArrayControls,
  R = any
>({
  groups,
  validators
}: ArrayValidProps<T, R>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(groups);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};
