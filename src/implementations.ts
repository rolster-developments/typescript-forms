import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlIsValid,
  groupIsValid
} from './helpers';
import {
  FormControlProps,
  FormGroupProps,
  FormState,
  SubscriberControl,
  ValidatorGroupFn
} from './types';
import { RolsterControl, RolsterControls, RolsterGroup } from './types.rolster';

export class BaseFormControl<
  T = any,
  C extends RolsterControls = RolsterControls
> implements RolsterControl<T, C>
{
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

  private subscribers: BehaviorSubject<FormState<T>>;

  private currentParent?: RolsterGroup<C>;

  constructor({ state, validators }: FormControlProps<T>) {
    this.subscribers = new BehaviorSubject(state);

    this.initialState = state;
    this.validators = validators;

    this.currentState = state;
    this.updateValueAndValidity();
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

    this.updateValueAndValidity();
    this.currentParent?.updateValueAndValidity(false);

    this.subscribers.next(state);
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public setParent(parent: RolsterGroup<C>): void {
    this.currentParent = parent;
  }

  public subscribe(subscriber: SubscriberControl<T>): Subscription {
    return this.subscribers.subscribe(subscriber);
  }

  public updateValueAndValidity(): void {
    if (this.validators) {
      const { currentState: state, validators } = this;

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

export class BaseFormGroup<
  T extends RolsterControls<RolsterControl> = RolsterControls<RolsterControl>
> implements RolsterGroup<T>
{
  protected currentControls: T;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private currentValid = true;

  private validators?: ValidatorGroupFn<T>[];

  constructor({ controls, validators }: FormGroupProps<T>) {
    this.currentControls = controls;

    Object.values(this.currentControls).forEach((control) => {
      control.setParent(this);
    });

    this.validators = validators;

    this.updateValueAndValidity(false);
  }

  public get controls(): T {
    return this.currentControls;
  }

  public get touched(): boolean {
    return controlsPartialChecked(this.currentControls, 'touched');
  }

  public get toucheds(): boolean {
    return controlsAllChecked(this.currentControls, 'touched');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untoucheds(): boolean {
    return !this.toucheds;
  }

  public get dirty(): boolean {
    return controlsPartialChecked(this.currentControls, 'dirty');
  }

  public get dirties(): boolean {
    return controlsAllChecked(this.currentControls, 'dirty');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristines(): boolean {
    return this.dirties;
  }

  public get valid(): boolean {
    return (
      this.currentValid && controlsAllChecked(this.currentControls, 'valid')
    );
  }

  public get invalid(): boolean {
    return !this.valid;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
  }

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public reset(): void {
    Object.values(this.currentControls).forEach((control) => control.reset());
  }

  public setValidators(validators: ValidatorGroupFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public updateValueAndValidity(controls = true): void {
    if (controls) {
      Object.values(this.currentControls).forEach((control) => {
        control.updateValueAndValidity();
      });
    }

    if (this.validators) {
      const { controls, validators } = this;

      const errors = groupIsValid({ controls, validators });

      this.currentErrors = errors;
      this.currentError = errors[0];

      this.currentValid = errors.length === 0;
    } else {
      this.currentErrors = [];
      this.currentError = undefined;
      this.currentValid = true;
    }
  }
}
