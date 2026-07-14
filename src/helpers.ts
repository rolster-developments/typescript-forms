import { ValidatorError } from '@rolster/validators';

import { AbstractControl } from './form-control/form-control.type';
import {
  AbstractControls,
  AbstractFormGroup
} from './form-group/form-group.type';

function reduceErrors(errors: ValidatorError[]): string[] {
  return errors.reduce((keys: string[], { id }) => [...keys, id], []);
}

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

export * from './form-array/form-array.helper';
export * from './form-control/form-control.helper';
export * from './form-group/form-group.helper';
