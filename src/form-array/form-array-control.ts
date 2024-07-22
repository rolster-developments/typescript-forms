import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { createFormControlProps } from '../arguments';
import { FormControl } from '../form-control';
import { AbstractArrayControl, FormArrayControlProps } from '../types';

type ArrayControlProps<T> = Omit<FormArrayControlProps<T>, 'uuid'>;

export class FormArrayControl<T = any>
  extends FormControl<T>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor();
  constructor(props: ArrayControlProps<T>);
  constructor(state: T, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: ArrayControlProps<T> | T,
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

type ArrayStateProps<T> = Omit<ArrayControlProps<T>, 'validators'>;
type ArrayValidatorsProps<T> = Omit<ArrayControlProps<T>, 'state'>;

export function formArrayControl<T>(): FormArrayControl<T | undefined>;
export function formArrayControl<T>(
  props: ArrayStateProps<T>
): FormArrayControl<T>;
export function formArrayControl<T>(
  props: ArrayValidatorsProps<T>
): FormArrayControl<T | undefined>;
export function formArrayControl<T>(
  state: T,
  validators?: ValidatorFn<T>[]
): FormArrayControl<T>;
export function formArrayControl<T>(
  props?: ArrayControlProps<T> | T,
  validators?: ValidatorFn<T>[]
): FormArrayControl<T> {
  return new FormArrayControl(createFormControlProps(props, validators));
}
