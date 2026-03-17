import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { createFormControlOptions } from '../form-control/form-control.helper';
import { FormControl } from '../form-control/form-control';
import {
  FormArrayControlOptions,
  ReactiveArrayControl
} from './form-array-control.type';

type ArrayControlOptions<T> = Omit<FormArrayControlOptions<T>, 'uuid'>;

export class FormArrayControl<T = any>
  extends FormControl<T>
  implements ReactiveArrayControl<T>
{
  public readonly uuid: string;

  constructor();
  constructor(options: ArrayControlOptions<T>);
  constructor(value: T, validators?: ValidatorFn<T>[]);
  constructor(
    options?: ArrayControlOptions<T> | T,
    validators?: ValidatorFn<T>[]
  ) {
    const formControl = createFormControlOptions(options, validators);

    super(formControl.value, formControl.validators);

    this.uuid = uuid();
  }
}

export type FormArrayVoid<T = any> = FormArrayControl<T | undefined>;

type ArrayValueOptions<T> = Omit<ArrayControlOptions<T>, 'validators'>;
type ArrayValidatorsOptions<T> = Omit<ArrayControlOptions<T>, 'value'>;

export function formArrayControl<T>(): FormArrayControl<T | undefined>;
export function formArrayControl<T>(
  options: ArrayValueOptions<T>
): FormArrayControl<T>;
export function formArrayControl<T>(
  options: ArrayValidatorsOptions<T>
): FormArrayControl<T | undefined>;
export function formArrayControl<T>(
  options: FormArrayControlOptions<T>
): FormArrayControl<T>;
export function formArrayControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
): FormArrayControl<T | undefined>;
export function formArrayControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): FormArrayControl<T>;
export function formArrayControl<T>(
  options?: ArrayControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): FormArrayControl<T> {
  return new FormArrayControl(createFormControlOptions(options, validators));
}
