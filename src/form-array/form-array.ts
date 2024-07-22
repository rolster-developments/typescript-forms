import { Observable, observable } from '@rolster/commons';
import { ValidatorError } from '@rolster/validators';
import { createFormArrayOptions } from '../arguments';
import { arrayIsValid, groupAllChecked, groupPartialChecked } from '../helpers';
import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayGroup,
  AbstractArrayControls,
  ArrayStateGroup,
  FormArrayOptions,
  SubscriberControl,
  ValidatorArrayFn
} from '../types';

type FormControls<T extends AbstractArrayControl = AbstractArrayControl> =
  AbstractArrayControls<T>;

type ArrayOptions<G extends FormControls, R> = FormArrayOptions<
  G,
  R,
  AbstractArrayGroup<G, R>
>;

type SubscriberArray<G extends FormControls> = SubscriberControl<
  ArrayStateGroup<G>[]
>;

export class FormArray<G extends FormControls = FormControls, R = any>
  implements AbstractArray<G, R>
{
  private currentGroups: AbstractArrayGroup<G, R>[] = [];

  private initialState?: AbstractArrayGroup<G, R>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<G, R>[];

  private observable: Observable<ArrayStateGroup<G>[]>;

  private unsusbcriptions: Map<string, Unsubscription>;

  constructor();
  constructor(options: ArrayOptions<G, R>);
  constructor(
    groups: AbstractArrayGroup<G, R>[],
    validators?: ValidatorArrayFn<G, R>[]
  );
  constructor(
    arrayOptions?: ArrayOptions<G, R> | AbstractArrayGroup<G, R>[],
    arrayValidators?: ValidatorArrayFn<G, R>[]
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

  public get groups(): AbstractArrayGroup<G, R>[] {
    return this.currentGroups;
  }

  public get controls(): G[] {
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

  public get state(): ArrayStateGroup<G>[] {
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

  public push(group: AbstractArrayGroup<G, R>): void {
    this.subscription(group);

    this.refresh([...this.groups, group]);
  }

  public merge(groups: AbstractArrayGroup<G, R>[]): void {
    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh([...this.groups, ...groups]);
  }

  public set(groups: AbstractArrayGroup<G, R>[]): void {
    this.currentGroups.forEach(({ uuid }) => {
      this.unsusbcriptions.delete(uuid);
    });

    groups.forEach((group) => {
      this.subscription(group);
    });

    this.refresh(groups); // Update groups
  }

  public remove({ uuid }: AbstractArrayGroup<G, R>): void {
    this.refresh(this.groups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<G, R>[]): void {
    this.validators = validators;

    this.updateValidityStatus(this.groups, validators);
  }

  public subscribe(subscriber: SubscriberArray<G>): Unsubscription {
    return this.observable.subscribe(subscriber);
  }

  private subscription(group: AbstractArrayGroup<G, R>): void {
    const unsusbcription = group.subscribe(() => {
      this.updateValidityStatus(this.groups, this.validators);
    });

    this.unsusbcriptions.set(group.uuid, unsusbcription);
  }

  private updateValidityStatus(
    groups: AbstractArrayGroup<G, R>[],
    validators?: ValidatorArrayFn<G, R>[]
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

  private refresh(newGroups?: AbstractArrayGroup<G, R>[]): void {
    const groups = newGroups || [];

    this.currentGroups = groups;

    this.updateValidityStatus(groups, this.validators);
  }
}

export function formArray<
  G extends FormControls = FormControls,
  R = any
>(): FormArray<G, R>;
export function formArray<G extends FormControls = FormControls, R = any>(
  options: ArrayOptions<G, R>
): FormArray<G, R>;
export function formArray<G extends FormControls = FormControls, R = any>(
  groups: AbstractArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R>;
export function formArray<G extends FormControls = FormControls, R = any>(
  options?: ArrayOptions<G, R> | AbstractArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): FormArray<G, R> {
  return new FormArray(createFormArrayOptions(options, validators));
}
