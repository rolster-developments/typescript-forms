import { controlsToJson, controlsToValid, evalFormGroupValid } from './helpers';
import {
  AbstractFormGroup,
  AbstractGroupControls,
  JsonControls,
  ValidatorError,
  ValidatorGroupFn,
  FormGroupProps
} from './types';

export class FormGroup<T extends AbstractGroupControls>
  implements AbstractFormGroup<T>
{
  private controlsValue: T;

  private errorValue?: ValidatorError;

  private errorsValue: ValidatorError[] = [];

  private validValue = true;

  private validators?: ValidatorGroupFn<T>[];

  constructor({ controls, validators }: FormGroupProps<T>) {
    this.controlsValue = controls;

    Object.values(this.controlsValue).forEach((control) => {
      control.group = this;
    });

    this.validators = validators;
  }

  public get controls(): T {
    return this.controlsValue;
  }

  public get valid(): boolean {
    return this.validValue && controlsToValid(this.controlsValue);
  }

  public get invalid(): boolean {
    return !this.valid;
  }

  public get error(): ValidatorError | undefined {
    return this.errorValue;
  }

  public get errors(): ValidatorError[] {
    return this.errorsValue;
  }

  public json(): JsonControls<T> {
    return controlsToJson(this.controlsValue);
  }

  public reset(): void {
    Object.values(this.controlsValue).forEach((control) => control.reset());
  }

  public setValidators(validators: ValidatorGroupFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public updateValueAndValidity(controls = true): void {
    if (controls) {
      Object.values(this.controlsValue).forEach((control) =>
        control.updateValueAndValidity()
      );
    }

    if (!this.validators) {
      this.validValue = true;
    } else {
      const { controls, validators } = this;

      const errors = evalFormGroupValid({ controls, validators });

      this.errorsValue = errors;
      this.errorValue = errors[0];

      this.validValue = errors.length === 0;
    }
  }
}
