import { parseBoolean } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';

import { AbstractControl } from '../form-control/form-control.type';
import {
  AbstractControls,
  ControlsValue,
  FormGroupOptions,
  ValidatorGroupFn
} from './form-group.type';

type GroupArgsOptions<C extends AbstractControls> = [
  FormGroupOptions<C> | C,
  Undefined<ValidatorGroupFn<C>[]>
];

interface GroupValidOptions<T extends AbstractControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

function valueIsGroupOptions<
  C extends AbstractControls,
  O extends FormGroupOptions<C>
>(options: any): options is O {
  return typeof options === 'object' && 'controls' in options;
}

export function createFormGroupOptions<
  C extends AbstractControls,
  O extends FormGroupOptions<C>
>(...argsOptions: GroupArgsOptions<C>): O {
  const [options, validators] = argsOptions;

  if (!validators && valueIsGroupOptions<C, O>(options)) {
    return options;
  }

  return {
    controls: options as C,
    validators
  } as O;
}

export const formGroupIsValid = <C extends AbstractControls>({
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

export const controlsToValue = <C extends AbstractControls>(
  controls: C
): ControlsValue<C> => {
  return Object.entries(controls).reduce((result, [key, { value }]) => {
    result[key as keyof C] = value;

    return result;
  }, {} as ControlsValue<C>);
};

export const verifyAllTrueInControls = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  key: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) =>
      control.disabled ? value : value && parseBoolean(control[key]),
    true
  );
};

export const verifyAnyTrueInControls = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  key: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) =>
      control.disabled ? value : value || parseBoolean(control[key]),
    false
  );
};
