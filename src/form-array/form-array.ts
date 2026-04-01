import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { hasError, someErrors } from '../helpers';
import {
  ArrayControlsValue,
  FormArrayControls,
  ReactiveArrayGroup
} from './form-array-group.type';
import {
  createFormArrayOptions,
  formArrayIsValid,
  verifyAllTrueInGroups,
  verifyAnyTrueInGroups
} from './form-array.helper';
import {
  FormArrayOptions,
  ReactiveArray,
  SubscriberArray,
  ValidatorArrayFn
} from './form-array.type';

type ArrayOptions<C extends FormArrayControls, R> = FormArrayOptions<
  C,
  R,
  ReactiveArrayGroup<C, R>
>;

export class FormArray<
  C extends FormArrayControls = FormArrayControls,
  R = any
> implements ReactiveArray<C, R, ReactiveArrayGroup<C, R>> {
  private _groups: ReactiveArrayGroup<C, R>[] = [];

  private _valid = true;

  private _disabled = false;

  private _errors: ValidatorError[] = [];

  private _error?: ValidatorError;

  private map: Map<string, ReactiveArrayGroup<C, R>>;

  private defaultValue?: ReactiveArrayGroup<C, R>[];

  private validators?: ValidatorArrayFn<C, R>[];

  private observable: Observable<ArrayControlsValue<C>[]>;

  private unsusbcriptions: Map<string, Unsubscription>;

  constructor();
  constructor(options: ArrayOptions<C, R>);
  constructor(
    groups: ReactiveArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  );
  constructor(
    options?: ArrayOptions<C, R> | ReactiveArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  ) {
    const formArray = createFormArrayOptions(options, validators);

    this.unsusbcriptions = new Map();
    this.map = new Map();

    this.defaultValue = formArray.groups;
    this.validators = formArray.validators;

    this.refresh(this.defaultValue);

    this.observable = observable(this.value);

    formArray.groups?.forEach((group) => {
      this.subscription(group);
    });
  }

  public get groups(): ReactiveArrayGroup<C, R>[] {
    return this._groups;
  }

  public get controls(): C[] {
    return this.groups.map(({ controls }) => controls);
  }

  public get touched(): boolean {
    return verifyAnyTrueInGroups(this.groups, 'touched');
  }

  public get toucheds(): boolean {
    return verifyAllTrueInGroups(this.groups, 'toucheds');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untoucheds(): boolean {
    return !this.toucheds;
  }

  public get dirty(): boolean {
    return verifyAnyTrueInGroups(this.groups, 'dirty');
  }

  public get dirties(): boolean {
    return verifyAllTrueInGroups(this.groups, 'dirties');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristines(): boolean {
    return !this.dirties;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get enabled(): boolean {
    return !this._disabled;
  }

  public get valid(): boolean {
    return this._valid && verifyAllTrueInGroups(this.groups, 'valid');
  }

  public get invalid(): boolean {
    return !this._valid;
  }

  public get value(): ArrayControlsValue<C>[] {
    return this.groups.map(({ value: state }) => state);
  }

  public get error(): ValidatorError | undefined {
    return this._error;
  }

  public get errors(): ValidatorError[] {
    return this._errors;
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
    this.refresh(this.defaultValue);
  }

  public disable(): void {
    this._disabled = true;
  }

  public enable(): void {
    this._disabled = false;
  }

  public findByUuid(uuid: string): Undefined<ReactiveArrayGroup<C, R>> {
    return this.map.get(uuid);
  }

  public push(group: ReactiveArrayGroup<C, R>): void {
    this.subscription(group);

    this.refresh([...this.groups, group]);
  }

  public merge(groups: ReactiveArrayGroup<C, R>[]): void {
    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh([...this.groups, ...groups]);
  }

  public setDefaultValue(groups: ReactiveArrayGroup<C, R>[]): void {
    this.defaultValue = groups;
    this.setValue(groups);
  }

  public setStartValue(groups: ReactiveArrayGroup<C, R>[]): void {
    this.setValue(groups);
  }

  public setValue(groups: ReactiveArrayGroup<C, R>[]): void {
    this._groups.forEach(({ uuid }) => {
      this.unsusbcriptions.delete(uuid);
    });

    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh(groups); // Update groups
  }

  public remove(group: ReactiveArrayGroup<C, R>): void {
    this.refresh(this.groups.filter((_group) => _group.uuid !== group.uuid));
  }

  public setValidators(validators: ValidatorArrayFn<C, R>[]): void {
    this.validators = validators;

    this.updateValidityStatus(this.groups, validators);
  }

  public subscribe(subscriber: SubscriberArray<C>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private subscription(group: ReactiveArrayGroup<C, R>): void {
    const unsusbcription = group.subscribe(() => {
      this.updateValidityStatus(this.groups, this.validators);
    });

    this.unsusbcriptions.set(group.uuid, unsusbcription);
  }

  private updateValidityStatus(
    groups: ReactiveArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  ): void {
    if (validators) {
      const errors = formArrayIsValid({ groups, validators });

      this._errors = errors;
      this._error = errors[0];
      this._valid = errors.length === 0;
    } else {
      this._valid = true;
      this._errors = [];
      this._error = undefined;
    }
  }

  private refresh(groups?: ReactiveArrayGroup<C, R>[]): void {
    this._groups = groups || [];

    this.map.clear();

    this._groups.forEach((group) => {
      this.map.set(group.uuid, group);
    });

    this.updateValidityStatus(this._groups, this.validators);
  }
}

export function formArray<
  G extends FormArrayControls = FormArrayControls,
  R = any
>(): FormArray<G, R>;
export function formArray<
  G extends FormArrayControls = FormArrayControls,
  R = any
>(options: ArrayOptions<G, R>): FormArray<G, R>;
export function formArray<
  G extends FormArrayControls = FormArrayControls,
  R = any
>(
  groups: ReactiveArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R>;
export function formArray<
  G extends FormArrayControls = FormArrayControls,
  R = any
>(
  options?: ArrayOptions<G, R> | ReactiveArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R> {
  return new FormArray(createFormArrayOptions(options, validators));
}
