# Rolster Forms Utilities

It implements a set of classes that allow managing the control of states of the input components of the UI.

## Installation

```
npm i @rolster/forms
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Features

A framework-agnostic, reactive form-state engine. You compose three building
blocks — **controls**, **groups** and **arrays** — and every change runs the
validators and notifies subscribers automatically. Validation rules come from
[`@rolster/validators`](https://www.npmjs.com/package/@rolster/validators).

Each building block has a class and a matching factory function (the factory is
the recommended way to create them):

| Class             | Factory              | Purpose                                   |
| ----------------- | -------------------- | ----------------------------------------- |
| `FormControl`     | `formControl()`      | A single field                            |
| `FormGroup`       | `formGroup()`        | A set of named controls (a form)          |
| `FormArray`       | `formArray()`        | A dynamic list of groups                  |
| `FormArrayGroup`  | `formArrayGroup()`   | A group item inside a `FormArray`         |

### FormControl

A control holds a value, its validators and a rich set of state flags.

```typescript
import { formControl } from '@rolster/forms';
import { required, email } from '@rolster/validators/helpers';

const emailControl = formControl('', [required, email]);

emailControl.value; // ''
emailControl.valid; // false
emailControl.error; // { id: 'required', message: 'Field is required', ... }

emailControl.setValue('daniel@rolster.com');
emailControl.valid; // true

// React to value changes
const unsubscribe = emailControl.subscribe((value) => console.log(value));
```

**State flags:** `valid` / `invalid`, `dirty` / `pristine` (value changed),
`touched` / `untouched` (interacted via `touch()`/`blur()`), `disabled` /
`enabled`, and `wrong` (`touched && invalid`, ideal for deciding when to show
an error in the UI).

**Key methods:** `setValue(value)`, `setValidators(validators)`, `reset()`,
`disable()` / `enable()`, `touch()` / `blur()`, `hasError(id)`,
`subscribe(observer)`.

### FormGroup

A group binds several named controls together and tracks their aggregate state.

```typescript
import { formGroup, formControl } from '@rolster/forms';
import { required, email, strMinlength } from '@rolster/validators/helpers';

const loginForm = formGroup({
  email: formControl('', [required, email]),
  password: formControl('', [required, strMinlength(8)])
});

// Read aggregated state
loginForm.valid; // false — at least one control is invalid
loginForm.value; // { email: '', password: '' }

// Update several controls at once (shallow merge)
loginForm.setValue({ email: 'daniel@rolster.com', password: '12345678' });
loginForm.valid; // true

// Access a single control
loginForm.controls.email.wrong; // touched && invalid

// Subscribe to the whole group value
loginForm.subscribe((value) => console.log(value));

loginForm.reset(); // restores every control to its default value
```

`FormGroup` aggregates child state with both "any" and "all" variants:
`dirty`/`dirties`, `pristine`/`pristines`, `touched`/`toucheds`,
`untouched`/`untoucheds`.

### FormArray

A `FormArray` manages a dynamic list of group items (each one a
`FormArrayGroup` with a stable `uuid`), perfect for repeatable sections such as
"add another address".

```typescript
import { formArray, formArrayGroup, formControl } from '@rolster/forms';
import { required } from '@rolster/validators/helpers';

const phones = formArray([]);

function phoneGroup() {
  return formArrayGroup({
    label: formControl('', [required]),
    number: formControl('', [required])
  });
}

// Add / remove items
const home = phoneGroup();
phones.push(home);
phones.merge([phoneGroup(), phoneGroup()]);

phones.value; // [{ label: '', number: '' }, ...]
phones.valid; // false until every item is valid

// Find by its uuid and update it
const found = phones.findByUuid(home.uuid);
found?.controls.number.setValue('3001234567');

phones.remove(home);
```

### Custom validators

A validator is just a `ValidatorFn`: it receives the value and returns a
`ValidatorError` (invalid) or `undefined` (valid).

```typescript
import { formControl } from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';

const isEven: ValidatorFn<number> = (value) =>
  value && value % 2 !== 0
    ? { id: 'even', message: 'Value must be even' }
    : undefined;

const control = formControl(3, [isEven]);
control.hasError('even'); // true
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
