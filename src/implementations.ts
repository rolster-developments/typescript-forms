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

  private groupValue?: RolsterGroup<C>;

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

  public setState(state?: FormState<T>): void {
    this.subscribers.next(state);

    this.stateValue = state;

    this.updateValueAndValidity();
    this.groupValue?.updateValueAndValidity(false);
  }

  public setValidators(validators: ValidatorFn<T>[] = []): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public setFormGroup(formGroup: RolsterGroup<C>): void {
    this.groupValue = formGroup;
  }

  public subscribe(subscriber: SubscriberControl<T>): Subscription {
    return this.subscribers.subscribe(subscriber);
  }

  public updateValueAndValidity(): void {
    if (!this.validators) {
      this.validValue = true;
    } else {
      const { stateValue: state, validators } = this;

      const errors = evalFormControlValid({ state, validators });

      this.errorValue = errors[0];
      this.errorsValue = errors;

      this.validValue = errors.length === 0;
    }
  }
}

export class BaseFormGroup<T extends RolsterControls>
  implements RolsterGroup<T>
{
  private controlsValue: T;

  private errorValue?: ValidatorError;

  private errorsValue: ValidatorError[] = [];

  private validValue = true;

  private validators?: ValidatorGroupFn<T>[];

  constructor({ controls, validators }: FormGroupProps<T>) {
    this.controlsValue = controls;

    Object.values(this.controlsValue).forEach((control) => {
      control.setFormGroup(this);
    });

    this.validators = validators;
  }

  public get controls(): T {
    return this.controlsValue;
  }

  public get dirty(): boolean {
    return controlsToDirty(this.controlsValue);
  }

  public get valid(): boolean {
    return this.validValue && controlsToValid(this.controlsValue);
  }

  public get invalid(): boolean {
    return !this.valid;
  }

  public get error(): ValidatorError | undefined {
    return this.errorValue;
  }

  public get errors(): ValidatorError[] {
    return this.errorsValue;
  }

  public json(): JsonControls<T> {
    return controlsToJson(this.controlsValue);
  }

  public reset(): void {
    Object.values(this.controlsValue).forEach((control) => control.reset());
  }

  public setValidators(validators: ValidatorGroupFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public updateValueAndValidity(controls = true): void {
    if (controls) {
      Object.values(this.controlsValue).forEach((control) => {
        control.updateValueAndValidity();
      });
    }

    if (!this.validators) {
      this.validValue = true;
    } else {
      const { controls, validators } = this;

      const errors = evalFormGroupValid({ controls, validators });

      this.errorsValue = errors;
      this.errorValue = errors[0];

      this.validValue = errors.length === 0;
    }
  }
}
