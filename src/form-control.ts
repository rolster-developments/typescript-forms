import { Observable, observable } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { createFormControlOptions } from './arguments';
import { controlIsValid } from './helpers';
import {
  AbstractReactiveControl,
  FormControlOptions,
  FormStateOptions,
  FormValidatorsOptions,
  SubscriberControl
} from './types';

export class FormControl<T = any> implements AbstractReactiveControl<T> {
  private currentFocused = false;

  private currentTouched = false;

  private currentDirty = false;

  private currentDisabled = false;

  private currentValid = true;

  private initialState: T;

  private currentState: T;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorFn<T>[];

  private observable: Observable<T>;

  constructor();
  constructor(props: FormControlOptions<T>);
  constructor(state: T, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: FormControlOptions<T> | T,
    controlValidators?: ValidatorFn<T>[]
  ) {
    const { state, validators } = createFormControlOptions(
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

  public get state(): T {
    return this.currentState;
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
    this.currentDirty = false;
    this.currentTouched = false;
  }

  public focus(): void {
    this.currentFocused = true;
  }

  public blur(): void {
    this.currentFocused = false;
    this.currentTouched = true;
  }

  public disable(): void {
    this.currentDisabled = true;
  }

  public enable(): void {
    this.currentDisabled = false;
  }

  public touch(): void {
    this.currentTouched = true;
  }

  public setState(state: T): void {
    if (this.enabled) {
      this.currentState = state;
      this.currentDirty = true;

      this.updateValueAndValidity(state, this.validators);

      this.observable.next(state);
    }
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity(this.state, validators);
  }

  public subscribe(subscriber: SubscriberControl<T>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private updateValueAndValidity(
    state: T,
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

export function formControl<T>(): FormControl<T | undefined>;
export function formControl<T>(options: FormStateOptions<T>): FormControl<T>;
export function formControl<T>(
  options: FormValidatorsOptions<T>
): FormControl<T | undefined>;
export function formControl<T>(
  state: T,
  validators?: ValidatorFn<T>[]
): FormControl<T>;
export function formControl<T>(
  options?: FormControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): FormControl<T> {
  return new FormControl(createFormControlOptions(options, validators));
}
