import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { createFormControlProps } from '../arguments';
import { BaseFormControl } from '../implementations';
import { RolsterFormArrayControls } from '../types-rolster';
import {
  AbstractArrayControl,
  FormArrayControlProps,
  FormState
} from '../types';

type RolsterArrayControlProps<T> = Omit<FormArrayControlProps<T>, 'uuid'>;

export class FormArrayControl<T = any>
  extends BaseFormControl<T, RolsterFormArrayControls>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor();
  constructor(props: RolsterArrayControlProps<T>);
  constructor(state: FormState<T>, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: RolsterArrayControlProps<T> | FormState<T>,
    controlValidators?: ValidatorFn<T>[]
  ) {
    const { state, validators } = createFormControlProps(
      controlProps,
      controlValidators
    );

    super(state, validators);

    this.uuid = uuid();
  }
}
