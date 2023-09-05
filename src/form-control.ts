export type FormState<T = any> = T | undefined | null;

export interface ValidatorError {
  message: string;
}

type ValidatorResult = ValidatorError | undefined;

export type ValidatorFn<T> = (state?: FormState<T>) => ValidatorResult;

type Subscriber<T> = (state?: FormState<T>) => void;

export interface AbstractControl<T> {
  active: boolean;
  dirty: boolean;
  disabled: boolean
  errors: ValidatorError[];
  invalid: boolean;
  valid: boolean;
  value: T;
  error?: ValidatorError;
  state?: FormState<T>;
  reset: () => void;
  setActive: (active: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  setState: (state?: FormState<T>) => void;
  setValidators: (validators: ValidatorFn<T>[]) => void;
  subscribe: (subscriber: Subscriber<T>) => void;
  updateValueAndValidity: () => void;
}

interface FormControlProps<T> {
  state?: FormState<T>;
  validators?: ValidatorFn<T>[];
}

export class FormControl<T = any> implements AbstractControl<T> {
  private activeValue = false;

  private dirtyValue = false;

  private disabledValue = false;

  private validValue = true;

  private initialState: FormState<T>;

  private stateValue?: FormState<T>;

  private errorValue?: ValidatorError;

  private errorsValue: ValidatorError[] = [];

  private validators: ValidatorFn<T>[] = [];

  private subscribers: Set<Subscriber<T>>;

  constructor({ state, validators }: FormControlProps<T>) {
    this.subscribers = new Set();

    this.initialState = state;

    if (validators) {
      this.validators = validators;
    }

    this.stateValue = state;
    this.updateValueAndValidity();
  }

  public get active(): boolean {
    return this.activeValue;
  }

  public get dirty(): boolean {
    return this.dirtyValue;
  }

  public get disabled(): boolean {
    return this.disabledValue;
  }

  public get invalid(): boolean {
    return !this.validValue;
  }

  public get valid(): boolean {
    return this.validValue;
  }

  public get state(): FormState<T> {
    return this.stateValue;
  }

  public get value(): T {
    return this.stateValue as T;
  }

  public get error(): ValidatorError | undefined {
    return this.errorValue;
  }

  public get errors(): ValidatorError[] {
    return this.errorsValue;
  }

  public reset(): void {
    this.setState(this.initialState);
    this.setDirty(false);
  }

  public setActive(active: boolean): void {
    this.activeValue = active;
  }

  public setDirty(dirty: boolean): void {
    this.dirtyValue = dirty;
  }

  public setDisabled(disabled: boolean): void {
    this.disabledValue = disabled;
  }

  public setState(state?: FormState<T>): void {
    this.stateValue = state;

    this.subscribers.forEach((subscriber) => {
      subscriber(state);
    });

    this.updateValueAndValidity();
  }

  public setValidators(validators: ValidatorFn<T>[]): void {
    this.validators = validators;
    this.updateValueAndValidity();
  }

  public subscribe(subscriber: Subscriber<T>): void {
    this.subscribers.add(subscriber);
  }

  public updateValueAndValidity(): void {
    const { stateValue, validators } = this;

    const errors = validators.reduce((errors: ValidatorError[], validator) => {
      const error = validator(stateValue);

      if (error) {
        errors.push(error);
      }

      return errors;
    }, []);

    const [error] = errors;

    this.errorsValue = errors;
    this.errorValue = error;

    this.validValue = errors.length === 0;
  }
}
