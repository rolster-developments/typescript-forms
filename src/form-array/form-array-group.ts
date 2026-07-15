import { v4 as uuid } from 'uuid';
import { FormGroup } from '../form-group/form-group';
import { createFormGroupOptions } from '../form-group/form-group.helper';
import { ValidatorGroupFn } from '../form-group/form-group.type';
import {
  FormArrayControls,
  FormArrayGroupOptions,
  ReactiveArrayGroup
} from './form-array-group.type';

type ArrayGroupOptions<T extends FormArrayControls> = Omit<
  FormArrayGroupOptions<T>,
  'uuid'
>;

export class FormArrayGroup<
  C extends FormArrayControls = FormArrayControls,
  R = any
>
  extends FormGroup<C>
  implements ReactiveArrayGroup<C>
{
  public readonly uuid: string;

  public readonly resource?: R;

  constructor(options: ArrayGroupOptions<C>);
  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(
    options: ArrayGroupOptions<C> | C,
    validators?: ValidatorGroupFn<C>[]
  ) {
    const formGroup = createFormGroupOptions<C, ArrayGroupOptions<C>>(
      options,
      validators
    );

    super(formGroup.controls, formGroup.validators);

    this.uuid = uuid();
    this.resource = formGroup.resource;
  }
}

export function formArrayGroup<C extends FormArrayControls = FormArrayControls>(
  options: ArrayGroupOptions<C>
): FormArrayGroup<C>;
export function formArrayGroup<C extends FormArrayControls = FormArrayControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): FormArrayGroup<C>;
export function formArrayGroup<C extends FormArrayControls = FormArrayControls>(
  options: ArrayGroupOptions<C> | C,
  validators?: ValidatorGroupFn<C>[]
): FormArrayGroup<C> {
  return new FormArrayGroup(createFormGroupOptions(options, validators));
}
