import { v4 as uuid } from 'uuid';
import { createFormGroupOptions } from '../arguments';
import { FormGroup } from '../form-group';
import {
  AbstractReactiveArrayGroup,
  FormArrayGroupOptions,
  ValidatorGroupFn
} from '../types';
import { FormArrayControls } from './types';

type ArrayGroupOptions<T extends FormArrayControls> = Omit<
  FormArrayGroupOptions<T>,
  'uuid'
>;

export class FormArrayGroup<
    C extends FormArrayControls = FormArrayControls,
    R = any
  >
  extends FormGroup<C>
  implements AbstractReactiveArrayGroup<C>
{
  public readonly uuid: string;

  public readonly resource?: R;

  constructor(options: ArrayGroupOptions<C>);
  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(
    options: ArrayGroupOptions<C> | C,
    validators?: ValidatorGroupFn<C>[]
  ) {
    const _options = createFormGroupOptions<C, ArrayGroupOptions<C>>(
      options,
      validators
    );

    super(_options.controls, _options.validators);

    this.uuid = uuid();
    this.resource = _options.resource;
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
