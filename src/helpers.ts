import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractControl,
  AbstractControls,
  AbstractGroup,
  AbstractGroupControls,
  FormArrayProps,
  FormControlProps,
  FormGroupProps,
  FormState,
  StateGroup,
  ValidatorArrayFn,
  ValidatorGroupFn,
  ValueGroup
} from './types';
import {
  RolsterControl,
  RolsterControls,
  RolsterFormArrayControls,
  RolsterFormArrayGroup
} from './types-rolster';

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

export const controlsToState = <C extends AbstractGroupControls>(
  controls: C
): StateGroup<C> => {
  return Object.entries(controls).reduce((json, [key, { state }]) => {
    json[key as keyof C] = state;

    return json;
  }, {} as StateGroup<C>);
};

export const controlsToValue = <C extends AbstractGroupControls>(
  controls: C
): ValueGroup<C> => {
  return Object.entries(controls).reduce((json, [key, { value }]) => {
    json[key as keyof C] = value;

    return json;
  }, {} as ValueGroup<C>);
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
  C extends AbstractArrayControls = AbstractArrayControls,
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

type Controls = RolsterControls<RolsterControl>;

export function instanceOfFormControlProps<T, C extends FormControlProps<T>>(
  props: any
): props is C {
  return (
    typeof props === 'object' && ('state' in props || 'validators' in props)
  );
}

export function instanceOfFormGroupProps<
  C extends Controls,
  G extends FormGroupProps<C>
>(props: any): props is G {
  return (
    typeof props === 'object' && ('controls' in props || 'validators' in props)
  );
}
type RolsterArrayProps<
  T extends RolsterFormArrayControls = RolsterFormArrayControls,
  R = any
> = FormArrayProps<T, R, RolsterFormArrayGroup<T, R>>;

export function instanceOfFormArrayProps<
  T extends RolsterFormArrayControls,
  R,
  A extends RolsterArrayProps<T, R>
>(props: any): props is A {
  return (
    typeof props === 'object' && ('groups' in props || 'validators' in props)
  );
}
