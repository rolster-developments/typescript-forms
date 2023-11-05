import { BehaviorSubject, Subscription } from 'rxjs';
import { evalFormStateValid } from './helpers';
import {
  AbstractControl,
  AbstractGroup,
  FormState,
  SubscriberControl,
  ValidatorError,
  ValidatorFn
} from './types';

export interface FormControlProps<T> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export class FormControl<T = any> implements AbstractControl<T> {
  private activeValue = false;

  private dirtyValue = false;

  private disabledValue = false;

  private validValue = true;

  private initialState: FormState<T>;

  private stateValue?: FormState<T>;

  private errorValue?: ValidatorError;

  private errorsValue: ValidatorError[] = [];

  private validators?: ValidatorFn<T>[];

  private subscribers: BehaviorSubject<FormState<T>>;

  private formGroup?: AbstractGroup<any>;

  constructor({ state, validators }: FormControlProps<T>) {
    this.subscribers = new BehaviorSubject(state);

    this.initialState = state;
    this.validators = validators;

    this.stateValue = state;
    this.updateValueAndValidity();
  }

  public get active(): boolean {
    return this.activeValue;
  }

  public get dirty(): boolean {
    return this.dirtyValue;
  }

  public get disabled(): boolean {
    return this.disabledValue;
  }

  public get invalid(): boolean {
    return !this.validValue;
  }

  public get valid(): boolean {
    return this.validValue;
  }

  public get state(): FormState<T> {
    return this.stateValue;
  }

  public get value(): T {
    return this.stateValue as T;
  }

  public get error(): ValidatorError | undefined {
    return this.errorValue;
  }

  public get errors(): ValidatorError[] {
    return this.errorsValue;
  }

  public reset(): void {
    this.setState(this.initialState);
    this.setDirty(false);
  }

  public setActive(active: boolean): void {
    this.activeValue = active;
  }

  public setDirty(dirty: boolean): void {
    this.dirtyValue = dirty;
  }

  public setDisabled(disabled: boolean): void {
    this.disabledValue = disabled;
  }

  public setFormGroup(formGroup: AbstractGroup<any>): void {
    this.formGroup = formGroup;
  }

  public setState(state?: FormState<T>): void {
    this.subscribers.next(state);

    this.stateValue = state;

    this.updateValueAndValidity();

    this.formGroup?.updateValueAndValidity(false);
  }

  public setValidators(validators: ValidatorFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public subscribe(subscriber: SubscriberControl<T>): Subscription {
    return this.subscribers.subscribe(subscriber);
  }

  public updateValueAndValidity(): void {
    if (!this.validators) {
      this.validValue = true;
    } else {
      const { stateValue: state, validators } = this;

      const errors = evalFormStateValid({ state, validators });

      this.errorValue = errors[0];
      this.errorsValue = errors;

      this.validValue = errors.length === 0;
    }
  }
}
