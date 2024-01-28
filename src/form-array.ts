import { ValidatorError } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  arrayIsValid,
  controlsToState,
  controlsToValue,
  groupAllChecked,
  groupPartialChecked
} from './helpers';
import { BaseFormControl, BaseFormGroup } from './implementations';
import {
  AbstractArrayGroup,
  ArrayStateGroup,
  AbstractArrayControl,
  ArrayValueGroup,
  FormArrayProps,
  FormArrayControlProps,
  FormArrayGroupProps,
  ValidatorArrayFn
} from './types';
import {
  RolsterFormArray,
  RolsterFormArrayControls as Controls,
  RolsterFormArrayGroup
} from './types.rolster';

type RolsterArrayControlProps<T = any> = Omit<FormArrayControlProps<T>, 'uuid'>;
type RolsterArrayGroupProps<T extends Controls = Controls> = Omit<
  FormArrayGroupProps<T>,
  'uuid'
>;
type RolsterArrayProps<T extends Controls = Controls, R = any> = FormArrayProps<
  T,
  R,
  RolsterFormArrayGroup<T, R>
>;

export class FormArrayControl<T = any>
  extends BaseFormControl<T, Controls>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor({ state, validators }: RolsterArrayControlProps<T>) {
    super({ state, validators });

    this.uuid = uuid();
  }
}

export class FormArrayGroup<T extends Controls = Controls, R = any>
  extends BaseFormGroup<T>
  implements RolsterFormArrayGroup<T>
{
  public readonly uuid: string;

  public readonly resource?: R;

  private currentParent?: RolsterFormArray<T>;

  constructor({ controls, resource, validators }: RolsterArrayGroupProps<T>) {
    super({ controls, validators });

    this.uuid = uuid();
    this.resource = resource;
  }

  public setParent(parent: RolsterFormArray<T>): void {
    this.currentParent = parent;
  }

  public updateValueAndValidity(controls?: boolean): void {
    super.updateValueAndValidity(controls);

    this.currentParent?.updateValueAndValidity(false);
  }

  public get state(): ArrayStateGroup<T> {
    return controlsToState(this.currentControls);
  }

  public get value(): ArrayValueGroup<T> {
    return controlsToValue(this.currentControls);
  }
}

export class FormArray<T extends Controls = Controls, R = any>
  implements RolsterFormArray<T>
{
  private currentGroups: RolsterFormArrayGroup<T, R>[] = [];

  private initialState?: RolsterFormArrayGroup<T, R>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<T, R>[];

  constructor({ groups, validators }: RolsterArrayProps<T, R>) {
    this.initialState = groups;

    this.initialState?.forEach((group) => group.setParent(this));

    this.validators = validators;

    this.refresh(this.initialState);
  }

  public get groups(): RolsterFormArrayGroup<T, R>[] {
    return this.currentGroups;
  }

  public get controls(): T[] {
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

  public get state(): ArrayStateGroup<T>[] {
    return this.currentGroups.map((group) => group.state);
  }

  public get value(): ArrayValueGroup<T>[] {
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

  public push(group: RolsterFormArrayGroup<T, R>): void {
    group.setParent(this);

    this.refresh([...this.currentGroups, group]);
  }

  public merge(groups: RolsterFormArrayGroup<T, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh([...this.currentGroups, ...groups]);
  }

  public set(groups: RolsterFormArrayGroup<T, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh(groups);
  }

  public remove({ uuid }: AbstractArrayGroup<T, R>): void {
    this.refresh(this.currentGroups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<T, R>[]): void {
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

  private refresh(groups?: RolsterFormArrayGroup<T, R>[]): void {
    this.currentGroups = groups || [];

    this.updateValueAndValidity();
  }
}
