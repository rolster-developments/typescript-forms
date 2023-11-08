import { BaseFormControl } from './implementations';
import { RolsterFormControls as Controls } from './types.rolster';

export class FormControl<T = any> extends BaseFormControl<T, Controls> {}
