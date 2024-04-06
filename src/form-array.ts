import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  arrayIsValid,
  controlsToState,
  controlsToValue,
  groupAllChecked,
  groupPartialChecked,
  instanceOfFormArrayProps,
  instanceOfFormControlProps,
  instanceOfFormGroupProps
} from './helpers';
import { BaseFormControl, BaseFormGroup } from './implementations';
import {
  RolsterFormArray,
  RolsterFormArrayControls as Controls,
  RolsterFormArrayGroup
} from './types-rolster';
import {
  AbstractArrayGroup,
  ArrayStateGroup,
  AbstractArrayControl,
  ArrayValueGroup,
  FormArrayProps,
  FormArrayControlProps,
  FormArrayGroupProps,
  ValidatorArrayFn,
  FormState,
  ValidatorGroupFn,
  FormControlProps,
  FormGroupProps
} from './types';

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

type ArgsArrayProps<T extends Controls, R> = [
  Undefined<RolsterArrayProps<T> | RolsterFormArrayGroup<T, R>[]>,
  Undefined<ValidatorArrayFn<T, R>[]>
];

function createFormArrayProps<T extends Controls, R>(
  ...argsProps: ArgsArrayProps<T, R>
): RolsterArrayProps<T, R> {
  if (argsProps.length < 1) {
    return { groups: undefined, validators: undefined };
  }

  const [groups, validators] = argsProps;

  if (
    argsProps.length < 2 &&
    instanceOfFormArrayProps<T, R, RolsterArrayProps<T, R>>(groups)
  ) {
    return groups;
  }

  return { groups: groups as RolsterFormArrayGroup<T, R>[], validators };
}

export class FormArrayControl<T = any>
  extends BaseFormControl<T, Controls>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor();
  constructor(props: RolsterArrayControlProps<T>);
  constructor(state: FormState<T>, validators?: ValidatorFn<T>[]);
  constructor(
    controlProps?: RolsterArrayControlProps<T> | FormState<T>,
    controlValidators?: ValidatorFn<T>[]
  ) {
    instanceOfFormControlProps<T, FormControlProps<T>>(controlProps)
      ? super(controlProps)
      : super(controlProps, controlValidators);

    this.uuid = uuid();
  }
}

export class FormArrayGroup<C extends Controls = Controls, R = any>
  extends BaseFormGroup<C>
  implements RolsterFormArrayGroup<C>
{
  public readonly uuid: string;

  public readonly resource?: R;

  private currentParent?: RolsterFormArray<C>;

  constructor(controls: C, validators?: ValidatorGroupFn<C>[]);
  constructor(props: RolsterArrayGroupProps<C>);
  constructor(
    groupProps: RolsterArrayGroupProps<C> | C,
    groupValidators?: ValidatorGroupFn<C>[]
  ) {
    if (instanceOfFormGroupProps<C, FormGroupProps<C>>(groupProps)) {
      super(groupProps);
      this.resource = groupProps.resource;
    } else {
      super(groupProps, groupValidators);
    }

    this.uuid = uuid();
  }

  public setParent(parent: RolsterFormArray<C>): void {
    this.currentParent = parent;
  }

  public updateValueAndValidity(controls?: boolean): void {
    super.updateValueAndValidity(controls);

    this.currentParent?.updateValueAndValidity(false);
  }

  public get state(): ArrayStateGroup<C> {
    return controlsToState(this.currentControls);
  }

  public get value(): ArrayValueGroup<C> {
    return controlsToValue(this.currentControls);
  }
}

export class FormArray<C extends Controls = Controls, R = any>
  implements RolsterFormArray<C>
{
  private currentGroups: RolsterFormArrayGroup<C, R>[] = [];

  private initialState?: RolsterFormArrayGroup<C, R>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorArrayFn<C, R>[];

  constructor();
  constructor(props: RolsterArrayProps<C>);
  constructor(
    groups: RolsterFormArrayGroup<C, R>[],
    validators?: ValidatorArrayFn<C, R>[]
  );
  constructor(
    arrayProps?: RolsterArrayProps<C> | RolsterFormArrayGroup<C, R>[],
    arrayValidators?: ValidatorArrayFn<C, R>[]
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

  public get groups(): RolsterFormArrayGroup<C, R>[] {
    return this.currentGroups;
  }

  public get controls(): C[] {
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

  public get state(): ArrayStateGroup<C>[] {
    return this.currentGroups.map((group) => group.state);
  }

  public get value(): ArrayValueGroup<C>[] {
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

  public push(group: RolsterFormArrayGroup<C, R>): void {
    group.setParent(this);

    this.refresh([...this.currentGroups, group]);
  }

  public merge(groups: RolsterFormArrayGroup<C, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh([...this.currentGroups, ...groups]);
  }

  public set(groups: RolsterFormArrayGroup<C, R>[]): void {
    groups.forEach((group) => group.setParent(this));

    this.refresh(groups);
  }

  public remove({ uuid }: AbstractArrayGroup<C, R>): void {
    this.refresh(this.currentGroups.filter((group) => group.uuid !== uuid));
  }

  public setValidators(validators: ValidatorArrayFn<C, R>[]): void {
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

  private refresh(groups?: RolsterFormArrayGroup<C, R>[]): void {
    this.currentGroups = groups || [];

    this.updateValueAndValidity();
  }
}
