import { Observable, observable } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { createFormControlProps } from './arguments';
import { controlIsValid } from './helpers';
import {
  AbstractControl,
  FormControlProps,
  FormState,
  SubscriberControl
} from './types';

export class FormControl<T = any> implements AbstractControl<T> {
  private currentFocused = false;

  private currentTouched = false;

  private currentDirty = false;

  private currentDisabled = false;

  private currentValid = true;

  private initialState: FormState<T>;

  private currentState?: FormState<T>;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorFn<T>[];

  private observable: Observable<FormState<T>>;

  constructor();
  constructor(props: FormControlProps<T>);
  constructor(state: FormState<T>, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: FormControlProps<T> | FormState<T>,
    controlValidators?: ValidatorFn<T>[]
  ) {
    const { state, validators } = createFormControlProps(
      controlProps,
      controlValidators
    );

    this.observable = observable(state);

    this.initialState = state;
    this.validators = validators;

    this.currentState = state;
    this.updateValueAndValidity(state, validators);
  }

  public get focused(): boolean {
    return this.currentFocused;
  }

  public get unfocused(): boolean {
    return !this.currentFocused;
  }

  public get touched(): boolean {
    return this.currentTouched;
  }

  public get untouched(): boolean {
    return !this.currentTouched;
  }

  public get dirty(): boolean {
    return this.currentDirty;
  }

  public get pristine(): boolean {
    return !this.currentDirty;
  }

  public get disabled(): boolean {
    return this.currentDisabled;
  }

  public get enabled(): boolean {
    return !this.currentDisabled;
  }

  public get valid(): boolean {
    return this.currentValid;
  }

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get state(): FormState<T> {
    return this.currentState;
  }

  public get value(): T {
    return this.currentState as T;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
  }

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public get wrong(): boolean {
    return this.touched && this.invalid;
  }

  public reset(): void {
    this.setState(this.initialState);
    this.untouch();
    this.currentDirty = false;
  }

  public focus(): void {
    this.currentFocused = true;
  }

  public blur(): void {
    this.currentFocused = false;
  }

  public touch(): void {
    this.currentTouched = true;
  }

  public untouch(): void {
    this.currentTouched = false;
  }

  public disable(): void {
    this.currentDisabled = true;
  }

  public enable(): void {
    this.currentDisabled = false;
  }

  public setState(state?: FormState<T>): void {
    this.currentState = state;
    this.currentDirty = true;

    this.updateValueAndValidity(state, this.validators);

    this.observable.next(state);
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity(this.state, validators);
  }

  public subscribe(subscriber: SubscriberControl<T>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private updateValueAndValidity(
    state: FormState<T>,
    validators?: ValidatorFn<T>[]
  ): void {
    if (validators) {
      const errors = controlIsValid({ state, validators });

      this.currentError = errors[0];
      this.currentErrors = errors;

      this.currentValid = errors.length === 0;
    } else {
      this.currentValid = true;
      this.currentError = undefined;
      this.currentErrors = [];
    }
  }
}
