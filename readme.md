# Rolster Typescript Types

Package containing the basic definitions for handling data types.

## Installation

```
npm i @rolster/typescript-types
```

## Configuration

The package path must be added in the `files` property in the `tsconfig.json` file

```json
{
  "files": ["node_modules/@rolster/typescript-types/index.d.ts"]
}
```

## Interfaces

| Name           | Description                                         |
| -------------- | --------------------------------------------------- |
| `Undefined<T>` | Allows to type a generic data with undefined value. |
| `Nulleable<T>` | Allows to type a generic data with nulleable value. |
| `Unknown<T>`   | Allows to type a generic data with unknown value.   | 

## Implementation

```ts
// Variable can contain an string|undefined value
const value1: Undefined<string> = 'string' || undefined;

// Variable can contain an boolean|null value
const value2: Nulleable<boolean> = false || null;

// Variable can contain an number|unknown value
const value3: Unknown<number> = 1044 || unknown;
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
