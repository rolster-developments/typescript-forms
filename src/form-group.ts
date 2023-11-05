import { evalFormControlsValid } from './helpers';
import {
  AbstractGroup,
  FormControls,
  JsonControl,
  ValidatorError,
  ValidatorGroupFn
} from './types';

export class FormGroup<T extends FormControls> implements AbstractGroup<T> {
  private errorValue?: ValidatorError;

  private errorsValue: ValidatorError[] = [];

  private validValue = true;

  private validators?: ValidatorGroupFn<T>[];

  constructor(
    public readonly controls: T,
    validators?: ValidatorGroupFn<T>[]
  ) {
    Object.values(this.controls).forEach((control) => {
      control.setFormGroup(this);
    });

    this.validators = validators;
  }

  public get valid(): boolean {
    return (
      this.validValue &&
      Object.values(this.controls).reduce(
        (validState, { valid }) => validState && valid,
        true
      )
    );
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

  public json(): JsonControl<T> {
    return Object.entries(this.controls).reduce<any>(
      (json, [key, { state }]) => {
        json[key] = state;
        return json;
      },
      {}
    );
  }

  public reset(): void {
    Object.values(this.controls).forEach((control) => control.reset());
  }

  public setValidators(validators: ValidatorGroupFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public updateValueAndValidity(controls = true): void {
    if (controls) {
      Object.values(this.controls).forEach((control) =>
        control.updateValueAndValidity()
      );
    }

    if (!this.validators) {
      this.validValue = true;
    } else {
      const { controls, validators } = this;

      const errors = evalFormControlsValid({ controls, validators });

      this.errorsValue = errors;
      this.errorValue = errors[0];

      this.validValue = errors.length === 0;
    }
  }
}
