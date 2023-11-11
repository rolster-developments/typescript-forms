import {
  regAlphabetic,
  regAlphanumber,
  regDecimal,
  regEmail,
  regOnlyNumber,
  regOnlyText,
  regPassword
} from './expressions';
import { ValidatorFn } from './types';

export const required: ValidatorFn<any> = (value) => {
  return value
    ? undefined
    : {
        id: 'required',
        message: 'Campo es requerido'
      };
};

export const textonly: ValidatorFn<any> = (value) => {
  return value && !regOnlyText.test(value)
    ? {
        id: 'textonly',
        message: 'Campo solo permite caracteres (sin espacio)'
      }
    : undefined;
};

export const alphabetic: ValidatorFn<any> = (value) => {
  return value && !regAlphabetic.test(value)
    ? {
        id: 'alphabetic',
        message: 'Campo solo permite caracteres'
      }
    : undefined;
};

export const alphanumber: ValidatorFn<any> = (value) => {
  return value && !regAlphanumber.test(value)
    ? {
        id: 'alphanumber',
        message: 'Campo solo permite caracteres y número'
      }
    : undefined;
};

export const onlyNumber: ValidatorFn<any> = (value) => {
  return value && !regOnlyNumber.test(value)
    ? {
        id: 'onlyNumber',
        message: 'Campo debe ser númerico'
      }
    : undefined;
};

export const decimal: ValidatorFn<any> = (value) => {
  return value && !regDecimal.test(value)
    ? {
        id: 'decimal',
        message: 'Campo debe ser número decimal'
      }
    : undefined;
};

export const email: ValidatorFn<any> = (value) => {
  return value && !regEmail.test(value)
    ? {
        id: 'email',
        message: 'Campo debe ser correo electrónico'
      }
    : undefined;
};

export const password: ValidatorFn<any> = (value) => {
  return value && !regPassword.test(value)
    ? {
        id: 'password',
        message: 'Campo no permitido para password'
      }
    : undefined;
};

export const strReqlength = (length: number): ValidatorFn<string> => {
  return (value) => {
    return !!value && value.length !== length
      ? {
          id: 'reqlength',
          message: `Campo debe tener ${length} caracter(es)`
        }
      : undefined;
  };
};

export const strMinlength = (length: number): ValidatorFn<string> => {
  return (value) => {
    return !!value && value.length < length
      ? {
          id: 'minlength',
          message: `Campo debe tener mínimo ${length} caracter(es)`
        }
      : undefined;
  };
};

export const strMaxlength = (length: number): ValidatorFn<string> => {
  return (value) => {
    return !!value && value.length < length
      ? {
          id: 'maxlength',
          message: `Campo debe tener máximo ${length} caracter(es)`
        }
      : undefined;
  };
};
