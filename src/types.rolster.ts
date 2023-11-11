import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayGroup,
  AbstractBaseControl,
  AbstractControls,
  AbstractGroup
} from './types';

export type RolsterControls<
  T extends AbstractBaseControl = AbstractBaseControl
> = AbstractControls<T>;

export interface RolsterControl<
  T = any,
  C extends RolsterControls = RolsterControls
> extends AbstractBaseControl<T> {
  setParent: (parent: RolsterGroup<C>) => void;
  updateValueAndValidity: () => void;
}

export interface RolsterGroup<T extends RolsterControls = RolsterControls>
  extends AbstractGroup<T> {
  updateValueAndValidity: (controls?: boolean) => void;
}

export type RolsterFormControls = RolsterControls<RolsterControl>;
export type RolsterFormControl<T = any> = RolsterControl<
  T,
  RolsterFormControls
>;
export type RolsterFormGroup = RolsterGroup<RolsterFormControls>;

export interface RolsterArrayControl<
  T = any,
  C extends RolsterControls = RolsterControls
> extends AbstractArrayControl<T> {
  setParent: (parent: RolsterGroup<C>) => void;
  updateValueAndValidity: () => void;
}

export type RolsterFormArrayControls = RolsterControls<RolsterArrayControl>;

export interface RolsterFormArrayGroup<
  T extends RolsterFormArrayControls = RolsterFormArrayControls,
  R = any
> extends AbstractArrayGroup<T, R> {
  setParent: (parent: RolsterFormArray<T>) => void;
  updateValueAndValidity: (controls?: boolean) => void;
}

export interface RolsterFormArray<
  T extends RolsterFormArrayControls = RolsterFormArrayControls,
  R = any
> extends AbstractArray<T, R, RolsterFormArrayGroup<T, R>> {
  updateValueAndValidity: (groups?: boolean) => void;
}
