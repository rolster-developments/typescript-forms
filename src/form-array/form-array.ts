import { ValidatorError } from '@rolster/validators';
import { createFormArrayProps } from '../arguments';
import { arrayIsValid, groupAllChecked, groupPartialChecked } from '../helpers';
import {
  RolsterFormArray,
  RolsterFormArrayControls,
  RolsterFormArrayGroup
} from '../types-rolster';
import {
  AbstractArrayGroup,
  ArrayStateGroup,
  ArrayValueGroup,
  FormArrayProps,
  ValidatorArrayFn
} from '../types';

type RolsterArrayProps<G extends RolsterFormArrayControls, R> = FormArrayProps<
  G,
  R,
  RolsterFormArrayGroup<G, R>
>;

export class FormArray<
  G extends RolsterFormArrayControls = RolsterFormArrayControls,
  R = any
> implements RolsterFormArray<G>
{
  private currentGroups: RolsterFormArrayGroup<G, R>[] = [];

  private initialState?: RolsterFormArrayGroup<G, R>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<G, R>[];

  constructor();
  constructor(props: RolsterArrayProps<G, R>);
  constructor(
    groups: RolsterFormArrayGroup<G, R>[],
    validators?: ValidatorArrayFn<G, R>[]
  );
  constructor(
    arrayProps?: RolsterArrayProps<G, R> | RolsterFormArrayGroup<G, R>[],
    arrayValidators?: ValidatorArrayFn<G, R>[]
  ) {
    const { groups, validators } = createFormArrayProps(
      arrayProps,
      arrayValidators
    );

    this.initialState = groups;

    this.initialState?.forEach((group) => group.setParent(this));

    this.validators = validators;

    this.refresh(this.initialState);
  }

  public get groups(): RolsterFormArrayGroup<G, R>[] {
    return this.currentGroups;
  }

  public get controls(): G[] {
    return this.groups.map(({ controls }) => controls);
  }

  public get touched(): boolean {
    return groupPartialChecked(this.currentGroups, 'touched');
  }

  public get toucheds(): boolean {
    return groupAllChecked(this.currentGroups, 'toucheds');
  }

  public get untouched(): boolean {
    return !this.touched;
  }

  public get untoucheds(): boolean {
    return !this.toucheds;
  }

  public get dirty(): boolean {
    return groupPartialChecked(this.currentGroups, 'dirty');
  }

  public get dirties(): boolean {
    return groupAllChecked(this.currentGroups, 'dirties');
  }

  public get pristine(): boolean {
    return !this.dirty;
  }

  public get pristines(): boolean {
    return !this.dirties;
  }

  public get valid(): boolean {
    return this.currentValid && groupAllChecked(this.currentGroups, 'valid');
  }

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get state(): ArrayStateGroup<G>[] {
    return this.currentGroups.map((group) => group.state);
  }

  public get value(): ArrayValueGroup<G>[] {
    return this.currentGroups.map((group) => group.value);
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

  public push(group: RolsterFormArrayGroup<G, R>): void {
    group.setParent(this);

    this.refresh([...this.currentGroups, group]);
  }

  public merge(groups: RolsterFormArrayGroup<G, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh([...this.currentGroups, ...groups]);
  }

  public set(groups: RolsterFormArrayGroup<G, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh(groups);
  }

  public remove({ uuid }: AbstractArrayGroup<G, R>): void {
    this.refresh(this.currentGroups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<G, R>[]): void {
    this.validators = validators;
  }

  public updateValueAndValidity(groups = true): void {
    if (groups) {
      this.currentGroups.forEach((group) => group.updateValueAndValidity(true));
    }

    if (this.validators) {
      const { groups, validators } = this;

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

  private refresh(groups?: RolsterFormArrayGroup<G, R>[]): void {
    this.currentGroups = groups || [];

    this.updateValueAndValidity();
  }
}
