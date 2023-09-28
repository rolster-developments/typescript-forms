import { AbstractControl } from './form-control';

export type FormControls = Record<string, AbstractControl>;

type JsonControl<T extends FormControls> = Record<keyof T, any>;

export interface AbstractGroup<T extends FormControls> {
  controls: T;
  invalid: () => boolean;
  json: () => JsonControl<T>;
  reset: () => void;
  updateValueAndValidity: () => void;
  valid: () => boolean;
}

export class FormGroup<T extends FormControls> implements AbstractGroup<T> {
  constructor(public readonly controls: T) {}

  public valid(): boolean {
    return Object.values(this.controls).reduce(
      (validState, { valid }) => validState && valid,
      true
    );
  }

  public invalid(): boolean {
    return !this.valid();
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

  public updateValueAndValidity(): void {
    Object.values(this.controls).forEach((control) =>
      control.updateValueAndValidity()
    );
  }
}
