import { AbstractControl, FormState } from './form-control';

export type FormControls = Record<string, AbstractControl>;

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
  private abstractControls: AbstractControl[];

  private validValue = true;

  private subscribers: Set<Subscriber>;

  constructor(public readonly controls: T) {
    this.abstractControls = Object.values(controls);
    this.subscribers = new Set();

    const subscribe = (_: FormState) => {
      this.validValue = this.abstractControls.reduce(
        (validState, { valid }) => validState && valid,
        true
      );
    };

    this.abstractControls.forEach((control) => {
      control.subscribe(subscribe);
    });
  }

  public get invalid(): boolean {
    return !this.validValue;
  }

  public get valid(): boolean {
    return this.validValue;
  }

  public reset(): void {
    this.abstractControls.forEach((control) => control.reset());
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
    this.abstractControls.forEach((control) => {
      control.updateValueAndValidity();
    });
  }
}
