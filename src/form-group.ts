import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { createFormGroupOptions } from './arguments';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToValue,
  groupIsValid
} from './helpers';
import {
  AbstractControls,
  AbstractReactiveControl,
  AbstractReactiveGroup,
  ControlsValue,
  FormGroupOptions,
  SubscriberGroup,
  ValidatorGroupFn
} from './types';

export type FormControls<
  T extends AbstractReactiveControl = AbstractReactiveControl
> = AbstractControls<T>;

export class FormGroup<C extends FormControls = FormControls>
  implements AbstractReactiveGroup<C>
{
  protected _controls: C;

  private _errors: ValidatorError[] = [];

  private _error?: ValidatorError;

  private _valid = true;

  private validators?: ValidatorGroupFn<C>[];

  private observable: Observable<ControlsValue<C>>;

  constructor(options: FormGroupOptions<C>);
  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(
    options: FormGroupOptions<C> | C,
    validators?: ValidatorGroupFn<C>[]
  ) {
    const _options = createFormGroupOptions(options, validators);

    this._controls = _options.controls;
    this.validators = _options.validators;

    this.updateValueAndValidity(_options.controls, _options.validators);

    this.observable = observable(this.value);

    Object.values(_options.controls).forEach((control) => {
      control.subscribe(() => {
        this.updateValueAndValidity(this.controls, this.validators);
        this.observable.next(this.value);
      });
    });
  }

  public get controls(): C {
    return this._controls;
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
    return this._valid && controlsAllChecked(this.controls, 'valid');
  }

  public get invalid(): boolean {
    return !this.valid;
  }

  public get value(): ControlsValue<C> {
    return controlsToValue(this.controls);
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

      this._errors = errors;
      this._error = errors[0];
      this._valid = errors.length === 0;
    } else {
      this._errors = [];
      this._error = undefined;
      this._valid = true;
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
