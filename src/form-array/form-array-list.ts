import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import { FormControl } from '../form-control';
import {
  AbstractArrayList,
  ArrayControlsValue,
  ArrayListValueToControls
} from '../types';
import { FormArrayControls } from './types';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToValue
} from '../helpers';

export class FormArrayList<C extends FormArrayControls = FormArrayControls>
  extends FormControl<ArrayControlsValue<C>[]>
  implements AbstractArrayList<C>
{
  public readonly uuid: string;

  private _controls: C[];

  constructor(
    private valueToControls: ArrayListValueToControls<C>,
    value?: ArrayControlsValue<C>[],
    validators?: ValidatorFn<ArrayControlsValue<C>[]>[]
  ) {
    const _value = value || [];

    super(_value, validators);

    this._controls = _value.map((value) => this.createControls(value));

    this.uuid = uuid();
  }

  public get controls(): C[] {
    return this._controls;
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
      this._valid &&
      this.controls.reduce(
        (valid, controls) => valid && controlsAllChecked(controls, 'valid'),
        true
      )
    );
  }

  public get value(): ArrayControlsValue<C>[] {
    return this.controls.map((controls) => controlsToValue(controls));
  }

  public setValue(values: ArrayControlsValue<C>[]): void {
    this._controls = values.map((value) => this.createControls(value));
  }

  public push(controls: C): void {
    this._controls = this._controls.concat([controls]);
  }

  public remove(controls: C): void {
    this._controls = this._controls.filter(
      (_controls) => _controls !== controls
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
