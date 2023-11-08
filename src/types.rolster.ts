import {
  AbstractControls,
  AbstractFormControl,
  AbstractFormGroup
} from './types';

export interface RolsterFormControl<T = any, C extends AbstractControls = any>
  extends AbstractFormControl<T> {
  setFormGroup: (formGroup: RolsterFormGroup<C>) => void;
  updateValueAndValidity: () => void;
}

export type RolsterControls = AbstractControls<RolsterFormControl>;

export interface RolsterFormGroup<T extends RolsterControls>
  extends AbstractFormGroup<T> {
  updateValueAndValidity: (controls?: boolean) => void;
}
