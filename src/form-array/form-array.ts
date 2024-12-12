import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { createFormArrayOptions } from '../arguments';
import {
  arrayIsValid,
  groupAllChecked,
  groupPartialChecked,
  hasError,
  someErrors
} from '../helpers';
import {
  AbstractReactiveArray,
  AbstractReactiveArrayGroup,
  ArrayStateGroup,
  FormArrayOptions,
  SubscriberArray,
  ValidatorArrayFn
} from '../types';
import { FormArrayControls } from './types';

type ArrayOptions<C extends FormArrayControls, R> = FormArrayOptions<
  C,
  R,
  AbstractReactiveArrayGroup<C, R>
>;

export class FormArray<C extends FormArrayControls = FormArrayControls, R = any>
  implements AbstractReactiveArray<C, R, AbstractReactiveArrayGroup<C, R>>
{
  private currentGroups: AbstractReactiveArrayGroup<C, R>[] = [];

  private initialState?: AbstractReactiveArrayGroup<C, R>[];

  private currentValid = true;

  private currentDisabled = false;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<C, R>[];

  private observable: Observable<ArrayStateGroup<C>[]>;

  private unsusbcriptions: Map<string, Unsubscription>;

  constructor();
  constructor(options: ArrayOptions<C, R>);
  constructor(
    groups: AbstractReactiveArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  );
  constructor(
    arrayOptions?: ArrayOptions<C, R> | AbstractReactiveArrayGroup<C, R>[],
    arrayValidators?: ValidatorArrayFn<C, R>[]
  ) {
    const { groups, validators } = createFormArrayOptions(
      arrayOptions,
      arrayValidators
    );

    this.unsusbcriptions = new Map();

    this.initialState = groups;

    this.validators = validators;

    this.refresh(this.initialState);

    this.observable = observable(this.value);

    groups?.forEach((group) => {
      this.subscription(group);
    });
  }

  public get groups(): AbstractReactiveArrayGroup<C, R>[] {
    return this.currentGroups;
  }

  public get controls(): C[] {
    return this.groups.map(({ controls }) => controls);
  }

  public get touched(): boolean {
    return groupPartialChecked(this.groups, 'touched');
  }

  public get touchedAll(): boolean {
    return groupAllChecked(this.groups, 'touchedAll');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untouchedAll(): boolean {
    return !this.touchedAll;
  }

  public get dirty(): boolean {
    return groupPartialChecked(this.groups, 'dirty');
  }

  public get dirtyAll(): boolean {
    return groupAllChecked(this.groups, 'dirtyAll');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristineAll(): boolean {
    return !this.dirtyAll;
  }

  public get disabled(): boolean {
    return this.currentDisabled;
  }

  public get enabled(): boolean {
    return !this.currentDisabled;
  }

  public get valid(): boolean {
    return this.currentValid && groupAllChecked(this.groups, 'valid');
  }

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get value(): ArrayStateGroup<C>[] {
    return this.groups.map(({ value: state }) => state);
  }

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
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
    this.refresh(this.initialState);
  }

  public disable(): void {
    this.currentDisabled = true;
  }

  public enable(): void {
    this.currentDisabled = false;
  }

  public push(group: AbstractReactiveArrayGroup<C, R>): void {
    this.subscription(group);

    this.refresh([...this.groups, group]);
  }

  public merge(groups: AbstractReactiveArrayGroup<C, R>[]): void {
    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh([...this.groups, ...groups]);
  }

  public set(groups: AbstractReactiveArrayGroup<C, R>[]): void {
    this.currentGroups.forEach(({ uuid }) => {
      this.unsusbcriptions.delete(uuid);
    });

    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh(groups); // Update groups
  }

  public remove({ uuid }: AbstractReactiveArrayGroup<C, R>): void {
    this.refresh(this.groups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<C, R>[]): void {
    this.validators = validators;

    this.updateValidityStatus(this.groups, validators);
  }

  public subscribe(subscriber: SubscriberArray<C>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private subscription(group: AbstractReactiveArrayGroup<C, R>): void {
    const unsusbcription = group.subscribe(() => {
      this.updateValidityStatus(this.groups, this.validators);
    });

    this.unsusbcriptions.set(group.uuid, unsusbcription);
  }

  private updateValidityStatus(
    groups: AbstractReactiveArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  ): void {
    if (validators) {
      const errors = arrayIsValid({ groups, validators });

      this.currentErrors = errors;
      this.currentError = errors[0];
      this.currentValid = errors.length === 0;
    } else {
      this.currentValid = true;
      this.currentErrors = [];
      this.currentError = undefined;
    }
  }

  private refresh(newGroups?: AbstractReactiveArrayGroup<C, R>[]): void {
    const groups = newGroups || [];

    this.currentGroups = groups;

    this.updateValidityStatus(groups, this.validators);
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
  groups: AbstractReactiveArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R>;
export function formArray<
  G extends FormArrayControls = FormArrayControls,
  R = any
>(
  options?: ArrayOptions<G, R> | AbstractReactiveArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R> {
  return new FormArray(createFormArrayOptions(options, validators));
}
