# indexable-array

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Extended native JavaScript Array which provides indexed lookup similar to native Map.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Description](#description)
- [Synopsis](#synopsis)
- [Details](#details)
- [API](#api)
- [indexable-array](#indexable-array)
  - [Table of contents](#table-of-contents)
    - [Classes](#classes)
- [Classes](#classes-1)
- [Class: default<I, DK, OK, TH\>](#class-defaulti-dk-ok-th%5C)
  - [Type parameters](#type-parameters)
  - [Hierarchy](#hierarchy)
  - [Table of contents](#table-of-contents-1)
    - [Properties](#properties)
    - [Accessors](#accessors)
    - [Methods](#methods)
  - [Properties](#properties-1)
    - [indexedKeys](#indexedkeys)
  - [Accessors](#accessors-1)
    - [defaultKey](#defaultkey)
  - [Methods](#methods-1)
    - [concat](#concat)
    - [disableIndex](#disableindex)
    - [enableIndex](#enableindex)
    - [filter](#filter)
    - [flatMap](#flatmap)
    - [get](#get)
    - [getAll](#getall)
    - [getAllIndexes](#getallindexes)
    - [getIndex](#getindex)
    - [getMaybe](#getmaybe)
    - [getSure](#getsure)
    - [has](#has)
    - [map](#map)
    - [mapToArray](#maptoarray)
    - [push](#push)
    - [set](#set)
    - [slice](#slice)
    - [sort](#sort)
    - [sortBy](#sortby)
    - [splice](#splice)
    - [withDefaultIndex](#withdefaultindex)
    - [from](#from)
    - [throwingFrom](#throwingfrom)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

`npm install indexable-array`

# Description

`indexable-array` extends native JavaScript array and provides indexed lookup features similar to native `Map` by using
`Proxy` for shallow change detection.

# Synopsis

```ts
import IndexableArray, { Self } from "indexable-array";

const users = new IndexableArray({ id: 23, name: "George" }, { id: 92, name: "George" }).addIndex("name", Self);
const otherUsers = new IndexableArray({ id: 12, name: "Hans" }, { id: 18, name: "Tanja" }).addIndex("name").addSelfIndex();

Array.isArray(users); // true
users.getIndex("George"); // 1
users.get("George"); // Get first George: { id: 23, name: "George"}
users.get("George", { fromIndex: 1 }); // Get first George starting from index 1: { id: 23, name: "George"}
users.getAllIndexes("George"); // [0, 1]

// Replace George with Henry
const newUser = { id: 21, name: "Henry" };
users[0] = newUser;
users.getIndex(newUser); // 0 - It is possible to index whole object by { selfIndex: true } option.

// Add another Henry
users.splice(1, 1, { id: 34, name: "Henry" });
users.getAllIndexes("Henry"); // [0, 1];

// You may want to disable en re-enable index for heavy updates for performance reasons.
users.disableIndex(); // Disable index before heavy updates.
// ... many many many updates here
users.enableIndex(); // Index is recreated from scratch.

// Do NOT change deeply nested values in indexed fields.
// users[0].name = "DON'T DO THIS";       // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.

// To change nested values use `set()`
users.set(0, "name", "OK"); // Index updated.

// or (not preferred because of expensive index creation for a small update)
users.disableIndex();
users[0].name = "Prefer set()";
users.enableIndex(); // Index is recreated from scratch.
```

# Details

- Written in TypeScript.
- Is a native `Array` (`Array.isArray(indexableArray) === true`), so supports all array features.
- 100% test coverage.
- Tracks all shallow changes via by using `Proxy`
- Limited support for updating deep properties via `set()` method.
- Uses `map` to index for very fast lookups.
- Uses binary search for updates for faster index update.
- Disables and recreates index from scratch automatically for heavy update operations like `splice` if above threshold..
- Indexing may be disabled and re-enabled for heavy update operations manually.
- Uses binary search for `indexOf()`, `lastIndexOf()`, `has()` if user added self index.
- Methods such as `map()`, `filter()`, `slice()` returns `IndexedArray`. Additionally provides `mapIndexed()` method.

# API

<a name="readmemd"></a>

indexable-array

# indexable-array

## Table of contents

### Classes

- [default](#classesdefaultmd)

# Classes

<a name="classesdefaultmd"></a>

[indexable-array](#readmemd) / default

# Class: default<I, DK, OK, TH\>

Extended native array class to access array elements by fast key lookups using binary search. Used for storing objects.

#### Example

```typescript
import IndexableArray, { Self } from "indexable-array";
const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
Array.isArray(users); // true
users.get("George"); // { id: 23, name: "George"}
const user = { id: 21, name: "Henry" };
users[0] = user;
users.getIndex(user); // 0 - It is possible to index whole object by { selfIndex: true } option.
users.splice(1, 1, { id: 34, name: "Henry" });
users.getAllIndexes("Henry"); // [0, 1];

users[0].name = "DON'T DO THIS"; // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
users.set(0, "name", "OK"); // Index updated.
users.disableIndex();
users[0].name = "THIS IS OK NOW";
users.enableIndex(); // Index is recreated from scratch.
```

## Type parameters

| Name | Type      | Default |
| ---- | --------- | ------- |
| `I`  | _any_     | -       |
| `DK` | keyof I   | -       |
| `OK` | keyof I   | -       |
| `TH` | _boolean_ | _false_ |

## Hierarchy

- _Array_<I\>

  ↳ **default**

## Table of contents

### Properties

- [indexedKeys](#indexedkeys)

### Accessors

- [defaultKey](#defaultkey)

### Methods

- [concat](#concat)
- [disableIndex](#disableindex)
- [enableIndex](#enableindex)
- [filter](#filter)
- [flatMap](#flatmap)
- [get](#get)
- [getAll](#getall)
- [getAllIndexes](#getallindexes)
- [getIndex](#getindex)
- [getMaybe](#getmaybe)
- [getSure](#getsure)
- [has](#has)
- [map](#map)
- [mapToArray](#maptoarray)
- [push](#push)
- [set](#set)
- [slice](#slice)
- [sort](#sort)
- [sortBy](#sortby)
- [splice](#splice)
- [withDefaultIndex](#withdefaultindex)
- [from](#from)
- [throwingFrom](#throwingfrom)

## Properties

### indexedKeys

• `Readonly` **indexedKeys**: _Set_<DK | OK\>

Set of the indexed key names. `$$self` is used for the whole value.

#### Example

```typescript
const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addSelfIndex().addIndex("name");
users.indexedArray; // ["$$self", "name"]
```

Defined in: [index.ts:77](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L77)

## Accessors

### defaultKey

• **defaultKey**(): DK

**Returns:** DK

Defined in: [index.ts:200](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L200)

## Methods

### concat

▸ **concat**(...`items`: _ConcatArray_<I\>[]): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

#### Parameters:

| Name       | Type                |
| ---------- | ------------------- |
| `...items` | _ConcatArray_<I\>[] |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Defined in: [index.ts:672](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L672)

▸ **concat**(...`items`: (I | _ConcatArray_<I\>)[]): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

#### Parameters:

| Name       | Type |
| ---------- | ---- | -------------------- |
| `...items` | (I   | _ConcatArray_<I\>)[] |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Defined in: [index.ts:673](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L673)

---

### disableIndex

▸ **disableIndex**(): _void_

Disables indexing of the array. It may be used to disable temporarily

- to do heavy updates for performance reasons,
- to do operations in sub fields.
  If indexing is not needed anymore, it is suggested to create a new native non-extended array and copy values into it
  for avoiding performance penalty of proxy array used in this library.

#### Example

```typescript
indexedArray.disableIndex();
indexedArray[0].name = "THIS IS OK NOW";
indexedArray.enableIndex(); // Index is recreated from scratch.
```

**`see`** {IndexedArray#enableIndex} method.

**Returns:** _void_

Defined in: [index.ts:857](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L857)

---

### enableIndex

▸ **enableIndex**(): _void_

Enables indexing and recreates index from scratch.

**`see`** {IndexedArray#disableIndex} method.

**Returns:** _void_

Defined in: [index.ts:866](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L866)

---

### filter

▸ **filter**<S\>(`callbackfn`: (`value`: I, `index`: _number_, `array`: [_default_](#classesdefaultmd)<I, DK, OK, TH\>) => value is S, `thisArg?`: _any_): [_default_](#classesdefaultmd)<S, DK, OK, TH\>

#### Type parameters:

| Name | Type      |
| ---- | --------- |
| `S`  | _unknown_ |

#### Parameters:

| Name         | Type                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `callbackfn` | (`value`: I, `index`: _number_, `array`: [_default_](#classesdefaultmd)<I, DK, OK, TH\>) => value is S |
| `thisArg?`   | _any_                                                                                                  |

**Returns:** [_default_](#classesdefaultmd)<S, DK, OK, TH\>

Defined in: [index.ts:466](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L466)

▸ **filter**(`callbackfn`: _Callback_<I, DK, OK, TH, _unknown_\>, `thisArg?`: _any_): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

#### Parameters:

| Name         | Type                                  |
| ------------ | ------------------------------------- |
| `callbackfn` | _Callback_<I, DK, OK, TH, _unknown_\> |
| `thisArg?`   | _any_                                 |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Defined in: [index.ts:471](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L471)

---

### flatMap

▸ **flatMap**<U, DK2, OK2, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `defaultKey?`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name   | Type         | Default                        |
| ------ | ------------ | ------------------------------ | ----------- | --- |
| `U`    | _Pick_<I, DK | OK\>                           | -           |
| `DK2`  | _string_     | _number_                       | _symbol_    | DK  |
| `OK2`  | _string_     | _number_                       | _symbol_    | OK  |
| `This` | _undefined_  | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name           | Type                            |
| -------------- | ------------------------------- | -------------------- |
| `callbackFn`   | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `defaultKey?`  | DK2                             |
| `...indexKeys` | OK2[]                           |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:558](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L558)

▸ **flatMap**<U, DK2, OK2, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `thisArg`: This, `defaultKey?`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name   | Type         | Default                        |
| ------ | ------------ | ------------------------------ | ----------- | --- |
| `U`    | _Pick_<I, DK | OK\>                           | -           |
| `DK2`  | _string_     | _number_                       | _symbol_    | DK  |
| `OK2`  | _string_     | _number_                       | _symbol_    | OK  |
| `This` | _undefined_  | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name           | Type                            |
| -------------- | ------------------------------- | -------------------- |
| `callbackFn`   | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `thisArg`      | This                            |
| `defaultKey?`  | DK2                             |
| `...indexKeys` | OK2[]                           |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:569](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L569)

▸ **flatMap**<U, DK2, OK2, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name   | Type                           | Default                        |
| ------ | ------------------------------ | ------------------------------ | ----------- | ------- |
| `U`    | _Record_<_string_, _unknown_\> | -                              |
| `DK2`  | _string_                       | _number_                       | _symbol_    | -       |
| `OK2`  | _string_                       | _number_                       | _symbol_    | _never_ |
| `This` | _undefined_                    | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name           | Type                            |
| -------------- | ------------------------------- | -------------------- |
| `callbackFn`   | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `defaultKey`   | DK2                             |
| `...indexKeys` | OK2[]                           |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:581](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L581)

▸ **flatMap**<U, DK2, OK2, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `thisArg`: This, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name   | Type                           | Default                        |
| ------ | ------------------------------ | ------------------------------ | ----------- | ------- |
| `U`    | _Record_<_string_, _unknown_\> | -                              |
| `DK2`  | _string_                       | _number_                       | _symbol_    | -       |
| `OK2`  | _string_                       | _number_                       | _symbol_    | _never_ |
| `This` | _undefined_                    | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name           | Type                            |
| -------------- | ------------------------------- | -------------------- |
| `callbackFn`   | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `thisArg`      | This                            |
| `defaultKey`   | DK2                             |
| `...indexKeys` | OK2[]                           |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:592](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L592)

▸ **flatMap**<U, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `thisArg?`: This, ...`rest`: _never_[]): [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

#### Type parameters:

| Name   | Type                           | Default                        |
| ------ | ------------------------------ | ------------------------------ | ----------- |
| `U`    | _Record_<_string_, _unknown_\> | -                              |
| `This` | _undefined_                    | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name         | Type                            |
| ------------ | ------------------------------- | -------------------- |
| `callbackFn` | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `thisArg?`   | This                            |
| `...rest`    | _never_[]                       |

**Returns:** [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

Defined in: [index.ts:604](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L604)

▸ **flatMap**<U, This\>(`callbackFn`: _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\>, `thisArg?`: This, ...`rest`: _never_[]): [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

#### Type parameters:

| Name   | Type        | Default                        |
| ------ | ----------- | ------------------------------ | ----------- |
| `U`    | _unknown_   | -                              |
| `This` | _undefined_ | _Record_<_string_, _unknown_\> | _undefined_ |

#### Parameters:

| Name         | Type                            |
| ------------ | ------------------------------- | -------------------- |
| `callbackFn` | _CallbackThis_<I, DK, OK, TH, U | readonly U[], This\> |
| `thisArg?`   | This                            |
| `...rest`    | _never_[]                       |

**Returns:** [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

Defined in: [index.ts:610](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L610)

---

### get

▸ **get**<K, TH2\>(`value`: I[K], `__namedParameters?`: { `fromIndex?`: _undefined_ | _number_ ; `key?`: _undefined_ | K ; `throwUnknown?`: _undefined_ | TH2 }): TH2 _extends_ _true_ ? I : _undefined_ | I

Returns the first item at which a given indexed value can be found in the array. According to construction option or `throwUnknown` option,
returns `undefined` or throws exception if value cannot be found.

#### Type parameters:

| Name  | Type        | Default   |
| ----- | ----------- | --------- | -------- | --- |
| `K`   | _string_    | _number_  | _symbol_ | -   |
| `TH2` | _undefined_ | _boolean_ | TH       |

#### Parameters:

• **value**: I[K]

is indexed value to search for.

• **\_\_namedParameters**: _object_

| Name            | Type        |
| --------------- | ----------- | -------- |
| `fromIndex?`    | _undefined_ | _number_ |
| `key?`          | _undefined_ | K        |
| `throwUnknown?` | _undefined_ | TH2      |

**Returns:** TH2 _extends_ _true_ ? I : _undefined_ | I

the first item with given indexed value in the array; `undefined` if not found.

Defined in: [index.ts:743](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L743)

---

### getAll

▸ **getAll**<K\>(`value`: I[K], `__namedParameters?`: { `key?`: _undefined_ | K }): I[]

Returns all items at which a given indexed value can be found in the array, or empty array if it is not present.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

is indexed value to search for.

• **\_\_namedParameters**: _object_

| Name   | Type        |
| ------ | ----------- | --- |
| `key?` | _undefined_ | K   |

**Returns:** I[]

all items with given indexed value in the array; Empty array if not found.

Defined in: [index.ts:799](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L799)

---

### getAllIndexes

▸ **getAllIndexes**<K\>(`value`: I[K], `__namedParameters?`: { `key?`: _undefined_ | K }): _number_[]

Returns all indexes at which a given indexed value can be found in the array, or empty array if it is not present.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

indexed value to search for.

• **\_\_namedParameters**: _object_

| Name   | Type        |
| ------ | ----------- | --- |
| `key?` | _undefined_ | K   |

**Returns:** _number_[]

all indexes of the element in the array; Empty array if not found.

Defined in: [index.ts:727](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L727)

---

### getIndex

▸ **getIndex**<K\>(`value`: I[K], `__namedParameters?`: { `fromIndex?`: _undefined_ | _number_ ; `key?`: _undefined_ | K }): _number_

Returns the first index at which a given indexed value can be found in the array, or -1 if it is not present.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

indexed value to search for.

• **\_\_namedParameters**: _object_

| Name         | Type        |
| ------------ | ----------- | -------- |
| `fromIndex?` | _undefined_ | _number_ |
| `key?`       | _undefined_ | K        |

**Returns:** _number_

the first index of the element in the array; -1 if not found.

Defined in: [index.ts:704](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L704)

---

### getMaybe

▸ **getMaybe**<K\>(`value`: I[K], `__namedParameters?`: { `fromIndex?`: _undefined_ | _number_ ; `key?`: _undefined_ | K }): _undefined_ | I

Returns the first item at which a given indexed value can be found in the array. Returns `undefined` if value cannot be found.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

is indexed value to search for.

• **\_\_namedParameters**: _object_

| Name         | Type        |
| ------------ | ----------- | -------- |
| `fromIndex?` | _undefined_ | _number_ |
| `key?`       | _undefined_ | K        |

**Returns:** _undefined_ | I

is the first item with given indexed value in the array; `undefined` if not found.

Defined in: [index.ts:784](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L784)

---

### getSure

▸ **getSure**<K\>(`value`: I[K], `__namedParameters?`: { `fromIndex?`: _undefined_ | _number_ ; `key?`: _undefined_ | K }): I

Returns the first item at which a given indexed value can be found in the array, or throws exception if it is not present.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

is indexed value to search for.

• **\_\_namedParameters**: _object_

| Name         | Type        |
| ------------ | ----------- | -------- |
| `fromIndex?` | _undefined_ | _number_ |
| `key?`       | _undefined_ | K        |

**Returns:** I

the first item with given indexed value in the array; `undefined` if not found.

Defined in: [index.ts:771](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L771)

---

### has

▸ **has**<K\>(`value`: I[K], `__namedParameters?`: { `fromIndex?`: _undefined_ | _number_ ; `key?`: _undefined_ | K }): _boolean_

Determines whether an array includes a certain indexed value among its entries' keys, returning true or false as appropriate.

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

• **value**: I[K]

is indexed value to search for.

• **\_\_namedParameters**: _object_

| Name         | Type        |
| ------------ | ----------- | -------- |
| `fromIndex?` | _undefined_ | _number_ |
| `key?`       | _undefined_ | K        |

**Returns:** _boolean_

true if indexed value is found among array's entries' keys.

Defined in: [index.ts:814](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L814)

---

### map

▸ **map**<U, DK2, OK2\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `defaultKey?`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name  | Type         | Default  |
| ----- | ------------ | -------- | -------- | --- |
| `U`   | _Pick_<I, DK | OK\>     | -        |
| `DK2` | _string_     | _number_ | _symbol_ | DK  |
| `OK2` | _string_     | _number_ | _symbol_ | OK  |

#### Parameters:

| Name           | Type                          |
| -------------- | ----------------------------- |
| `callbackFn`   | _Callback_<I, DK, OK, TH, U\> |
| `defaultKey?`  | DK2                           |
| `...indexKeys` | OK2[]                         |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:481](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L481)

▸ **map**<U, DK2, OK2\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `thisArg`: _Record_<_string_, _unknown_\>, `defaultKey?`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name  | Type         | Default  |
| ----- | ------------ | -------- | -------- | --- |
| `U`   | _Pick_<I, DK | OK\>     | -        |
| `DK2` | _string_     | _number_ | _symbol_ | DK  |
| `OK2` | _string_     | _number_ | _symbol_ | OK  |

#### Parameters:

| Name           | Type                           |
| -------------- | ------------------------------ |
| `callbackFn`   | _Callback_<I, DK, OK, TH, U\>  |
| `thisArg`      | _Record_<_string_, _unknown_\> |
| `defaultKey?`  | DK2                            |
| `...indexKeys` | OK2[]                          |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:487](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L487)

▸ **map**<U, DK2, OK2\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name  | Type                           | Default  |
| ----- | ------------------------------ | -------- | -------- | ------- |
| `U`   | _Record_<_string_, _unknown_\> | -        |
| `DK2` | _string_                       | _number_ | _symbol_ | -       |
| `OK2` | _string_                       | _number_ | _symbol_ | _never_ |

#### Parameters:

| Name           | Type                          |
| -------------- | ----------------------------- |
| `callbackFn`   | _Callback_<I, DK, OK, TH, U\> |
| `defaultKey`   | DK2                           |
| `...indexKeys` | OK2[]                         |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:494](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L494)

▸ **map**<U, DK2, OK2\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `thisArg`: _Record_<_string_, _unknown_\>, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

#### Type parameters:

| Name  | Type                           | Default  |
| ----- | ------------------------------ | -------- | -------- | ------- |
| `U`   | _Record_<_string_, _unknown_\> | -        |
| `DK2` | _string_                       | _number_ | _symbol_ | -       |
| `OK2` | _string_                       | _number_ | _symbol_ | _never_ |

#### Parameters:

| Name           | Type                           |
| -------------- | ------------------------------ |
| `callbackFn`   | _Callback_<I, DK, OK, TH, U\>  |
| `thisArg`      | _Record_<_string_, _unknown_\> |
| `defaultKey`   | DK2                            |
| `...indexKeys` | OK2[]                          |

**Returns:** [_default_](#classesdefaultmd)<U, DK2, _Exclude_<OK2, DK2\>, TH\>

Defined in: [index.ts:500](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L500)

▸ **map**<U\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `thisArg?`: _Record_<_string_, _unknown_\>): [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

#### Type parameters:

| Name | Type                           |
| ---- | ------------------------------ |
| `U`  | _Record_<_string_, _unknown_\> |

#### Parameters:

| Name         | Type                           |
| ------------ | ------------------------------ |
| `callbackFn` | _Callback_<I, DK, OK, TH, U\>  |
| `thisArg?`   | _Record_<_string_, _unknown_\> |

**Returns:** [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

Defined in: [index.ts:507](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L507)

▸ **map**<U\>(`callbackFn`: _Callback_<I, DK, OK, TH, U\>, `thisArg?`: _Record_<_string_, _unknown_\>): [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

#### Type parameters:

| Name | Type      |
| ---- | --------- |
| `U`  | _unknown_ |

#### Parameters:

| Name         | Type                           |
| ------------ | ------------------------------ |
| `callbackFn` | _Callback_<I, DK, OK, TH, U\>  |
| `thisArg?`   | _Record_<_string_, _unknown_\> |

**Returns:** [_default_](#classesdefaultmd)<U, _AvailableDefaultIndex_<U, DK, OK\>, _Exclude_<_Extract_<OK, keyof U\>, _AvailableDefaultIndex_<U, DK, OK\>\>, TH\>

Defined in: [index.ts:512](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L512)

---

### mapToArray

▸ **mapToArray**<U\>(`callbackfn`: _Callback_<I, DK, OK, TH, U | readonly U[]\>, `thisArg?`: _any_): U[]

Creates a new base Array (not IndexableArray) with the results of calling a provided function on every element in the calling array.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const baseArray = usersWithName.mapToArray((user) => ({ id: user.id, nick: name.substring(0, 2) })); // Normal base array.
```

**`see`** {@link IndexableArray#map} to get an `IndexableArray`.

#### Type parameters:

| Name |
| ---- |
| `U`  |

#### Parameters:

| Name         | Type                        | Description                                      |
| ------------ | --------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `callbackfn` | _Callback_<I, DK, OK, TH, U | readonly U[]\>                                   | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `thisArg?`   | _any_                       | is value to use as this when executing callback. |

**Returns:** U[]

a new `Array` with each element being the result of the callback function.

Defined in: [index.ts:664](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L664)

---

### push

▸ **push**(...`items`: I[]): _number_

#### Parameters:

| Name       | Type |
| ---------- | ---- |
| `...items` | I[]  |

**Returns:** _number_

Defined in: [index.ts:422](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L422)

---

### set

▸ **set**(`position`: _number_, `path`: _string_, `value`: _any_): _void_

Sets value at path of the object, which is one of the entires of array. To update fields of the objects, this method should be used. Otherwise
index cannot be updated, because sub fileds are not tracked for chage detection.

#### Example

```typescript
indexedArray[0].name = "DON'T DO THIS"; // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
indexedArray.set(0, "name", "OK"); // Index updated.
```

#### Parameters:

| Name       | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `position` | _number_ | is index of the item to be changed.          |
| `path`     | _string_ | is item's path where value to be changed at. |
| `value`    | _any_    | is new value to be assigned.                 |

**Returns:** _void_

Defined in: [index.ts:831](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L831)

---

### slice

▸ **slice**(`start?`: _number_, `end?`: _number_): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

#### Parameters:

| Name     | Type     |
| -------- | -------- |
| `start?` | _number_ |
| `end?`   | _number_ |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Defined in: [index.ts:668](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L668)

---

### sort

▸ **sort**(`compareFn?`: (`a`: I, `b`: I) => _number_): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

#### Parameters:

| Name         | Type                         |
| ------------ | ---------------------------- |
| `compareFn?` | (`a`: I, `b`: I) => _number_ |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Defined in: [index.ts:441](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L441)

---

### sortBy

▸ **sortBy**(`key?`: DK | OK): [_default_](#classesdefaultmd)<I, DK, OK, TH\>

Sorts the elements of an array by given key in place and returns the sorted array.

#### Parameters:

| Name  | Type | Default value | Description |
| ----- | ---- | ------------- | ----------- | ---------------------------- |
| `key` | DK   | OK            | ...         | is the key to sort array by. |

**Returns:** [_default_](#classesdefaultmd)<I, DK, OK, TH\>

this instance.

Defined in: [index.ts:454](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L454)

---

### splice

▸ **splice**(`start`: _number_, `deleteCount?`: _number_, ...`items`: I[]): I[]

#### Parameters:

| Name          | Type     | Default value |
| ------------- | -------- | ------------- |
| `start`       | _number_ | -             |
| `deleteCount` | _number_ | ...           |
| `...items`    | I[]      | -             |

**Returns:** I[]

Defined in: [index.ts:429](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L429)

---

### withDefaultIndex

▸ **withDefaultIndex**<K\>(`key`: K): [_default_](#classesdefaultmd)<I, K, OK, TH\>

Sets default index key to be used with lookup functions. Returns same instance.

#### Example

```typescript
const input = [
  { id: 23, name: "Geroge" },
  { id: 96, name: "Lisa" },
];
let users = new IndexableArray(...input).addIndex("name", "id"); // "name" is default index
users = users.withDefaultIndex("id"); // "id" is default index. Assignment is used for TypeScript to assign right type to variable.
```

#### Type parameters:

| Name | Type     |
| ---- | -------- | -------- | -------- |
| `K`  | _string_ | _number_ | _symbol_ |

#### Parameters:

| Name  | Type | Description                                               |
| ----- | ---- | --------------------------------------------------------- |
| `key` | K    | is key to be used as default index with lookup functions. |

**Returns:** [_default_](#classesdefaultmd)<I, K, OK, TH\>

this object.

Defined in: [index.ts:690](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L690)

---

### from

▸ `Static`**from**<I2, DK2, DK3, OK2, OK3, TH2\>(`indexableArray`: [_default_](#classesdefaultmd)<I2, DK2, OK2, TH2\>, `defaultKey?`: DK3, ...`indexKeys`: OK3[]): [_default_](#classesdefaultmd)<I2, DK3, _Exclude_<OK3, DK3\>, TH2\>

#### Type parameters:

| Name  | Type      | Default  |
| ----- | --------- | -------- | -------- | ------- |
| `I2`  | _unknown_ | -        |
| `DK2` | _string_  | _number_ | _symbol_ | -       |
| `DK3` | _string_  | _number_ | _symbol_ | DK2     |
| `OK2` | _string_  | _number_ | _symbol_ | _never_ |
| `OK3` | _string_  | _number_ | _symbol_ | OK2     |
| `TH2` | _boolean_ | _false_  |

#### Parameters:

| Name             | Type                                               |
| ---------------- | -------------------------------------------------- |
| `indexableArray` | [_default_](#classesdefaultmd)<I2, DK2, OK2, TH2\> |
| `defaultKey?`    | DK3                                                |
| `...indexKeys`   | OK3[]                                              |

**Returns:** [_default_](#classesdefaultmd)<I2, DK3, _Exclude_<OK3, DK3\>, TH2\>

Defined in: [index.ts:95](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L95)

▸ `Static`**from**<I2, DK2, OK2\>(`arrayLike`: _Iterable_<I2\> | _ArrayLike_<I2\>, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<I2, DK2, _Exclude_<OK2, DK2\>, _false_\>

#### Type parameters:

| Name  | Type     | Default  |
| ----- | -------- | -------- | -------- | ------- |
| `I2`  | -        | -        |
| `DK2` | _string_ | _number_ | _symbol_ | -       |
| `OK2` | _string_ | _number_ | _symbol_ | _never_ |

#### Parameters:

| Name           | Type            |
| -------------- | --------------- | ---------------- |
| `arrayLike`    | _Iterable_<I2\> | _ArrayLike_<I2\> |
| `defaultKey`   | DK2             |
| `...indexKeys` | OK2[]           |

**Returns:** [_default_](#classesdefaultmd)<I2, DK2, _Exclude_<OK2, DK2\>, _false_\>

Defined in: [index.ts:108](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L108)

---

### throwingFrom

▸ `Static`**throwingFrom**<I2, DK2, DK3, OK2, OK3, TH2\>(`indexableArray`: [_default_](#classesdefaultmd)<I2, DK2, OK2, TH2\>, `defaultKey?`: DK3, ...`indexKeys`: OK3[]): [_default_](#classesdefaultmd)<I2, DK3, _Exclude_<OK3, DK3\>, _true_\>

#### Type parameters:

| Name  | Type      | Default  |
| ----- | --------- | -------- | -------- | ------- |
| `I2`  | _unknown_ | -        |
| `DK2` | _string_  | _number_ | _symbol_ | -       |
| `DK3` | _string_  | _number_ | _symbol_ | DK2     |
| `OK2` | _string_  | _number_ | _symbol_ | _never_ |
| `OK3` | _string_  | _number_ | _symbol_ | OK2     |
| `TH2` | _boolean_ | _false_  |

#### Parameters:

| Name             | Type                                               |
| ---------------- | -------------------------------------------------- |
| `indexableArray` | [_default_](#classesdefaultmd)<I2, DK2, OK2, TH2\> |
| `defaultKey?`    | DK3                                                |
| `...indexKeys`   | OK3[]                                              |

**Returns:** [_default_](#classesdefaultmd)<I2, DK3, _Exclude_<OK3, DK3\>, _true_\>

Defined in: [index.ts:154](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L154)

▸ `Static`**throwingFrom**<I2, DK2, OK2\>(`arrayLike`: _Iterable_<I2\> | _ArrayLike_<I2\>, `defaultKey`: DK2, ...`indexKeys`: OK2[]): [_default_](#classesdefaultmd)<I2, DK2, _Exclude_<OK2, DK2\>, _true_\>

#### Type parameters:

| Name  | Type     | Default  |
| ----- | -------- | -------- | -------- | ------- |
| `I2`  | -        | -        |
| `DK2` | _string_ | _number_ | _symbol_ | -       |
| `OK2` | _string_ | _number_ | _symbol_ | _never_ |

#### Parameters:

| Name           | Type            |
| -------------- | --------------- | ---------------- |
| `arrayLike`    | _Iterable_<I2\> | _ArrayLike_<I2\> |
| `defaultKey`   | DK2             |
| `...indexKeys` | OK2[]           |

**Returns:** [_default_](#classesdefaultmd)<I2, DK2, _Exclude_<OK2, DK2\>, _true_\>

Defined in: [index.ts:167](https://github.com/ozum/indexable-array/blob/7694902/src/index.ts#L167)
