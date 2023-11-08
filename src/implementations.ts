import { BehaviorSubject, Subscription } from 'rxjs';
import {
  controlsToDirty,
  controlsToJson,
  controlsToValid,
  evalFormControlValid,
  evalFormGroupValid
} from './helpers';
import {
  FormControlProps,
  FormGroupProps,
  FormState,
  JsonControls,
  SubscriberControl,
  ValidatorError,
  ValidatorFn,
  ValidatorGroupFn
} from './types';
import { RolsterControl, RolsterControls, RolsterGroup } from './types.rolster';

export class BaseFormControl<T = any, C extends RolsterControls = any>
  implements RolsterControl<T, C>
{
  private currentActive = false;

  private currentDirty = false;

  private currentDisabled = false;

  private currentValid = true;

  private initialState: FormState<T>;

  private currentState?: FormState<T>;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorFn<T>[];

  private subscribers: BehaviorSubject<FormState<T>>;

  private currentGroup?: RolsterGroup<C>;

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

  public get dirty(): boolean {
    return this.currentDirty;
  }

  public get disabled(): boolean {
    return this.currentDisabled;
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
    this.setDirty(false);
  }

  public setActive(active: boolean): void {
    this.currentActive = active;
  }

  public setDirty(dirty: boolean): void {
    this.currentDirty = dirty;
  }

  public setDisabled(disabled: boolean): void {
    this.currentDisabled = disabled;
  }

  public setState(state?: FormState<T>): void {
    this.subscribers.next(state);

    this.currentState = state;

    this.updateValueAndValidity();
    this.currentGroup?.updateValueAndValidity(false);
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public setFormGroup(formGroup: RolsterGroup<C>): void {
    this.currentGroup = formGroup;
  }

  public subscribe(subscriber: SubscriberControl<T>): Subscription {
    return this.subscribers.subscribe(subscriber);
  }

  public updateValueAndValidity(): void {
    if (!this.validators) {
      this.currentValid = true;
    } else {
      const { currentState: state, validators } = this;

      const errors = evalFormControlValid({ state, validators });

      this.currentError = errors[0];
      this.currentErrors = errors;

      this.currentValid = errors.length === 0;
    }
  }
}

export class BaseFormGroup<T extends RolsterControls>
  implements RolsterGroup<T>
{
  private currentControls: T;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private currentValid = true;

  private validators?: ValidatorGroupFn<T>[];

  constructor({ controls, validators }: FormGroupProps<T>) {
    this.currentControls = controls;

    Object.values(this.currentControls).forEach((control) => {
      control.setFormGroup(this);
    });

    this.validators = validators;
  }

  public get controls(): T {
    return this.currentControls;
  }

  public get dirty(): boolean {
    return controlsToDirty(this.currentControls);
  }

  public get valid(): boolean {
    return this.currentValid && controlsToValid(this.currentControls);
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

  public json(): JsonControls<T> {
    return controlsToJson(this.currentControls);
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

    if (!this.validators) {
      this.currentValid = true;
    } else {
      const { controls, validators } = this;

      const errors = evalFormGroupValid({ controls, validators });

      this.currentErrors = errors;
      this.currentError = errors[0];

      this.currentValid = errors.length === 0;
    }
  }
}
