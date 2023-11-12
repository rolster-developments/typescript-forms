import { controlsToState, controlsToValue } from './helpers';
import { BaseFormGroup } from './implementations';
import { AbstractFormGroup, StateGroup, ValueGroup } from './types';
import { RolsterFormControls } from './types.rolster';

export class FormGroup<T extends RolsterFormControls = RolsterFormControls>
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
