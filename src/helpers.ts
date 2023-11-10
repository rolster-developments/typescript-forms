import {
  AbstractControl,
  AbstractControls,
  AbstractGroupControls,
  FormState,
  StateControls,
  ValidatorError,
  ValidatorFn,
  ValidatorGroupFn,
  ValueControls
} from './types';

interface StateProps<T> {
  state: FormState<T>;
  validators: ValidatorFn<T>[];
}

interface ControlsProps<T extends AbstractGroupControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

export const evalFormControlValid = <T>({
  state,
  validators
}: StateProps<T>): ValidatorError[] => {
  return validators.reduce((errors, validator) => {
    const error = validator(state);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export const evalFormGroupValid = <T extends AbstractGroupControls>({
  controls,
  validators
}: ControlsProps<T>): ValidatorError[] => {
  return [
    ...Object.values(controls).reduce(
      (errors, control) => [...errors, ...control.errors],
      [] as ValidatorError[]
    ),
    ...validators.reduce((errors, validator) => {
      const error = validator(controls);

      if (error) {
        errors.push(error);
      }

      return errors;
    }, [] as ValidatorError[])
  ];
};

export const controlsToValid = <T extends AbstractControl>(
  controls: AbstractControls<T>
): boolean => {
  return Object.values(controls).reduce(
    (validState, { valid }) => validState && valid,
    true
  );
};

export const controlsToDirty = <T extends AbstractControl>(
  controls: AbstractControls<T>
): boolean => {
  return Object.values(controls).reduce(
    (dirtyState, { dirty }) => dirtyState && dirty,
    true
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
