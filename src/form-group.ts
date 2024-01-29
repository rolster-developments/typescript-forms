import { controlsToState, controlsToValue } from './helpers';
import { BaseFormGroup } from './implementations';
import { AbstractFormGroup, StateGroup, ValueGroup } from './types';
import { RolsterFormControls } from './types-rolster';

export type FormControls = RolsterFormControls;

export class FormGroup<T extends FormControls = FormControls>
  extends BaseFormGroup<T>
  implements AbstractFormGroup<T>
{
  public get state(): StateGroup<T> {
    return controlsToState(this.currentControls);
  }

  public get value(): ValueGroup<T> {
    return controlsToValue(this.currentControls);
  }
}
