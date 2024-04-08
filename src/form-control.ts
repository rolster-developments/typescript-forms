import { BaseFormControl } from './implementations';
import { RolsterFormControls } from './types-rolster';

export class FormControl<T = any> extends BaseFormControl<
  T,
  RolsterFormControls
> {}
