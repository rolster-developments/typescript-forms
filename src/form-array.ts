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
  FormArrayGroupProps
} from './types';
import {
  RolsterFormArrayControls as Controls,
  RolsterFormArray,
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

class FormGroup<T extends Controls>
  extends BaseFormGroup<T>
  implements RolsterFormArrayGroup<T>, AbstractArrayGroup<T>
{
  public readonly uuid: string;

  private arrayValue?: RolsterFormArray<T>;

  constructor({ uuid, controls, validators }: FormArrayGroupProps<T>) {
    super({ controls, validators });

    this.uuid = uuid;
  }

  public setFormArray(formArray: RolsterFormArray<T>): void {
    this.arrayValue = formArray;
  }

  public updateValueAndValidity(controls?: boolean): void {
    super.updateValueAndValidity(controls);

    this.arrayValue?.updateValueAndValidity();
  }
}

function createControlsFromState<T extends Controls>(
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

export class FormArray<T extends Controls> implements RolsterFormArray<T> {
  private currentGroups: AbstractArrayGroup<T>[] = [];

  private currentControls: T[] = [];

  private builder: FormArrayBuilderState<T>;

  private currentDirty = false;

  private currentValid = true;

  private initialState?: AbstractArrayState<T>[];

  private currentState?: AbstractArrayState<T>[];

  private currentError?: ValidatorError;

  private currentErrors: ValidatorError[] = [];

  private validators?: ValidatorGroupFn<T>[];

  constructor({ builder, state, validators }: FormArrayProps<T>) {
    this.initialState = state;
    this.currentState = state;
    this.builder = builder;
    this.validators = validators;

    this.render(state);
  }

  public get groups(): AbstractArrayGroup<T>[] {
    return this.currentGroups;
  }

  public get controls(): T[] {
    return this.currentControls;
  }

  public get dirty(): boolean {
    return this.currentDirty;
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
    this.render(this.initialState);
  }

  public push(state: Partial<AbstractArrayState<T>>): void {
    const { builder, validators } = this;

    const controls = createControlsFromState(state, builder);

    this.currentControls.push(controls);
    this.currentGroups.push(
      new FormGroup({ uuid: uuid(), controls, validators })
    );
  }

  public refresh(_: AbstractArrayControl<any>): void {}

  public remove({ uuid }: AbstractArrayGroup<T>): void {
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

  private render(state?: AbstractArrayState<T>[]): void {
    if (!state) {
      this.currentControls = [];
      this.currentGroups = [];
    } else {
      const { builder, validators } = this;

      this.currentControls = state.map((state) =>
        createControlsFromState(state, builder)
      );

      this.currentGroups = this.currentControls.map((controls) => {
        const formGroup = new FormGroup({ uuid: uuid(), controls, validators });

        formGroup.setFormArray(this);

        return formGroup;
      });
    }
  }
}
