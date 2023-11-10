import { BaseFormGroup } from './implementations';
import { RolsterFormControls } from './types.rolster';

export class FormGroup<
  T extends RolsterFormControls = RolsterFormControls
> extends BaseFormGroup<T> {}
