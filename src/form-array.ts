import { v4 as uuid } from 'uuid';
import { evalFormGroupValid } from './helpers';
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
  SetArrayProps
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

  public readonly entity?: E;

  private currentParent?: RolsterFormArray<T>;

  constructor({ controls, uuid, entity, validators }: FormArrayGroupProps<T>) {
    super({ controls, validators });

    this.uuid = uuid;
    this.entity = entity;
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

function boolSomeGroupValid<T extends Controls = Controls, E = any>(
  groups: AbstractArrayGroup<T, E>[],
  key: keyof AbstractArrayGroup<T, E>
): boolean {
  return groups.reduce(
    (currentState, group) => currentState || (group[key] as boolean),
    false
  );
}

function boolAllGroupValid<T extends Controls = Controls, E = any>(
  groups: AbstractArrayGroup<T, E>[],
  key: keyof AbstractArrayGroup<T, E>
): boolean {
  return groups.reduce(
    (currentState, group) => currentState && (group[key] as boolean),
    true
  );
}

export class FormArray<T extends Controls = Controls, E = any>
  implements RolsterFormArray<T>
{
  private currentGroups: AbstractArrayGroup<T, E>[] = [];

  private currentControls: T[] = [];

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

    this.update(state);
  }

  public get groups(): AbstractArrayGroup<T, E>[] {
    return this.currentGroups;
  }

  public get controls(): T[] {
    return this.currentControls;
  }

  public get touched(): boolean {
    return boolSomeGroupValid(this.currentGroups, 'touched');
  }

  public get touchedAll(): boolean {
    return boolAllGroupValid(this.currentGroups, 'touchedAll');
  }

  public get dirty(): boolean {
    return boolSomeGroupValid(this.currentGroups, 'dirty');
  }

  public get dirtyAll(): boolean {
    return boolAllGroupValid(this.currentGroups, 'dirtyAll');
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
    this.update(this.initialState);
  }

  public push(state: Partial<AbstractArrayState<T>>, entity?: E): void {
    const { builder, validators } = this;

    const controls = createControls(state, builder);

    this.currentControls.push(controls);
    this.currentGroups.push(
      new FormGroup({ controls, uuid: uuid(), entity, validators })
    );
  }

  public merge(collection: SetArrayProps<T, E>[]): void {
    collection.forEach(({ state, entity }) => this.push(state, entity));
  }

  public set(collection: SetArrayProps<T, E>[]): void {
    this.currentControls = [];
    this.currentGroups = [];

    collection.forEach(({ state, entity }) => this.push(state, entity));
  }

  public remove({ uuid }: AbstractArrayGroup<T, E>): void {
    this.currentGroups = this.currentGroups.filter(
      (group) => group.uuid !== uuid
    );

    this.currentControls = this.currentGroups.map(({ controls }) => controls);
  }

  public updateValueAndValidity(): void {
    if (!this.validators) {
      this.currentValid = true;
    } else {
      const { controls, validators } = this;

      const errors = controls.reduce((errors, controls) => {
        return [...errors, ...evalFormGroupValid({ controls, validators })];
      }, [] as ValidatorError[]);

      this.currentErrors = errors;
      this.currentError = errors[0];

      this.currentValid = errors.length === 0;
    }
  }

  private update(state?: AbstractArrayState<T>[]): void {
    if (!state) {
      this.currentControls = [];
      this.currentGroups = [];
    } else {
      const { builder, validators } = this;

      this.currentControls = state.map((state) =>
        createControls(state, builder)
      );

      this.currentGroups = this.currentControls.map((controls) => {
        const formGroup = new FormGroup({ uuid: uuid(), controls, validators });

        formGroup.setParent(this);

        return formGroup;
      });
    }
  }
}
