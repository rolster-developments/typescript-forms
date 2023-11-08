import { AbstractBaseControl, AbstractGroup } from './types';

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
  extends AbstractGroup<T> {
  updateValueAndValidity: (controls?: boolean) => void;
}
