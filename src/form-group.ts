import { controlsToState, controlsToValue } from './helpers';
import { BaseFormGroup } from './implementations';
import { AbstractFormGroup, StateGroup, ValueGroup } from './types';
import { RolsterFormControls } from './types-rolster';

export type FormControls = RolsterFormControls;

export class FormGroup<C extends FormControls = FormControls>
  extends BaseFormGroup<C>
  implements AbstractFormGroup<C>
{
  public get state(): StateGroup<C> {
    return controlsToState(this.currentControls);
  }

  public get value(): ValueGroup<C> {
    return controlsToValue(this.currentControls);
  }
}
