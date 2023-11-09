import {
  AbstractArray,
  AbstractArrayControl,
  AbstractBaseControl,
  AbstractFormControl,
  AbstractFormGroup
} from './types';

export type RolsterControls<T extends AbstractBaseControl = any> = Record<
  string,
  T
>;

export interface RolsterControl<T = any, C extends RolsterControls = any>
  extends AbstractBaseControl<T> {
  setFormGroup: (formGroup: RolsterGroup<C>) => void;
  updateValueAndValidity: () => void;
}

export interface RolsterGroup<T extends RolsterControls>
  extends AbstractFormGroup<T> {
  updateValueAndValidity: (controls?: boolean) => void;
}

export type RolsterFormControls = RolsterControls<AbstractFormControl>;
export type RolsterFormControl<T = any> = RolsterControl<
  T,
  RolsterFormControls
>;
export type RolsterFormGroup = RolsterGroup<RolsterFormControls>;

export type RolsterFormArrayControls = RolsterControls<AbstractArrayControl>;

export interface RolsterFormArrayGroup<T extends RolsterFormArrayControls>
  extends RolsterGroup<T> {
  setFormArray: (formArray: RolsterFormArray<T>) => void;
}

export interface RolsterFormArray<T extends RolsterFormArrayControls>
  extends AbstractArray<T> {
  updateValueAndValidity: () => void;
}
