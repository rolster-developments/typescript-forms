import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { createFormGroupOptions } from './arguments';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToState,
  groupIsValid
} from './helpers';
import {
  AbstractFormGroup,
  AbstractControls,
  FormGroupOptions,
  StateGroup,
  SubscriberGroup,
  ValidatorGroupFn,
  AbstractReactiveControl
} from './types';

export type FormControls<T extends AbstractReactiveControl = AbstractReactiveControl> =
  AbstractControls<T>;

export class FormGroup<C extends FormControls = FormControls>
  implements AbstractFormGroup<C>
{
  protected currentControls: C;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private currentValid = true;

  private validators?: ValidatorGroupFn<C>[];

  private observable: Observable<StateGroup<C>>;

  constructor(options: FormGroupOptions<C>);
  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(
    groupOptions: FormGroupOptions<C> | C,
    groupValidators?: ValidatorGroupFn<C>[]
  ) {
    const { controls, validators } = createFormGroupOptions(
      groupOptions,
      groupValidators
    );

    this.currentControls = controls;
    this.validators = validators;

    this.updateValueAndValidity(controls, validators);

    this.observable = observable(this.state);

    Object.values(controls).forEach((control) => {
      control.subscribe(() => {
        this.updateValueAndValidity(this.controls, this.validators);
        this.observable.next(this.state);
      });
    });
  }

  public get controls(): C {
    return this.currentControls;
  }

  public get touched(): boolean {
    return controlsPartialChecked(this.controls, 'touched');
  }

  public get toucheds(): boolean {
    return controlsAllChecked(this.controls, 'touched');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untoucheds(): boolean {
    return !this.toucheds;
  }

  public get dirty(): boolean {
    return controlsPartialChecked(this.controls, 'dirty');
  }

  public get dirties(): boolean {
    return controlsAllChecked(this.controls, 'dirty');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristines(): boolean {
    return this.dirties;
  }

  public get valid(): boolean {
    return this.currentValid && controlsAllChecked(this.controls, 'valid');
  }

  public get invalid(): boolean {
    return !this.valid;
  }

  public get state(): StateGroup<C> {
    return controlsToState(this.controls);
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
    Object.values(this.controls).forEach((control) => {
      control.reset();
    });
  }

  public setValidators(validators: ValidatorGroupFn<C>[]): void {
    this.validators = validators;
    this.updateValueAndValidity(this.controls, validators);
  }

  public subscribe(subscriber: SubscriberGroup<C>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private updateValueAndValidity(
    controls: C,
    validators?: ValidatorGroupFn<C>[]
  ): void {
    if (validators) {
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

export function formGroup<C extends FormControls = FormControls>(
  options: FormGroupOptions<C>
): FormGroup<C>;
export function formGroup<C extends FormControls = FormControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): FormGroup<C>;
export function formGroup<C extends FormControls = FormControls>(
  options: FormGroupOptions<C> | C,
  validators?: ValidatorGroupFn<C>[]
): FormGroup<C> {
  return new FormGroup(createFormGroupOptions(options, validators));
}
