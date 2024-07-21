import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { createFormControlProps } from '../arguments';
import { FormControl } from '../form-control';
import {
  AbstractArrayControl,
  FormArrayControlProps,
  FormState
} from '../types';

type ArrayControlProps<T> = Omit<FormArrayControlProps<T>, 'uuid'>;

export class FormArrayControl<T = any>
  extends FormControl<T>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor();
  constructor(props: ArrayControlProps<T>);
  constructor(state: FormState<T>, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: ArrayControlProps<T> | FormState<T>,
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
