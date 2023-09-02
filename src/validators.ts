import { ValidatorFn } from './form-control';

const regAlphabetic = /^[a-z|A-Z| |ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;
const regAlphanumber = /^[0-9|a-z|A-Z|ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;
const regDecimal = /^[0-9|,|.|+|-]*$/;
const regEmail =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regOnlyNumber = /^[0-9]*$/;
const regOnlyText = /^[a-z|A-Z|ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;
const regPassword = /^[a-z|A-Z|ñ|Ñ|0-9|.|!|¡|@|_|-|#|$|&|%]*$/;

export const required: ValidatorFn<any> = (value) => {
  return value ? undefined : { message: 'Campo es requerido' };
};

export const textonly: ValidatorFn<any> = (value) => {
  return value && !regOnlyText.test(value)
    ? { message: 'Campo solo permite caracteres (sin espacio)' }
    : undefined;
};

export const alphabetic: ValidatorFn<any> = (value) => {
  return value && !regAlphabetic.test(value)
    ? { message: 'Campo solo permite caracteres' }
    : undefined;
};

export const alphanumber: ValidatorFn<any> = (value) => {
  return value && !regAlphanumber.test(value)
    ? { message: 'Campo solo permite caracteres y número' }
    : undefined;
};

export const onlyNumber: ValidatorFn<any> = (value) => {
  return value && !regOnlyNumber.test(value)
    ? { message: 'Campo debe ser númerico' }
    : undefined;
};

export const decimal: ValidatorFn<any> = (value) => {
  return value && !regDecimal.test(value)
    ? { message: 'Campo debe ser número decimal' }
    : undefined;
};

export const email: ValidatorFn<any> = (value) => {
  return value && !regEmail.test(value)
    ? { message: 'Campo debe ser correo electrónico' }
    : undefined;
};

export const password: ValidatorFn<any> = (value) => {
  return value && !regPassword.test(value)
    ? { message: 'Campo no permitido para password' }
    : undefined;
};

export function reqlength(length: number): ValidatorFn<string> {
  return (value) => {
    return !!value && value.length !== length
      ? { message: `Campo debe tener ${length} caracter(es)` }
      : undefined;
  };
}

export function minlength(length: number): ValidatorFn<string> {
  return (value) => {
    return !!value && value.length < length
      ? { message: `Campo debe tener mínimo ${length} caracter(es)` }
      : undefined;
  };
}

export function maxlength(length: number): ValidatorFn<string> {
  return (value) => {
    return !!value && value.length < length
      ? { message: `Campo debe tener máximo ${length} caracter(es)` }
      : undefined;
  };
}
