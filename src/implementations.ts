import { BehaviorSubject, Subscription } from 'rxjs';
import {
  controlsAllChecked,
  controlsSomeChecked,
  controlsToState,
  controlsToValue,
  controlIsValid,
  groupIsValid
} from './helpers';
import {
  FormControlProps,
  FormGroupProps,
  FormState,
  StateControls,
  SubscriberControl,
  ValidatorError,
  ValidatorFn,
  ValidatorGroupFn,
  ValueControls
} from './types';
import { RolsterControl, RolsterControls, RolsterGroup } from './types.rolster';

export class BaseFormControl<
  T = any,
  C extends RolsterControls = RolsterControls
> implements RolsterControl<T, C>
{
  private currentActive = false;

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

  public get active(): boolean {
    return this.currentActive;
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

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get valid(): boolean {
    return this.currentValid;
  }

  public get state(): FormState<T> {
    return this.currentState;
  }

  public get value(): T {
    return this.currentState as T;
  }

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
  }

  public reset(): void {
    this.setState(this.initialState);
    this.setTouched(false);
    this.currentDirty = false;
  }

  public setActive(active: boolean): void {
    this.currentActive = active;
  }

  public setTouched(touched: boolean): void {
    this.currentTouched = touched;
  }

  public setDisabled(disabled: boolean): void {
    this.currentDisabled = disabled;
  }

  public setState(state?: FormState<T>): void {
    this.subscribers.next(state);

    this.currentState = state;
    this.currentDirty = true;

    this.updateValueAndValidity();
    this.currentParent?.updateValueAndValidity(false);
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
  private currentControls: T;

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
    return controlsSomeChecked(this.currentControls, 'touched');
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
    return controlsSomeChecked(this.currentControls, 'dirty');
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

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
  }

  public states(): StateControls<T> {
    return controlsToState(this.currentControls);
  }

  public values(): ValueControls<T> {
    return controlsToValue(this.currentControls);
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
