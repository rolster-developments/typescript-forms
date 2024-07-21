import { v4 as uuid } from 'uuid';
import { createFormGroupProps } from '../arguments';
import { FormGroup } from '../form-group';
import {
  AbstractArrayControl,
  AbstractArrayGroup,
  AbstractControls,
  FormArrayGroupProps,
  ValidatorGroupFn
} from '../types';

export type FormArrayControls<
  T extends AbstractArrayControl = AbstractArrayControl
> = AbstractControls<T>;

type ArrayGroupProps<T extends FormArrayControls> = Omit<
  FormArrayGroupProps<T>,
  'uuid'
>;

export class FormArrayGroup<
    C extends FormArrayControls = FormArrayControls,
    R = any
  >
  extends FormGroup<C>
  implements AbstractArrayGroup<C>
{
  public readonly uuid: string;

  public readonly resource?: R;

  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(props: ArrayGroupProps<C>);
  constructor(
    groupProps: ArrayGroupProps<C> | C,
    groupValidators?: ValidatorGroupFn<C>[]
  ) {
    const { controls, resource, validators } = createFormGroupProps<
      C,
      ArrayGroupProps<C>
    >(groupProps, groupValidators);

    super(controls, validators);

    this.uuid = uuid();
    this.resource = resource;
  }
}
