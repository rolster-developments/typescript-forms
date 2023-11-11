import {
  AbstractControl,
  AbstractControls,
  AbstractGroup,
  AbstractGroupControls,
  FormState,
  StateControls,
  ValidatorError,
  ValidatorFn,
  ValidatorGroupFn,
  ValueControls
} from './types';

const FALSY_VALUE = ['false', 'undefined', '0', 0];

const toBoolean = (value: any): boolean => {
  return !(
    !(typeof value !== 'undefined' && value !== null) ||
    value === false ||
    FALSY_VALUE.includes(value)
  );
};

interface StateProps<T> {
  state: FormState<T>;
  validators: ValidatorFn<T>[];
}

interface ControlsProps<T extends AbstractGroupControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

export const controlIsValid = <T>(props: StateProps<T>): ValidatorError[] => {
  const { state, validators } = props;

  return validators.reduce((errors, validator) => {
    const error = validator(state);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export const controlsAllChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value && toBoolean(control[props]),
    true
  );
};

export const controlsSomeChecked = <T extends AbstractControl>(
  controls: AbstractControls<T>,
  props: keyof T
): boolean => {
  return Object.values(controls).reduce(
    (value, control) => value || toBoolean(control[props]),
    false
  );
};

export const controlsToState = <T extends AbstractGroupControls>(
  controls: T
): StateControls<T> => {
  return Object.entries(controls).reduce((json, [key, { state }]) => {
    json[key as keyof T] = state;

    return json;
  }, {} as StateControls<T>);
};

export const controlsToValue = <T extends AbstractGroupControls>(
  controls: T
): ValueControls<T> => {
  return Object.entries(controls).reduce((json, [key, { value }]) => {
    json[key as keyof T] = value;

    return json;
  }, {} as ValueControls<T>);
};

export const groupIsValid = <T extends AbstractGroupControls>({
  controls,
  validators
}: ControlsProps<T>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(controls);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export function groupAllChecked<T extends AbstractGroupControls>(
  groups: AbstractGroup<T>[],
  key: keyof AbstractGroup<T>
): boolean {
  return groups.reduce((value, group) => value && toBoolean(group[key]), true);
}

export function groupSomeChecked<T extends AbstractGroupControls>(
  groups: AbstractGroup<T>[],
  key: keyof AbstractGroup<T>
): boolean {
  return groups.reduce((value, group) => value || toBoolean(group[key]), false);
}

type ObjectJSON = Record<string, any>;

type Validators<T extends ObjectJSON> = Partial<
  Record<keyof T, ValidatorFn<T>[]>
>;

type ErrorsJSON = Record<string, ValidatorError[]>;

interface ValidatorsResult {
  errors: ErrorsJSON;
  valid: boolean;
}

export const validateJSON = <T extends ObjectJSON>(
  object: T,
  validators: Validators<T>
): ValidatorsResult => {
  return Object.keys(validators).reduce(
    (result, key) => {
      const validatorsFn = validators[key];

      const errorsObject =
        validatorsFn?.reduce((errors, validator) => {
          const error = validator(object[key]);

          if (error) {
            errors.push(error);
          }

          return errors;
        }, [] as ValidatorError[]) || [];

      if (errorsObject.length) {
        const errors: ErrorsJSON = { ...result.errors };
        errors[key] = errorsObject;

        return {
          ...result,
          errors,
          valid: result.valid && false
        };
      }

      return result;
    },
    { valid: true, errors: {} } as ValidatorsResult
  );
};
