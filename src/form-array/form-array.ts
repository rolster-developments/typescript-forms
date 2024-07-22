import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { createFormArrayOptions } from '../arguments';
import { arrayIsValid, groupAllChecked, groupPartialChecked } from '../helpers';
import {
  AbstractArray,
  AbstractArrayGroup,
  ArrayFormControls,
  ArrayStateGroup,
  FormArrayOptions,
  SubscriberArray,
  ValidatorArrayFn
} from '../types';

type ArrayOptions<C extends ArrayFormControls, R> = FormArrayOptions<
  C,
  R,
  AbstractArrayGroup<C, R>
>;

export class FormArray<C extends ArrayFormControls = ArrayFormControls, R = any>
  implements AbstractArray<C, R>
{
  private currentGroups: AbstractArrayGroup<C, R>[] = [];

  private initialState?: AbstractArrayGroup<C, R>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<C, R>[];

  private observable: Observable<ArrayStateGroup<C>[]>;

  private unsusbcriptions: Map<string, Unsubscription>;

  constructor();
  constructor(options: ArrayOptions<C, R>);
  constructor(
    groups: AbstractArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  );
  constructor(
    arrayOptions?: ArrayOptions<C, R> | AbstractArrayGroup<C, R>[],
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

    this.observable = observable(this.state);

    groups?.forEach((group) => {
      this.subscription(group);
    });
  }

  public get groups(): AbstractArrayGroup<C, R>[] {
    return this.currentGroups;
  }

  public get controls(): C[] {
    return this.groups.map(({ controls }) => controls);
  }

  public get touched(): boolean {
    return groupPartialChecked(this.groups, 'touched');
  }

  public get toucheds(): boolean {
    return groupAllChecked(this.groups, 'toucheds');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untoucheds(): boolean {
    return !this.toucheds;
  }

  public get dirty(): boolean {
    return groupPartialChecked(this.groups, 'dirty');
  }

  public get dirties(): boolean {
    return groupAllChecked(this.groups, 'dirties');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristines(): boolean {
    return !this.dirties;
  }

  public get valid(): boolean {
    return this.currentValid && groupAllChecked(this.groups, 'valid');
  }

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get state(): ArrayStateGroup<C>[] {
    return this.groups.map(({ state }) => state);
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

  public reset(): void {
    this.refresh(this.initialState);
  }

  public push(group: AbstractArrayGroup<C, R>): void {
    this.subscription(group);

    this.refresh([...this.groups, group]);
  }

  public merge(groups: AbstractArrayGroup<C, R>[]): void {
    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh([...this.groups, ...groups]);
  }

  public set(groups: AbstractArrayGroup<C, R>[]): void {
    this.currentGroups.forEach(({ uuid }) => {
      this.unsusbcriptions.delete(uuid);
    });

    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh(groups); // Update groups
  }

  public remove({ uuid }: AbstractArrayGroup<C, R>): void {
    this.refresh(this.groups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<C, R>[]): void {
    this.validators = validators;

    this.updateValidityStatus(this.groups, validators);
  }

  public subscribe(subscriber: SubscriberArray<C>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private subscription(group: AbstractArrayGroup<C, R>): void {
    const unsusbcription = group.subscribe(() => {
      this.updateValidityStatus(this.groups, this.validators);
    });

    this.unsusbcriptions.set(group.uuid, unsusbcription);
  }

  private updateValidityStatus(
    groups: AbstractArrayGroup<C, R>[],
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

  private refresh(newGroups?: AbstractArrayGroup<C, R>[]): void {
    const groups = newGroups || [];

    this.currentGroups = groups;

    this.updateValidityStatus(groups, this.validators);
  }
}

export function formArray<
  G extends ArrayFormControls = ArrayFormControls,
  R = any
>(): FormArray<G, R>;
export function formArray<
  G extends ArrayFormControls = ArrayFormControls,
  R = any
>(options: ArrayOptions<G, R>): FormArray<G, R>;
export function formArray<
  G extends ArrayFormControls = ArrayFormControls,
  R = any
>(
  groups: AbstractArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R>;
export function formArray<
  G extends ArrayFormControls = ArrayFormControls,
  R = any
>(
  options?: ArrayOptions<G, R> | AbstractArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R> {
  return new FormArray(createFormArrayOptions(options, validators));
}
