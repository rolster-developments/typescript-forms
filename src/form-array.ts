import { v4 as uuid } from 'uuid';
import { groupAllChecked, groupIsValid, groupSomeChecked } from './helpers';
import { BaseFormControl, BaseFormGroup } from './implementations';
import {
  AbstractArrayGroup,
  AbstractArrayState,
  AbstractArrayControl,
  AbstractArrayValue,
  ValidatorError,
  FormArrayProps,
  ValidatorGroupFn,
  FormArrayBuilderState,
  FormArrayControlProps,
  FormArrayGroupProps,
  CollectionStateArray
} from './types';
import {
  RolsterFormArray,
  RolsterFormArrayControls as Controls,
  RolsterFormArrayGroup
} from './types.rolster';

class FormControl<T = any>
  extends BaseFormControl<T, Controls>
  implements AbstractArrayControl<T>
{
  public readonly uuid: string;

  constructor({ uuid, state, validators }: FormArrayControlProps<T>) {
    super({ state, validators });

    this.uuid = uuid;
  }
}

class FormGroup<T extends Controls = Controls, E = any>
  extends BaseFormGroup<T>
  implements RolsterFormArrayGroup<T>, AbstractArrayGroup<T>
{
  public readonly uuid: string;

  public readonly resource?: E;

  private currentParent?: RolsterFormArray<T>;

  constructor({
    controls,
    uuid,
    resource: entity,
    validators
  }: FormArrayGroupProps<T>) {
    super({ controls, validators });

    this.uuid = uuid;
    this.resource = entity;
  }

  public setParent(parent: RolsterFormArray<T>): void {
    this.currentParent = parent;
  }

  public updateValueAndValidity(controls?: boolean): void {
    super.updateValueAndValidity(controls);

    this.currentParent?.updateValueAndValidity();
  }
}

function createControls<T extends Controls = Controls>(
  state: Partial<AbstractArrayState<T>>,
  builder: FormArrayBuilderState<T>
): T {
  return Object.entries(builder(state)).reduce(
    (controls, [key, { state, validators }]) => {
      controls[key] = new FormControl({ uuid: uuid(), state, validators });

      return controls;
    },
    {} as any
  );
}

export class FormArray<T extends Controls = Controls, E = any>
  implements RolsterFormArray<T>
{
  private currentGroups: AbstractArrayGroup<T, E>[] = [];

  private builder: FormArrayBuilderState<T>;

  private initialState?: AbstractArrayState<T>[];

  private currentState?: AbstractArrayState<T>[];

  private currentValid = true;

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorGroupFn<T>[];

  constructor({ builder, state, validators }: FormArrayProps<T>) {
    this.initialState = state;
    this.currentState = state;
    this.builder = builder;
    this.validators = validators;

    this.initGroups(state);
  }

  public get groups(): AbstractArrayGroup<T, E>[] {
    return this.currentGroups;
  }

  public get controls(): T[] {
    return this.groups.map(({ controls }) => controls);
  }

  public get touched(): boolean {
    return groupSomeChecked(this.currentGroups, 'touched');
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
    return groupSomeChecked(this.currentGroups, 'dirty');
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

  public get invalid(): boolean {
    return !this.currentValid;
  }

  public get valid(): boolean {
    return this.currentValid;
  }

  public get state(): AbstractArrayState<T>[] | undefined {
    return this.currentState;
  }

  public get value(): AbstractArrayValue<T>[] {
    return this.currentState as AbstractArrayValue<T>[];
  }

  public get error(): ValidatorError | undefined {
    return this.currentError;
  }

  public get errors(): ValidatorError[] {
    return this.currentErrors;
  }

  public reset(): void {
    this.initGroups(this.initialState);
  }

  public push(state: Partial<AbstractArrayState<T>>, resource?: E): void {
    this.setGroups([...this.currentGroups, this.createGroup(state, resource)]);
  }

  public merge(collection: CollectionStateArray<T, E>[]): void {
    this.setGroups([
      ...this.currentGroups,
      ...collection.map(({ state, resource }) =>
        this.createGroup(state, resource)
      )
    ]);
  }

  public set(collection: CollectionStateArray<T, E>[]): void {
    this.setGroups(
      collection.map(({ state, resource }) => this.createGroup(state, resource))
    );
  }

  public remove({ uuid }: AbstractArrayGroup<T, E>): void {
    this.setGroups(this.currentGroups.filter((group) => group.uuid !== uuid));
  }

  public updateValueAndValidity(): void {
    if (this.validators) {
      const { groups, validators } = this;

      const errors = groups.reduce(
        (errors, { controls }) => [
          ...errors,
          ...groupIsValid({ controls, validators })
        ],
        [] as ValidatorError[]
      );

      this.currentErrors = errors;
      this.currentError = errors[0];

      this.currentValid = errors.length === 0;
    } else {
      this.currentValid = true;
      this.currentErrors = [];
      this.currentError = undefined;
    }
  }

  private createGroup(
    state: Partial<AbstractArrayState<T>>,
    resource?: E
  ): FormGroup<T> {
    const { builder, validators } = this;

    return new FormGroup({
      controls: createControls(state, builder),
      uuid: uuid(),
      resource,
      validators
    });
  }

  private setGroups(groups: AbstractArrayGroup<T, E>[]): void {
    this.currentGroups = groups;

    this.updateValueAndValidity();
  }

  private initGroups(state?: AbstractArrayState<T>[]): void {
    if (state) {
      const { builder, validators } = this;

      this.setGroups(
        state.map((state) => {
          const formGroup = new FormGroup({
            uuid: uuid(),
            controls: createControls(state, builder),
            validators
          });

          formGroup.setParent(this);

          return formGroup;
        })
      );
    } else {
      this.setGroups([]);
    }
  }
}
