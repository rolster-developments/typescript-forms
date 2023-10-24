export type FormState<T = any> = T | undefined | null;

export interface ValidatorError<T = any> {
  id: string;
  message: string;
  data?: T;
}

type ValidatorResult = ValidatorError | undefined;

export type ValidatorFn<T> = (state?: FormState<T>) => ValidatorResult;
