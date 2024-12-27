import { ValidatorFn } from '@rolster/validators';
import { FormControlOptions } from '../types';

export type ArgsListOptions<T = any> = [
  FormControlOptions<T> | T | undefined,
  Undefined<ValidatorFn<T>[]>
];
