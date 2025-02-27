import { Observable, observable } from '@rolster/commons';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { createFormControlOptions } from './arguments';
import { controlIsValid, hasError, someErrors } from './helpers';
import {
  AbstractReactiveControl,
  FormControlOptions,
  FormValidatorsOptions,
  FormValueOptions,
  SubscriberControl
} from './types';

export class FormControl<T = any> implements AbstractReactiveControl<T> {
  protected _focused = false;

  protected _touched = false;

  protected _dirty = false;

  protected _disabled = false;

  protected _valid = true;

  protected _value: T;

  protected _errors: ValidatorError[] = [];

  protected _error?: ValidatorError;

  protected currentValue: T;

  protected validators?: ValidatorFn<T>[];

  protected observable: Observable<T>;

  constructor();
  constructor(options: FormControlOptions<T>);
  constructor(value: T, validators?: ValidatorFn<T>[]);
  constructor(
    options?: FormControlOptions<T> | T,
    validators?: ValidatorFn<T>[]
  ) {
    const _options = createFormControlOptions(options, validators);

    this.observable = observable(_options.value);

    this.currentValue = _options.value;
    this.validators = _options.validators;

    this._value = _options.value;
    this.updateValueAndValidity(_options.value, _options.validators);
  }

  public get focused(): boolean {
    return this._focused;
  }

  public get unfocused(): boolean {
    return !this._focused;
  }

  public get touched(): boolean {
    return this._touched;
  }

  public get untouched(): boolean {
    return !this._touched;
  }

  public get dirty(): boolean {
    return this._dirty;
  }

  public get pristine(): boolean {
    return !this._dirty;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get enabled(): boolean {
    return !this._disabled;
  }

  public get valid(): boolean {
    return this._valid;
  }

  public get invalid(): boolean {
    return !this._valid;
  }

  public get value(): T {
    return this._value;
  }

  public get errors(): ValidatorError[] {
    return this._errors;
  }

  public get error(): ValidatorError | undefined {
    return this._error;
  }

  public get wrong(): boolean {
    return this.touched && this.invalid;
  }

  public hasError(key: string): boolean {
    return hasError(this.errors, key);
  }

  public someErrors(keys: string[]): boolean {
    return someErrors(this.errors, keys);
  }

  public reset(): void {
    this.setValue(this.currentValue);
    this._dirty = false;
    this._touched = false;
  }

  public focus(): void {
    this._focused = true;
  }

  public blur(): void {
    this._focused = false;
    this._touched = true;
  }

  public disable(): void {
    this._disabled = true;
  }

  public enable(): void {
    this._disabled = false;
  }

  public touch(): void {
    this._touched = true;
  }

  public setInitialValue(value: T): void {
    this.currentValue = value;
    this.setValue(value);
  }

  public setValue(value: T): void {
    if (this.enabled) {
      this._value = value;
      this._dirty = true;

      this.updateValueAndValidity(value, this.validators);
      this.observable.next(value);
    }
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity(this.value, validators);
  }

  public subscribe(subscriber: SubscriberControl<T>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  protected updateValueAndValidity(
    value: T,
    validators?: ValidatorFn<T>[]
  ): void {
    if (validators) {
      const errors = controlIsValid({ value, validators });

      this._error = errors[0];
      this._errors = errors;
      this._valid = errors.length === 0;
    } else {
      this._valid = true;
      this._error = undefined;
      this._errors = [];
    }
  }
}

export type FormVoid<T = any> = FormControl<T | undefined>;

export function formControl<T>(): FormControl<T | undefined>;
export function formControl<T>(options: FormValueOptions<T>): FormControl<T>;
export function formControl<T>(
  options: FormValidatorsOptions<T>
): FormControl<T | undefined>;
export function formControl<T>(options: FormControlOptions<T>): FormControl<T>;
export function formControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
): FormControl<T | undefined>;
export function formControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): FormControl<T>;
export function formControl<T>(
  options?: FormControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): FormControl<T> {
  return new FormControl(createFormControlOptions(options, validators));
}
