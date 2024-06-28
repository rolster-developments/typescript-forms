import { v4 as uuid } from 'uuid';
import { createFormGroupProps } from '../arguments';
import { controlsToState, controlsToValue } from '../helpers';
import { BaseFormGroup } from '../implementations';
import {
  RolsterFormArray,
  RolsterFormArrayControls,
  RolsterFormArrayGroup
} from '../types-rolster';
import {
  ArrayStateGroup,
  ArrayValueGroup,
  FormArrayGroupProps,
  ValidatorGroupFn
} from '../types';

type RolsterArrayGroupProps<T extends RolsterFormArrayControls> = Omit<
  FormArrayGroupProps<T>,
  'uuid'
>;

export type FormArrayControls = RolsterFormArrayControls;

export class FormArrayGroup<
    C extends RolsterFormArrayControls = RolsterFormArrayControls,
    R = any
  >
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
    const { controls, resource, validators } = createFormGroupProps<
      C,
      RolsterArrayGroupProps<C>
    >(groupProps, groupValidators);

    super(controls, validators);

    this.uuid = uuid();
    this.resource = resource;
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
