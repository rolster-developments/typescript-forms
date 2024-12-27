import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { FormControl } from '../form-control';
import {
  AbstractArrayList,
  ArrayControlsValue,
  ArrayListValueToControls
} from '../types';
import { FormArrayControls } from './types';
import { controlsAllChecked, controlsPartialChecked } from '../helpers';

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

  public get touched(): boolean {
    return this.controls.reduce(
      (valid, controls) => valid && controlsPartialChecked(controls, 'touched'),
      true
    );
  }

  public get dirty(): boolean {
    return this.controls.reduce(
      (valid, controls) => valid && controlsPartialChecked(controls, 'dirty'),
      true
    );
  }

  public get valid(): boolean {
    return (
      this.currentValid &&
      this.controls.reduce(
        (valid, controls) => valid && controlsAllChecked(controls, 'valid'),
        true
      )
    );
  }

  public setValue(values: ArrayControlsValue<C>[]): void {
    this.currentControls = values.map((value) => this.createControls(value));
    super.setValue(values);
  }

  public push(value: ArrayControlsValue<C>): void {
    this.currentControls = this.currentControls.concat([
      this.createControls(value)
    ]);
  }

  public remove(controls: C): void {
    this.currentControls = this.currentControls.filter(
      (currentControls) => currentControls !== controls
    );
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
