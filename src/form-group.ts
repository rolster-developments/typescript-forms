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

  constructor(
    public readonly controls: T,
    private readonly validators?: ValidatorGroupFn[]
  ) {
    Object.values(this.controls).forEach((control) => {
      control.setGroup(this);
    });
  }

  public get valid(): boolean {
    return this.validControls && this.validValue;
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

  public reset(): void {
    Object.values(this.controls).forEach((control) => control.reset());
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

  public updateValidity(): void {
    if (!this.validators) {
      this.validValue = true;
    } else {
      const { controls, validators } = this;

      const errors = evalFormControlsValid({ controls, validators });

      this.errorValue = errors[0];
      this.errorsValue = errors;

      this.validValue = errors.length === 0;
    }
  }

  public updateValueAndValidity(): void {
    Object.values(this.controls).forEach((control) =>
      control.updateValueAndValidity()
    );
  }

  private get validControls(): boolean {
    return Object.values(this.controls).reduce(
      (validState, { valid }) => validState && valid,
      true
    );
  }
}
