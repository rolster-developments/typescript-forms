import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { FormControl } from '../form-control';
import {
  AbstractArrayList,
  ArrayControlsValue,
  ArrayListValueToControls
} from '../types';
import { FormArrayControls } from './types';

export class FormArrayList<C extends FormArrayControls = FormArrayControls>
  extends FormControl<ArrayControlsValue<C>[]>
  implements AbstractArrayList<C>
{
  public readonly uuid: string;

  private currentControls: C[];

  constructor(
    private valueToControls: ArrayListValueToControls<C>,
    value?: ArrayControlsValue<C>[],
    validators?: ValidatorFn<ArrayControlsValue<C>[]>[]
  ) {
    super(value || [], validators);

    this.currentControls = (value || []).map((value) =>
      this.createControls(value)
    );

    this.uuid = uuid();
  }

  public get controls(): C[] {
    return this.currentControls;
  }

  public setValue(values: ArrayControlsValue<C>[]): void {
    this.currentControls = values.map((value) => this.createControls(value));
    super.setValue(values);
  }

  private createControls(value: ArrayControlsValue<C>): C {
    const controls = this.valueToControls(value);

    Object.values(controls).forEach((control) => {
      control.subscribe(() => {
        const { value, validators } = this;

        this.updateValueAndValidity(value, validators);
        this.observable.next(value);
      });
    });

    return controls;
  }
}

export function formArrayList<C extends FormArrayControls = FormArrayControls>(
  valueToControl: ArrayListValueToControls<C>,
  value?: ArrayControlsValue<C>[],
  validators?: ValidatorFn<ArrayControlsValue<C>[]>[]
): FormArrayList<C> {
  return new FormArrayList(valueToControl, value, validators);
}
