import { BaseFormGroup } from './implementations';
import { RolsterFormControls as Controls } from './types.rolster';

export class FormGroup<T extends Controls> extends BaseFormGroup<T> {}
