import {
  AbstractControls,
  FormState,
  ValidatorError,
  ValidatorFn,
  ValidatorGroupFn
} from './types';

interface StateProps<T> {
  state: FormState<T>;
  validators: ValidatorFn<T>[];
}

interface ControlsProps<T extends AbstractControls> {
  controls: T;
  validators: ValidatorGroupFn<T>[];
}

export const evalFormControlValid = <T>(
  props: StateProps<T>
): ValidatorError[] => {
  const { state, validators } = props;

  return validators.reduce((errors, validator) => {
    const error = validator(state);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
};

export const evalFormGroupValid = <T extends AbstractControls>(
  props: ControlsProps<T>
): ValidatorError[] => {
  const { controls, validators } = props;

  return validators.reduce((errors, validator) => {
    const error = validator(controls);

    if (error) {
      errors.push(error);
    }

    return errors;
  }, [] as ValidatorError[]);
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
