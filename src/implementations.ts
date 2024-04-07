import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { BehaviorSubject } from 'rxjs';
import {
  controlIsValid,
  controlsAllChecked,
  controlsPartialChecked,
  groupIsValid,
  instanceOfFormControlProps,
  instanceOfFormGroupProps
} from './helpers';
import { RolsterControl, RolsterControls, RolsterGroup } from './types-rolster';
import {
  FormControlProps,
  FormGroupProps,
  FormState,
  SubscriberControl,
  ValidatorGroupFn
} from './types';

type Controls = RolsterControls<RolsterControl>;

type ArgsControlProps<T = any> = [
  FormControlProps<T> | FormState<T>,
  Undefined<ValidatorFn<T>[]>
];

type ArgsGroupProps<C extends Controls> = [
  FormGroupProps<C> | C,
  Undefined<ValidatorGroupFn<C>[]>
];

function createFormControlProps<T>(
  ...argsProps: ArgsControlProps<T>
): FormControlProps<T> {
  const [props, validators] = argsProps;

  if (!props) {
    return { state: undefined, validators: undefined };
  }

  if (
    !validators &&
    instanceOfFormControlProps<T, FormControlProps<T>>(props)
  ) {
    return props;
  }

  return { state: props as FormState<T>, validators };
}

function createFormGroupProps<C extends Controls>(
  ...argsProps: ArgsGroupProps<C>
): FormGroupProps<C> {
  const [props, validators] = argsProps;

  if (!validators && instanceOfFormGroupProps<C, FormGroupProps<C>>(props)) {
    return props;
  }

  return { controls: props as C, validators };
}

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

  public subscribe(subscriber: SubscriberControl<T>): Unsubscription {
    const subscription = this.subscribers.subscribe(subscriber);

    return () => subscription.unsubscribe();
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

export class BaseFormGroup<C extends Controls = Controls>
  implements RolsterGroup<C>
{
  protected currentControls: C;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private currentValid = true;

  private validators?: ValidatorGroupFn<C>[];

  constructor(props: FormGroupProps<C>);
  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(
    groupProps: FormGroupProps<C> | C,
    groupValidators?: ValidatorGroupFn<C>[]
  ) {
    const { controls, validators } = createFormGroupProps(
      groupProps,
      groupValidators
    );

    this.currentControls = controls;

    Object.values(this.currentControls).forEach((control) => {
      control.setParent(this);
    });

    this.validators = validators;

    this.updateValueAndValidity(false);
  }

  public get controls(): C {
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

  public get wrong(): boolean {
    return this.touched && this.invalid;
  }

  public reset(): void {
    Object.values(this.currentControls).forEach((control) => control.reset());
  }

  public setValidators(validators: ValidatorGroupFn<C>[]): void {
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
