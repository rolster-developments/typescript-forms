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

| Class              | Factory              | Purpose                                         |
| ------------------ | -------------------- | ----------------------------------------------- |
| `FormControl`      | `formControl()`      | A single field                                  |
| `FormGroup`        | `formGroup()`        | A set of named controls (a form)                |
| `FormArray`        | `formArray()`        | A dynamic list of groups                        |
| `FormArrayGroup`   | `formArrayGroup()`   | A group item inside a `FormArray`               |
| `FormArrayControl` | `formArrayControl()` | A control (with `uuid`) inside a group item     |
| `FormList`         | `formList()`         | A control whose value is a list of items        |
| `FormArrayList`    | `formArrayList()`    | A control whose value is a list of control sets |

Every factory (and constructor) also accepts a single options object instead of
positional arguments: `formControl({ value, validators })`,
`formGroup({ controls, validators })`, `formArray({ groups, validators })` and
`formArrayGroup({ controls, validators, resource })`. The option types are
`FormControlOptions`, `FormGroupOptions`, `FormArrayOptions` and
`FormArrayGroupOptions`.

### FormControl

A control holds a value, its validators and a rich set of state flags. It
implements `ReactiveFormControl<T>` (`AbstractFormControl<T>` plus `subscribe`).

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
`touched` / `untouched` (interacted via `touch()`/`blur()`), `focused` /
`unfocused` (via `focus()`/`blur()`), `disabled` / `enabled`, and `wrong`
(`touched && invalid`, ideal for deciding when to show an error in the UI).

**Key methods:** `setValue(value)` (marks the control dirty),
`setStartValue(value)` (updates the value without marking it dirty),
`setDefaultValue(value)` (also replaces the value restored by `reset()`),
`setValidators(validators)`, `reset()`, `disable()` / `enable()`,
`focus()` / `blur()`, `touch()`, `hasError(id)`, `someErrors(ids)`,
`subscribe(observer)`.

### FormGroup

A group binds several named controls together and tracks their aggregate state.
It implements `AbstractFormGroup<C>` and is built from a `FormGroupOptions<C>`.

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
"add another address". The controls of a `FormArrayGroup` must be created with
`formArrayControl` (a `FormControl` that also carries a `uuid`, typed as
`ReactiveArrayControl`); the group controls shape is a `FormArrayControls`.

```typescript
import { formArray, formArrayControl, formArrayGroup } from '@rolster/forms';
import { required } from '@rolster/validators/helpers';

const phones = formArray([]);

function phoneGroup() {
  return formArrayGroup({
    label: formArrayControl('', [required]),
    number: formArrayControl('', [required])
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

A `FormArrayGroup` can also carry a typed `resource`: the original payload the
item was built from, handy when mapping the group back to your domain model:

```typescript
interface Phone {
  id: number;
  number: string;
}

const item = formArrayGroup({
  controls: { number: formArrayControl('3001234567') },
  resource: { id: 7, number: '3001234567' } as Phone
});

item.resource; // { id: 7, number: '3001234567' }
```

### FormList

A `FormList<T>` is a `FormControl<T[]>` with helpers to mutate the list. Each
mutation goes through `setValue`, so validators run and subscribers are
notified:

```typescript
import { formList } from '@rolster/forms';

const tags = formList<string>(['forms']);

tags.push('reactive');
tags.value; // ['forms', 'reactive']

tags.remove('forms');
tags.clear();
tags.value; // []
```

### FormArrayList

A `FormArrayList<C>` is a `FormControl` whose value is a list of plain objects,
each one backed by a set of `FormArrayControl`s built with the
`valueToControls` function you provide (`formArrayList(valueToControls,
value?, validators?)`). Use `controls` to reach the controls of every item and
`push(controls)` / `remove(controls)` to mutate the list:

```typescript
import {
  formArrayControl,
  formArrayList,
  FormArrayControl
} from '@rolster/forms';

type TagControls = {
  name: FormArrayControl<string>;
};

const tags = formArrayList<TagControls>(
  ({ name }) => ({ name: formArrayControl(name) }),
  [{ name: 'forms' }]
);

tags.value; // [{ name: 'forms' }]

tags.push({ name: formArrayControl('reactive') });
tags.controls.length; // 2
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

Group validators are `ValidatorGroupFn<C>` (they receive the `controls`) and
array validators are `ValidatorArrayFn<C>` (they receive the `groups`).

### Helpers (`@rolster/forms/helpers`)

The internals that back the classes are exported from the `helpers` subpath,
useful when building your own controls or framework bindings:

| Helper                                                  | Description                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `hasError(errors, key)`                                 | Whether a `ValidatorError[]` contains the error `key`.                |
| `someErrors(errors, keys)`                              | Whether a `ValidatorError[]` contains any of `keys`.                  |
| `reduceControlsToArray(controls, key)`                  | Collects the property `key` of every control into an array.           |
| `reduceGroupToArray(group, key)`                        | Same as above, reading `group.controls`.                              |
| `createFormControlOptions(valueOrOptions, validators)`  | Normalizes `formControl` arguments into a `FormControlOptions`.       |
| `formControlIsValid({ value, validators })`             | Runs the validators against a value and returns the errors.           |
| `createFormGroupOptions(controlsOrOptions, validators)` | Normalizes `formGroup` arguments into a `FormGroupOptions`.           |
| `formGroupIsValid({ controls, validators })`            | Runs the group validators and returns the errors.                     |
| `controlsToValue(controls)`                             | Maps a controls record to its `{ key: value }` object.                |
| `verifyAllTrueInControls(controls, key)`                | `true` when the flag `key` is truthy in every enabled control.        |
| `verifyAnyTrueInControls(controls, key)`                | `true` when the flag `key` is truthy in at least one enabled control. |
| `createFormArrayOptions(groupsOrOptions, validators)`   | Normalizes `formArray` arguments into a `FormArrayOptions`.           |
| `formArrayIsValid({ groups, validators })`              | Runs the array validators and returns the errors.                     |
| `verifyAllTrueInGroups(groups, key)`                    | `true` when the flag `key` is truthy in every group.                  |
| `verifyAnyTrueInGroups(groups, key)`                    | `true` when the flag `key` is truthy in at least one group.           |

```typescript
import { controlsToValue, hasError } from '@rolster/forms/helpers';

controlsToValue(loginForm.controls); // { email: '...', password: '...' }
hasError(emailControl.errors, 'required');
```

### Types

| Type                          | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `AbstractFormControl<T>`      | Contract of a single control: value, state flags, `setValue`, `focus`/`blur`. |
| `ReactiveFormControl<T>`      | `AbstractFormControl` plus `subscribe`; implemented by `FormControl`.         |
| `FormControlOptions<T>`       | `{ value, validators? }` accepted by `formControl`.                           |
| `AbstractFormGroup<C>`        | Contract of a group: `controls`, aggregated flags, `setValue`, `reset`.       |
| `FormGroupOptions<C>`         | `{ controls, validators? }` accepted by `formGroup`.                          |
| `FormArrayOptions<C, R, G>`   | `{ groups?, validators? }` accepted by `formArray`.                           |
| `FormArrayControls<T>`        | Record of `ReactiveArrayControl`s: the controls shape of a `FormArrayGroup`.  |
| `ReactiveArrayControl<T>`     | `AbstractFormControl` with a `uuid` and `subscribe`; `FormArrayControl` type. |
| `FormArrayGroupOptions<C, R>` | `{ controls, validators?, resource?, uuid }`; `formArrayGroup` omits `uuid`.  |

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
