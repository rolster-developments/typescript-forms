import { AbstractControl } from './form-control';
import { FormState } from './types';

export type FormControls = Record<string, AbstractControl>;

type Subscriber = (group?: AbstractGroup) => void;
type JsonResult = Record<string, any>;

export interface AbstractGroup {
  invalid: boolean;
  valid: boolean;
  json: () => JsonResult;
  reset: () => void;
  subscribe: (subscriber: Subscriber) => void;
  updateValueAndValidity: () => void;
}

export class FormGroup<T extends FormControls> implements AbstractGroup {
  private abstracts: AbstractControl[];

  private validValue = true;

  private subscribers: Set<Subscriber>;

  constructor(public readonly controls: T) {
    this.abstracts = Object.values(controls);
    this.subscribers = new Set();

    const subscribe = (_state: FormState) => {
      this.validValue = this.abstracts.reduce(
        (validState, { valid }) => validState && valid,
        true
      );
    };

    this.abstracts.forEach((control) => control.subscribe(subscribe));
  }

  public get invalid(): boolean {
    return !this.validValue;
  }

  public get valid(): boolean {
    return this.validValue;
  }

  public reset(): void {
    this.abstracts.forEach((control) => control.reset());
  }

  public subscribe(subscriber: Subscriber): void {
    this.subscribers.add(subscriber);
  }

  public json(): JsonResult {
    return Object.entries(this.controls).reduce((json, [key, { value }]) => {
      json[key] = value;
      return json;
    }, {} as JsonResult);
  }

  public updateValueAndValidity(): void {
    this.abstracts.forEach((control) => control.updateValueAndValidity());
  }
}
