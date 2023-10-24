export const regAlphabetic = /^[a-z|A-Z| |ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;

export const regAlphanumber = /^[0-9|a-z|A-Z|ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;

export const regDecimal = /^[0-9|,|.|+|-]*$/;

export const regEmail =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const regOnlyNumber = /^[0-9]*$/;

export const regOnlyText = /^[a-z|A-Z|ñ|Ñ|á|Á|é|É|í|Í|ó|Ó|ú|Ú|ü|Ü]*$/;

export const regPassword = /^[a-z|A-Z|ñ|Ñ|0-9|.|!|¡|@|_|-|#|$|&|%]*$/;
