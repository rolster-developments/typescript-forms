import { FormControl, FormState } from './form-control';

export type FormControls = Record<string, FormControl>;

type Subscriber = (abstractGroup?: AbstractGroup) => void;
type JsonResult = Record<string, any>;

export interface AbstractGroup {
  invalid: boolean;
  valid: boolean;
  reset: () => void;
  subscribe: (subscriber: Subscriber) => void;
  toJson: () => JsonResult;
  updateValueAndValidity: () => void;
}

export class FormGroup<T extends FormControls> implements AbstractGroup {
  private formControls: FormControl[];

  private validValue = true;

  private subscribers: Set<Subscriber>;

  constructor(public readonly controls: T) {
    this.formControls = Object.values(controls);
    this.subscribers = new Set();

    const subscribeControl = (_state: FormState) => {
      this.validValue = this.formControls.reduce(
        (valid, control) => valid && control.valid,
        true
      );
    };

    this.formControls.forEach((control) => {
      control.subscribe(subscribeControl);
    });
  }

  public get invalid(): boolean {
    return !this.validValue;
  }

  public get valid(): boolean {
    return this.validValue;
  }

  public reset(): void {
    this.formControls.forEach((control) => {
      control.reset();
    });
  }

  public subscribe(subscriber: Subscriber): void {
    this.subscribers.add(subscriber);
  }

  public toJson(): JsonResult {
    return Object.entries(this.controls).reduce(
      (json: JsonResult, [key, { value }]) => {
        json[key] = value;
        return json;
      },
      {}
    );
  }

  public updateValueAndValidity(): void {
    this.formControls.forEach((control) => {
      control.updateValueAndValidity();
    });
  }
}
