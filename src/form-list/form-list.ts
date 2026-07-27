import { ValidatorFn } from '@rolster/validators';
import { FormControl } from '../form-control/form-control';

export class FormList<T = any> extends FormControl<T[]> {
  constructor(value?: T[], validators?: ValidatorFn<T[]>[]) {
    super(value || [], validators);
  }

  public push(item: T): void {
    this.setValue([...this.value, item]);
  }

  public remove(item: T): void {
    const value = this.value.filter((current) => current !== item);

    if (value.length !== this.value.length) {
      this.setValue(value);
    }
  }

  public clear(): void {
    if (this.value.length > 0) {
      this.setValue([]);
    }
  }
}

export function formList<T = any>(
  value?: T[],
  validators?: ValidatorFn<T[]>[]
): FormList<T> {
  return new FormList(value, validators);
}
