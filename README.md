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
- [Classes](#classes)
- [Class: IndexableArray <**I, DK, OK, TH**>](#class-indexablearray-i-dk-ok-th)
  - [Type parameters](#type-parameters)
  - [Hierarchy](#hierarchy)
  - [Indexable](#indexable)
  - [Properties](#properties)
    - [indexedKeys](#indexedkeys)
    - [length](#length)
    - [`Static` Array](#static-array)
  - [Methods](#methods)
    - [\_\_@iterator](#__iterator)
    - [\_\_@unscopables](#__unscopables)
    - [concat](#concat)
    - [copyWithin](#copywithin)
    - [disableIndex](#disableindex)
    - [enableIndex](#enableindex)
    - [entries](#entries)
    - [every](#every)
    - [fill](#fill)
    - [filter](#filter)
    - [find](#find)
    - [findIndex](#findindex)
    - [flat](#flat)
    - [flatMap](#flatmap)
    - [forEach](#foreach)
    - [get](#get)
    - [getAll](#getall)
    - [getAllIndexes](#getallindexes)
    - [getIndex](#getindex)
    - [getMaybe](#getmaybe)
    - [getSure](#getsure)
    - [has](#has)
    - [includes](#includes)
    - [indexOf](#indexof)
    - [join](#join)
    - [keys](#keys)
    - [lastIndexOf](#lastindexof)
    - [map](#map)
    - [mapToArray](#maptoarray)
    - [pop](#pop)
    - [push](#push)
    - [reduce](#reduce)
    - [reduceRight](#reduceright)
    - [reverse](#reverse)
    - [set](#set)
    - [shift](#shift)
    - [slice](#slice)
    - [some](#some)
    - [sort](#sort)
    - [sortBy](#sortby)
    - [splice](#splice)
    - [toLocaleString](#tolocalestring)
    - [toString](#tostring)
    - [unshift](#unshift)
    - [values](#values)
    - [withDefaultIndex](#withdefaultindex)
    - [`Static` from](#static-from)
    - [`Static` throwingFrom](#static-throwingfrom)

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

[indexable-array](#readmemd)

# indexable-array

# Classes

<a name="classesindexablearraymd"></a>

[indexable-array](#readmemd) › [IndexableArray](#classesindexablearraymd)

# Class: IndexableArray <**I, DK, OK, TH**>

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

▪ **I**: _any_

▪ **DK**: _keyof I_

▪ **OK**: _keyof I_

▪ **TH**: _boolean_

## Hierarchy

- Array‹I›

  ↳ **IndexableArray**

## Indexable

- \[ **n**: _number_\]: I

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

## Properties

### indexedKeys

• **indexedKeys**: _Set‹DK | OK›_ = new Set()

_Defined in [src/index.ts:82](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L82)_

Set of the indexed key names. `$$self` is used for the whole value.

#### Example

```typescript
const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addSelfIndex().addIndex("name");
users.indexedArray; // ["$$self", "name"]
```

---

### length

• **length**: _number_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1215

Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.

---

### `Static` Array

▪ **Array**: _ArrayConstructor_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1385

## Methods

### \_\_@iterator

▸ **\_\_@iterator**(): _IterableIterator‹I›_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.iterable.d.ts:60

Iterator

**Returns:** _IterableIterator‹I›_

---

### \_\_@unscopables

▸ **\_\_@unscopables**(): _object_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:94

Returns an object whose properties have the value 'true'
when they will be absent when used in a 'with' statement.

**Returns:** _object_

---

### concat

▸ **concat**(...`items`: ConcatArray‹I›[]): _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

_Overrides void_

_Defined in [src/index.ts:651](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L651)_

**Parameters:**

| Name       | Type             |
| ---------- | ---------------- |
| `...items` | ConcatArray‹I›[] |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

▸ **concat**(...`items`: I | ConcatArray‹I›[]): _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

_Overrides void_

_Defined in [src/index.ts:652](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L652)_

**Parameters:**

| Name       | Type                      |
| ---------- | ------------------------- |
| `...items` | I &#124; ConcatArray‹I›[] |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

---

### copyWithin

▸ **copyWithin**(`target`: number, `start`: number, `end?`: undefined | number): _this_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.core.d.ts:64

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

**Parameters:**

| Name     | Type                    | Description                                                                                           |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `target` | number                  | If target is negative, it is treated as length+target where length is the length of the array.        |
| `start`  | number                  | If start is negative, it is treated as length+start. If end is negative, it is treated as length+end. |
| `end?`   | undefined &#124; number | If not specified, length of the this object is used as its default value.                             |

**Returns:** _this_

---

### disableIndex

▸ **disableIndex**(): _void_

_Defined in [src/index.ts:836](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L836)_

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

---

### enableIndex

▸ **enableIndex**(): _void_

_Defined in [src/index.ts:845](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L845)_

Enables indexing and recreates index from scratch.

**`see`** {IndexedArray#disableIndex} method.

**Returns:** _void_

---

### entries

▸ **entries**(): _IterableIterator‹[number, I]›_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.iterable.d.ts:65

Returns an iterable of key, value pairs for every entry in the array

**Returns:** _IterableIterator‹[number, I]›_

---

### every

▸ **every**(`callbackfn`: function, `thisArg?`: any): _boolean_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1310

Determines whether all the members of an array satisfy the specified test.

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to three arguments. The every method calls
the callbackfn function for each element in the array until the callbackfn returns a value
which is coercible to the Boolean value false, or until the end of the array.

▸ (`value`: I, `index`: number, `array`: I[]): _unknown_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `value` | I      |
| `index` | number |
| `array` | I[]    |

▪`Optional` **thisArg**: _any_

An object to which the this keyword can refer in the callbackfn function.
If thisArg is omitted, undefined is used as the this value.

**Returns:** _boolean_

---

### fill

▸ **fill**(`value`: I, `start?`: undefined | number, `end?`: undefined | number): _this_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.core.d.ts:53

Returns the this object after filling the section identified by start and end with value

**Parameters:**

| Name     | Type                    | Description                                                                                                                       |
| -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `value`  | I                       | value to fill array section with                                                                                                  |
| `start?` | undefined &#124; number | index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array. |
| `end?`   | undefined &#124; number | index to stop filling the array at. If end is negative, it is treated as length+end.                                              |

**Returns:** _this_

---

### filter

▸ **filter**<**S**>(`callbackfn`: function, `thisArg?`: any): _[IndexableArray](#classesindexablearraymd)‹S, DK, OK, TH›_

_Overrides void_

_Defined in [src/index.ts:471](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L471)_

**Type parameters:**

▪ **S**: _I_

**Parameters:**

▪ **callbackfn**: _function_

▸ (`value`: I, `index`: number, `array`: [IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›): _value is S_

**Parameters:**

| Name    | Type                                                      |
| ------- | --------------------------------------------------------- |
| `value` | I                                                         |
| `index` | number                                                    |
| `array` | [IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH› |

▪`Optional` **thisArg**: _any_

**Returns:** _[IndexableArray](#classesindexablearraymd)‹S, DK, OK, TH›_

▸ **filter**(`callbackfn`: Callback‹I, DK, OK, TH, unknown›, `thisArg?`: any): _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

_Overrides void_

_Defined in [src/index.ts:476](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L476)_

**Parameters:**

| Name         | Type                             |
| ------------ | -------------------------------- |
| `callbackfn` | Callback‹I, DK, OK, TH, unknown› |
| `thisArg?`   | any                              |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

---

### find

▸ **find**<**S**>(`predicate`: function, `thisArg?`: any): _S | undefined_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.core.d.ts:31

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

**Type parameters:**

▪ **S**: _I_

**Parameters:**

▪ **predicate**: _function_

find calls predicate once for each element of the array, in ascending
order, until it finds one where predicate returns true. If such an element is found, find
immediately returns that element value. Otherwise, find returns undefined.

▸ (`this`: void, `value`: I, `index`: number, `obj`: I[]): _value is S_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `this`  | void   |
| `value` | I      |
| `index` | number |
| `obj`   | I[]    |

▪`Optional` **thisArg**: _any_

If provided, it will be used as the this value for each invocation of
predicate. If it is not provided, undefined is used instead.

**Returns:** _S | undefined_

▸ **find**(`predicate`: function, `thisArg?`: any): _I | undefined_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.core.d.ts:32

**Parameters:**

▪ **predicate**: _function_

▸ (`value`: I, `index`: number, `obj`: I[]): _unknown_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `value` | I      |
| `index` | number |
| `obj`   | I[]    |

▪`Optional` **thisArg**: _any_

**Returns:** _I | undefined_

---

### findIndex

▸ **findIndex**(`predicate`: function, `thisArg?`: any): _number_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.core.d.ts:43

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

**Parameters:**

▪ **predicate**: _function_

find calls predicate once for each element of the array, in ascending
order, until it finds one where predicate returns true. If such an element is found,
findIndex immediately returns that element index. Otherwise, findIndex returns -1.

▸ (`value`: I, `index`: number, `obj`: I[]): _unknown_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `value` | I      |
| `index` | number |
| `obj`   | I[]    |

▪`Optional` **thisArg**: _any_

If provided, it will be used as the this value for each invocation of
predicate. If it is not provided, undefined is used instead.

**Returns:** _number_

---

### flat

▸ **flat**<**U**>(`this`: U[][][][][][][][], `depth`: 7): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:158

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type              | Description                 |
| ------- | ----------------- | --------------------------- |
| `this`  | U[][][][][][][][] | -                           |
| `depth` | 7                 | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][][][][][][], `depth`: 6): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:166

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type            | Description                 |
| ------- | --------------- | --------------------------- |
| `this`  | U[][][][][][][] | -                           |
| `depth` | 6               | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][][][][][], `depth`: 5): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:174

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type          | Description                 |
| ------- | ------------- | --------------------------- |
| `this`  | U[][][][][][] | -                           |
| `depth` | 5             | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][][][][], `depth`: 4): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:182

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type        | Description                 |
| ------- | ----------- | --------------------------- |
| `this`  | U[][][][][] | -                           |
| `depth` | 4           | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][][][], `depth`: 3): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:190

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type      | Description                 |
| ------- | --------- | --------------------------- |
| `this`  | U[][][][] | -                           |
| `depth` | 3         | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][][], `depth`: 2): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:198

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type    | Description                 |
| ------- | ------- | --------------------------- |
| `this`  | U[][][] | -                           |
| `depth` | 2       | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[][], `depth?`: undefined | 1): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:206

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name     | Type               | Description                 |
| -------- | ------------------ | --------------------------- |
| `this`   | U[][]              | -                           |
| `depth?` | undefined &#124; 1 | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`this`: U[], `depth`: 0): _U[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:214

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

**Type parameters:**

▪ **U**

**Parameters:**

| Name    | Type | Description                 |
| ------- | ---- | --------------------------- |
| `this`  | U[]  | -                           |
| `depth` | 0    | The maximum recursion depth |

**Returns:** _U[]_

▸ **flat**<**U**>(`depth?`: undefined | number): _any[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2019.array.d.ts:222

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth. If no depth is provided, flat method defaults to the depth of 1.

**Type parameters:**

▪ **U**

**Parameters:**

| Name     | Type                    | Description                 |
| -------- | ----------------------- | --------------------------- |
| `depth?` | undefined &#124; number | The maximum recursion depth |

**Returns:** _any[]_

---

### flatMap

▸ **flatMap**<**U**, **DK2**, **OK2**, **This**>(`callbackFn`: CallbackThis‹I, DK, OK, TH, U | keyof U[], This›, `defaultKey?`: [DK2](undefined), ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:558](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L558)_

Calls a defined callback function on each element of an indexable array. Then, flattens the result into
a new indexable array.
This is identical to a map followed by flat with depth 1.

**Type parameters:**

▪ **U**: _Pick‹I, DK | OK›_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

▪ **This**: _undefined | object_

**Parameters:**

| Name           | Type                                                  | Description                                                                                                                              |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | CallbackThis‹I, DK, OK, TH, U &#124; keyof U[], This› | is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `defaultKey?`  | [DK2](undefined)                                      | -                                                                                                                                        |
| `...indexKeys` | OK2[]                                                 | -                                                                                                                                        |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` of dept 1.

▸ **flatMap**<**U**, **DK2**, **OK2**, **This**>(`callbackFn`: CallbackThis‹I, DK, OK, TH, U | keyof U[], This›, `thisArg`: object, `defaultKey?`: [DK2](undefined), ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:569](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L569)_

Calls a defined callback function on each element of an indexable array. Then, flattens the result into
a new indexable array.
This is identical to a map followed by flat with depth 1.

**Type parameters:**

▪ **U**: _Pick‹I, DK | OK›_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

▪ **This**: _undefined | object_

**Parameters:**

| Name           | Type                                                  | Description                                                                                                                              |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | CallbackThis‹I, DK, OK, TH, U &#124; keyof U[], This› | is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `thisArg`      | object                                                | -                                                                                                                                        |
| `defaultKey?`  | [DK2](undefined)                                      | -                                                                                                                                        |
| `...indexKeys` | OK2[]                                                 | -                                                                                                                                        |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` of dept 1.

▸ **flatMap**<**U**, **DK2**, **OK2**, **This**>(`callbackFn`: CallbackThis‹I, DK, OK, TH, U | keyof U[], This›, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:581](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L581)_

Calls a defined callback function on each element of an indexable array. Then, flattens the result into
a new indexable array.
This is identical to a map followed by flat with depth 1.

**Type parameters:**

▪ **U**: _any_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

▪ **This**: _undefined | object_

**Parameters:**

| Name           | Type                                                  | Description                                                                                                                              |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | CallbackThis‹I, DK, OK, TH, U &#124; keyof U[], This› | is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `defaultKey`   | DK2                                                   | -                                                                                                                                        |
| `...indexKeys` | OK2[]                                                 | -                                                                                                                                        |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` of dept 1.

▸ **flatMap**<**U**, **DK2**, **OK2**, **This**>(`callbackFn`: CallbackThis‹I, DK, OK, TH, U | keyof U[], This›, `thisArg`: object, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:587](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L587)_

Calls a defined callback function on each element of an indexable array. Then, flattens the result into
a new indexable array.
This is identical to a map followed by flat with depth 1.

**Type parameters:**

▪ **U**: _any_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

▪ **This**: _undefined | object_

**Parameters:**

| Name           | Type                                                  | Description                                                                                                                              |
| -------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | CallbackThis‹I, DK, OK, TH, U &#124; keyof U[], This› | is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `thisArg`      | object                                                | -                                                                                                                                        |
| `defaultKey`   | DK2                                                   | -                                                                                                                                        |
| `...indexKeys` | OK2[]                                                 | -                                                                                                                                        |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` of dept 1.

▸ **flatMap**<**U**, **This**>(`callbackFn`: CallbackThis‹I, DK, OK, TH, U | keyof U[], This›, `thisArg?`: [This](undefined), ...`rest`: never[]): _[IndexableArray](#classesindexablearraymd)‹U, AvailableDefaultIndex‹U, DK, OK›, AvailableIndex‹U, DK, OK›, TH›_

_Overrides void_

_Defined in [src/index.ts:594](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L594)_

Calls a defined callback function on each element of an indexable array. Then, flattens the result into
a new indexable array.
This is identical to a map followed by flat with depth 1.

**Type parameters:**

▪ **U**: _any_

▪ **This**: _undefined | object_

**Parameters:**

| Name         | Type                                                  | Description                                                                                                                              |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callbackFn` | CallbackThis‹I, DK, OK, TH, U &#124; keyof U[], This› | is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array. |
| `thisArg?`   | [This](undefined)                                     | -                                                                                                                                        |
| `...rest`    | never[]                                               | -                                                                                                                                        |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, AvailableDefaultIndex‹U, DK, OK›, AvailableIndex‹U, DK, OK›, TH›_

a new `IndexableArray` of dept 1.

---

### forEach

▸ **forEach**(`callbackfn`: function, `thisArg?`: any): _void_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1325

Performs the specified action for each element in an array.

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.

▸ (`value`: I, `index`: number, `array`: I[]): _void_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `value` | I      |
| `index` | number |
| `array` | I[]    |

▪`Optional` **thisArg**: _any_

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** _void_

---

### get

▸ **get**<**K**, **TH2**>(`value`: I[K], `__namedParameters`: object): _TH2 extends true ? I : I | undefined_

_Defined in [src/index.ts:722](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L722)_

Returns the first item at which a given indexed value can be found in the array. According to construction option or `throwUnknown` option,
returns `undefined` or throws exception if value cannot be found.

**Type parameters:**

▪ **K**: _DK | OK_

▪ **TH2**: _boolean | undefined_

**Parameters:**

| Name                | Type   | Default | Description                     |
| ------------------- | ------ | ------- | ------------------------------- |
| `value`             | I[K]   | -       | is indexed value to search for. |
| `__namedParameters` | object | {}      | -                               |

**Returns:** _TH2 extends true ? I : I | undefined_

the first item with given indexed value in the array; `undefined` if not found.

---

### getAll

▸ **getAll**<**K**>(`value`: I[K], `__namedParameters`: object): _I[]_

_Defined in [src/index.ts:778](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L778)_

Returns all items at which a given indexed value can be found in the array, or empty array if it is not present.

**Type parameters:**

▪ **K**: _DK | OK_

**Parameters:**

| Name                | Type   | Default | Description                     |
| ------------------- | ------ | ------- | ------------------------------- |
| `value`             | I[K]   | -       | is indexed value to search for. |
| `__namedParameters` | object | {}      | -                               |

**Returns:** _I[]_

all items with given indexed value in the array; Empty array if not found.

---

### getAllIndexes

▸ **getAllIndexes**<**K**>(`value`: I[K], `__namedParameters`: object): _number[]_

_Defined in [src/index.ts:706](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L706)_

Returns all indexes at which a given indexed value can be found in the array, or empty array if it is not present.

**Type parameters:**

▪ **K**: _OK | DK_

**Parameters:**

| Name                | Type   | Default | Description                  |
| ------------------- | ------ | ------- | ---------------------------- |
| `value`             | I[K]   | -       | indexed value to search for. |
| `__namedParameters` | object | {}      | -                            |

**Returns:** _number[]_

all indexes of the element in the array; Empty array if not found.

---

### getIndex

▸ **getIndex**<**K**>(`value`: I[K], `__namedParameters`: object): _number_

_Defined in [src/index.ts:683](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L683)_

Returns the first index at which a given indexed value can be found in the array, or -1 if it is not present.

**Type parameters:**

▪ **K**: _DK | OK_

**Parameters:**

| Name                | Type   | Default | Description                  |
| ------------------- | ------ | ------- | ---------------------------- |
| `value`             | I[K]   | -       | indexed value to search for. |
| `__namedParameters` | object | {}      | -                            |

**Returns:** _number_

the first index of the element in the array; -1 if not found.

---

### getMaybe

▸ **getMaybe**<**K**>(`value`: I[K], `__namedParameters`: object): _I | undefined_

_Defined in [src/index.ts:763](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L763)_

Returns the first item at which a given indexed value can be found in the array. Returns `undefined` if value cannot be found.

**Type parameters:**

▪ **K**: _DK | OK_

**Parameters:**

| Name                | Type   | Default | Description                     |
| ------------------- | ------ | ------- | ------------------------------- |
| `value`             | I[K]   | -       | is indexed value to search for. |
| `__namedParameters` | object | {}      | -                               |

**Returns:** _I | undefined_

is the first item with given indexed value in the array; `undefined` if not found.

---

### getSure

▸ **getSure**<**K**>(`value`: I[K], `__namedParameters`: object): _I_

_Defined in [src/index.ts:750](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L750)_

Returns the first item at which a given indexed value can be found in the array, or throws exception if it is not present.

**Type parameters:**

▪ **K**: _DK | OK_

**Parameters:**

| Name                | Type   | Default | Description                     |
| ------------------- | ------ | ------- | ------------------------------- |
| `value`             | I[K]   | -       | is indexed value to search for. |
| `__namedParameters` | object | {}      | -                               |

**Returns:** _I_

the first item with given indexed value in the array; `undefined` if not found.

---

### has

▸ **has**<**K**>(`value`: I[K], `__namedParameters`: object): _boolean_

_Defined in [src/index.ts:793](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L793)_

Determines whether an array includes a certain indexed value among its entries' keys, returning true or false as appropriate.

**Type parameters:**

▪ **K**: _DK | OK_

**Parameters:**

| Name                | Type   | Default | Description                     |
| ------------------- | ------ | ------- | ------------------------------- |
| `value`             | I[K]   | -       | is indexed value to search for. |
| `__namedParameters` | object | {}      | -                               |

**Returns:** _boolean_

true if indexed value is found among array's entries' keys.

---

### includes

▸ **includes**(`searchElement`: I, `fromIndex?`: undefined | number): _boolean_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2016.array.include.d.ts:27

Determines whether an array includes a certain element, returning true or false as appropriate.

**Parameters:**

| Name            | Type                    | Description                                                               |
| --------------- | ----------------------- | ------------------------------------------------------------------------- |
| `searchElement` | I                       | The element to search for.                                                |
| `fromIndex?`    | undefined &#124; number | The position in this array at which to begin searching for searchElement. |

**Returns:** _boolean_

---

### indexOf

▸ **indexOf**(`searchElement`: I, `fromIndex?`: undefined | number): _number_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1295

Returns the index of the first occurrence of a value in an array.

**Parameters:**

| Name            | Type                    | Description                                                                                          |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `searchElement` | I                       | The value to locate in the array.                                                                    |
| `fromIndex?`    | undefined &#124; number | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

**Returns:** _number_

---

### join

▸ **join**(`separator?`: undefined | string): _string_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1247

Adds all the elements of an array separated by the specified separator string.

**Parameters:**

| Name         | Type                    | Description                                                                                                                                         |
| ------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `separator?` | undefined &#124; string | A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma. |

**Returns:** _string_

---

### keys

▸ **keys**(): _IterableIterator‹number›_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.iterable.d.ts:70

Returns an iterable of keys in the array

**Returns:** _IterableIterator‹number›_

---

### lastIndexOf

▸ **lastIndexOf**(`searchElement`: I, `fromIndex?`: undefined | number): _number_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1301

Returns the index of the last occurrence of a specified value in an array.

**Parameters:**

| Name            | Type                    | Description                                                                                                              |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `searchElement` | I                       | The value to locate in the array.                                                                                        |
| `fromIndex?`    | undefined &#124; number | The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array. |

**Returns:** _number_

---

### map

▸ **map**<**U**, **DK2**, **OK2**>(`callbackFn`: Callback‹I, DK, OK, TH, U›, `defaultKey?`: [DK2](undefined), ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:486](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L486)_

Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

**Type parameters:**

▪ **U**: _Pick‹I, DK | OK›_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

**Parameters:**

| Name           | Type                       | Description                                                                                                           |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | Callback‹I, DK, OK, TH, U› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `defaultKey?`  | [DK2](undefined)           | -                                                                                                                     |
| `...indexKeys` | OK2[]                      | -                                                                                                                     |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` with each element being the result of the callback function.

▸ **map**<**U**, **DK2**, **OK2**>(`callbackFn`: Callback‹I, DK, OK, TH, U›, `thisArg`: object, `defaultKey?`: [DK2](undefined), ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:492](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L492)_

Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

**Type parameters:**

▪ **U**: _Pick‹I, DK | OK›_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

**Parameters:**

| Name           | Type                       | Description                                                                                                           |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | Callback‹I, DK, OK, TH, U› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `thisArg`      | object                     | -                                                                                                                     |
| `defaultKey?`  | [DK2](undefined)           | -                                                                                                                     |
| `...indexKeys` | OK2[]                      | -                                                                                                                     |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` with each element being the result of the callback function.

▸ **map**<**U**, **DK2**, **OK2**>(`callbackFn`: Callback‹I, DK, OK, TH, U›, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:499](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L499)_

Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

**Type parameters:**

▪ **U**: _any_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

**Parameters:**

| Name           | Type                       | Description                                                                                                           |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | Callback‹I, DK, OK, TH, U› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `defaultKey`   | DK2                        | -                                                                                                                     |
| `...indexKeys` | OK2[]                      | -                                                                                                                     |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` with each element being the result of the callback function.

▸ **map**<**U**, **DK2**, **OK2**>(`callbackFn`: Callback‹I, DK, OK, TH, U›, `thisArg`: object, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

_Overrides void_

_Defined in [src/index.ts:505](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L505)_

Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

**Type parameters:**

▪ **U**: _any_

▪ **DK2**: _keyof U_

▪ **OK2**: _keyof U_

**Parameters:**

| Name           | Type                       | Description                                                                                                           |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackFn`   | Callback‹I, DK, OK, TH, U› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `thisArg`      | object                     | -                                                                                                                     |
| `defaultKey`   | DK2                        | -                                                                                                                     |
| `...indexKeys` | OK2[]                      | -                                                                                                                     |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, DK2, Exclude‹OK2, DK2›, TH›_

a new `IndexableArray` with each element being the result of the callback function.

▸ **map**<**U**>(`callbackFn`: Callback‹I, DK, OK, TH, U›, `thisArg?`: undefined | object): _[IndexableArray](#classesindexablearraymd)‹U, AvailableDefaultIndex‹U, DK, OK›, AvailableIndex‹U, DK, OK›, TH›_

_Overrides void_

_Defined in [src/index.ts:512](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L512)_

Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

**Type parameters:**

▪ **U**: _any_

**Parameters:**

| Name         | Type                       | Description                                                                                                           |
| ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackFn` | Callback‹I, DK, OK, TH, U› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `thisArg?`   | undefined &#124; object    | -                                                                                                                     |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹U, AvailableDefaultIndex‹U, DK, OK›, AvailableIndex‹U, DK, OK›, TH›_

a new `IndexableArray` with each element being the result of the callback function.

---

### mapToArray

▸ **mapToArray**<**U**>(`callbackfn`: Callback‹I, DK, OK, TH, U | keyof U[]›, `thisArg?`: any): _U[]_

_Defined in [src/index.ts:643](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L643)_

Creates a new base Array (not IndexableArray) with the results of calling a provided function on every element in the calling array.

#### Example

```typescript
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const baseArray = usersWithName.mapToArray(user => ({ id: user.id, nick: name.substring(0, 2) })); // Normal base array.
```

**`see`** {@link IndexableArray#map} to get an `IndexableArray`.

**Type parameters:**

▪ **U**

**Parameters:**

| Name         | Type                                        | Description                                                                                                           |
| ------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `callbackfn` | Callback‹I, DK, OK, TH, U &#124; keyof U[]› | is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`. |
| `thisArg?`   | any                                         | is value to use as this when executing callback.                                                                      |

**Returns:** _U[]_

a new `Array` with each element being the result of the callback function.

---

### pop

▸ **pop**(): _I | undefined_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1227

Removes the last element from an array and returns it.

**Returns:** _I | undefined_

---

### push

▸ **push**(...`items`: I[]): _number_

_Overrides void_

_Defined in [src/index.ts:427](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L427)_

**Parameters:**

| Name       | Type |
| ---------- | ---- |
| `...items` | I[]  |

**Returns:** _number_

---

### reduce

▸ **reduce**(`callbackfn`: function): _I_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1349

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: I, `currentValue`: I, `currentIndex`: number, `array`: I[]): _I_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | I      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

**Returns:** _I_

▸ **reduce**(`callbackfn`: function, `initialValue`: I): _I_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1350

**Parameters:**

▪ **callbackfn**: _function_

▸ (`previousValue`: I, `currentValue`: I, `currentIndex`: number, `array`: I[]): _I_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | I      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

▪ **initialValue**: _I_

**Returns:** _I_

▸ **reduce**<**U**>(`callbackfn`: function, `initialValue`: U): _U_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1356

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Type parameters:**

▪ **U**

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: U, `currentValue`: I, `currentIndex`: number, `array`: I[]): _U_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | U      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

▪ **initialValue**: _U_

If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.

**Returns:** _U_

---

### reduceRight

▸ **reduceRight**(`callbackfn`: function): _I_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1362

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: I, `currentValue`: I, `currentIndex`: number, `array`: I[]): _I_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | I      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

**Returns:** _I_

▸ **reduceRight**(`callbackfn`: function, `initialValue`: I): _I_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1363

**Parameters:**

▪ **callbackfn**: _function_

▸ (`previousValue`: I, `currentValue`: I, `currentIndex`: number, `array`: I[]): _I_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | I      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

▪ **initialValue**: _I_

**Returns:** _I_

▸ **reduceRight**<**U**>(`callbackfn`: function, `initialValue`: U): _U_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1369

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Type parameters:**

▪ **U**

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: U, `currentValue`: I, `currentIndex`: number, `array`: I[]): _U_

**Parameters:**

| Name            | Type   |
| --------------- | ------ |
| `previousValue` | U      |
| `currentValue`  | I      |
| `currentIndex`  | number |
| `array`         | I[]    |

▪ **initialValue**: _U_

If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.

**Returns:** _U_

---

### reverse

▸ **reverse**(): _I[]_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1251

Reverses the elements in an Array.

**Returns:** _I[]_

---

### set

▸ **set**(`position`: number, `path`: string, `value`: any): _void_

_Defined in [src/index.ts:810](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L810)_

Sets value at path of the object, which is one of the entires of array. To update fields of the objects, this method should be used. Otherwise
index cannot be updated, because sub fileds are not tracked for chage detection.

#### Example

```typescript
indexedArray[0].name = "DON'T DO THIS"; // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
indexedArray.set(0, "name", "OK"); // Index updated.
```

**Parameters:**

| Name       | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| `position` | number | is index of the item to be changed.          |
| `path`     | string | is item's path where value to be changed at. |
| `value`    | any    | is new value to be assigned.                 |

**Returns:** _void_

---

### shift

▸ **shift**(): _I | undefined_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1255

Removes the first element from an array and returns it.

**Returns:** _I | undefined_

---

### slice

▸ **slice**(`start?`: undefined | number, `end?`: undefined | number): _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

_Overrides void_

_Defined in [src/index.ts:647](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L647)_

**Parameters:**

| Name     | Type                    |
| -------- | ----------------------- |
| `start?` | undefined &#124; number |
| `end?`   | undefined &#124; number |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I, DK, OK, TH›_

---

### some

▸ **some**(`callbackfn`: function, `thisArg?`: any): _boolean_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1319

Determines whether the specified callback function returns true for any element of an array.

**Parameters:**

▪ **callbackfn**: _function_

A function that accepts up to three arguments. The some method calls
the callbackfn function for each element in the array until the callbackfn returns a value
which is coercible to the Boolean value true, or until the end of the array.

▸ (`value`: I, `index`: number, `array`: I[]): _unknown_

**Parameters:**

| Name    | Type   |
| ------- | ------ |
| `value` | I      |
| `index` | number |
| `array` | I[]    |

▪`Optional` **thisArg**: _any_

An object to which the this keyword can refer in the callbackfn function.
If thisArg is omitted, undefined is used as the this value.

**Returns:** _boolean_

---

### sort

▸ **sort**(`compareFn?`: undefined | function): _this_

_Overrides void_

_Defined in [src/index.ts:446](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L446)_

**Parameters:**

| Name         | Type                      |
| ------------ | ------------------------- |
| `compareFn?` | undefined &#124; function |

**Returns:** _this_

---

### sortBy

▸ **sortBy**(`key`: DK | OK): _this_

_Defined in [src/index.ts:459](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L459)_

Sorts the elements of an array by given key in place and returns the sorted array.

**Parameters:**

| Name  | Type         | Default         | Description                  |
| ----- | ------------ | --------------- | ---------------------------- |
| `key` | DK &#124; OK | this.defaultKey | is the key to sort array by. |

**Returns:** _this_

this instance.

---

### splice

▸ **splice**(`start`: number, `deleteCount`: number, ...`items`: I[]): _I[]_

_Overrides void_

_Defined in [src/index.ts:434](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L434)_

**Parameters:**

| Name          | Type   | Default     |
| ------------- | ------ | ----------- |
| `start`       | number | -           |
| `deleteCount` | number | this.length |
| `...items`    | I[]    | -           |

**Returns:** _I[]_

---

### toLocaleString

▸ **toLocaleString**(): _string_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1223

Returns a string representation of an array. The elements are converted to string using their toLocalString methods.

**Returns:** _string_

---

### toString

▸ **toString**(): _string_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1219

Returns a string representation of an array.

**Returns:** _string_

---

### unshift

▸ **unshift**(...`items`: I[]): _number_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es5.d.ts:1289

Inserts new elements at the start of an array.

**Parameters:**

| Name       | Type | Description                                   |
| ---------- | ---- | --------------------------------------------- |
| `...items` | I[]  | Elements to insert at the start of the Array. |

**Returns:** _number_

---

### values

▸ **values**(): _IterableIterator‹I›_

_Inherited from void_

Defined in node_modules/typescript/lib/lib.es2015.iterable.d.ts:75

Returns an iterable of values in the array

**Returns:** _IterableIterator‹I›_

---

### withDefaultIndex

▸ **withDefaultIndex**<**K**>(`key`: K): _[IndexableArray](#classesindexablearraymd)‹I, K, OK, TH›_

_Defined in [src/index.ts:669](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L669)_

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

**Type parameters:**

▪ **K**: _OK_

**Parameters:**

| Name  | Type | Description                                               |
| ----- | ---- | --------------------------------------------------------- |
| `key` | K    | is key to be used as default index with lookup functions. |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I, K, OK, TH›_

this object.

---

### `Static` from

▸ **from**<**I2**, **DK2**, **DK3**, **OK2**, **OK3**, **TH2**>(`indexableArray`: [IndexableArray](#classesindexablearraymd)‹I2, DK2, OK2, TH2›, `defaultKey?`: [DK3](undefined), ...`indexKeys`: OK3[]): _[IndexableArray](#classesindexablearraymd)‹I2, DK3, Exclude‹OK3, DK3›, TH2›_

_Defined in [src/index.ts:100](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L100)_

Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
returned `IndexableArray` will have same indexed keys.

**Type parameters:**

▪ **I2**: _any_

▪ **DK2**: _keyof I2_

▪ **DK3**: _keyof I2_

▪ **OK2**: _keyof I2_

▪ **OK3**: _keyof I2_

▪ **TH2**: _boolean_

**Parameters:**

| Name             | Type                                                          | Description                                                          |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `indexableArray` | [IndexableArray](#classesindexablearraymd)‹I2, DK2, OK2, TH2› | -                                                                    |
| `defaultKey?`    | [DK3](undefined)                                              | is default key to be used with `get()` method if no key is provided. |
| `...indexKeys`   | OK3[]                                                         | are keys to be indexed.                                              |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I2, DK3, Exclude‹OK3, DK3›, TH2›_

a new `IndexableArray` instance.

▸ **from**<**I2**, **DK2**, **OK2**>(`arrayLike`: Iterable‹I2› | ArrayLike‹I2›, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹I2, DK2, Exclude‹OK2, DK2›, false›_

_Defined in [src/index.ts:113](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L113)_

Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
returned `IndexableArray` will have same indexed keys.

**Type parameters:**

▪ **I2**

▪ **DK2**: _keyof I2_

▪ **OK2**: _keyof I2_

**Parameters:**

| Name           | Type                              | Description                                                          |
| -------------- | --------------------------------- | -------------------------------------------------------------------- |
| `arrayLike`    | Iterable‹I2› &#124; ArrayLike‹I2› | is an array-like or iterable object to convert to an array.          |
| `defaultKey`   | DK2                               | is default key to be used with `get()` method if no key is provided. |
| `...indexKeys` | OK2[]                             | are keys to be indexed.                                              |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I2, DK2, Exclude‹OK2, DK2›, false›_

a new `IndexableArray` instance.

---

### `Static` throwingFrom

▸ **throwingFrom**<**I2**, **DK2**, **DK3**, **OK2**, **OK3**, **TH2**>(`indexableArray`: [IndexableArray](#classesindexablearraymd)‹I2, DK2, OK2, TH2›, `defaultKey?`: [DK3](undefined), ...`indexKeys`: OK3[]): _[IndexableArray](#classesindexablearraymd)‹I2, DK3, Exclude‹OK3, DK3›, true›_

_Defined in [src/index.ts:159](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L159)_

Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
returned `IndexableArray` will have same indexed keys. Returned instance throws exception if `get()` methods cannot find given value.

**Type parameters:**

▪ **I2**: _any_

▪ **DK2**: _keyof I2_

▪ **DK3**: _keyof I2_

▪ **OK2**: _keyof I2_

▪ **OK3**: _keyof I2_

▪ **TH2**: _boolean_

**Parameters:**

| Name             | Type                                                          | Description                                                          |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `indexableArray` | [IndexableArray](#classesindexablearraymd)‹I2, DK2, OK2, TH2› | -                                                                    |
| `defaultKey?`    | [DK3](undefined)                                              | is default key to be used with `get()` method if no key is provided. |
| `...indexKeys`   | OK3[]                                                         | are keys to be indexed.                                              |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I2, DK3, Exclude‹OK3, DK3›, true›_

a new `IndexableArray` instance.

▸ **throwingFrom**<**I2**, **DK2**, **OK2**>(`arrayLike`: Iterable‹I2› | ArrayLike‹I2›, `defaultKey`: DK2, ...`indexKeys`: OK2[]): _[IndexableArray](#classesindexablearraymd)‹I2, DK2, Exclude‹OK2, DK2›, true›_

_Defined in [src/index.ts:172](https://github.com/ozum/indexable-array/blob/98a8d87/src/index.ts#L172)_

Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
returned `IndexableArray` will have same indexed keys. Returned instance throws exception if `get()` methods cannot find given value.

**Type parameters:**

▪ **I2**

▪ **DK2**: _keyof I2_

▪ **OK2**: _keyof I2_

**Parameters:**

| Name           | Type                              | Description                                                          |
| -------------- | --------------------------------- | -------------------------------------------------------------------- |
| `arrayLike`    | Iterable‹I2› &#124; ArrayLike‹I2› | is an array-like or iterable object to convert to an array.          |
| `defaultKey`   | DK2                               | is default key to be used with `get()` method if no key is provided. |
| `...indexKeys` | OK2[]                             | are keys to be indexed.                                              |

**Returns:** _[IndexableArray](#classesindexablearraymd)‹I2, DK2, Exclude‹OK2, DK2›, true›_

a new `IndexableArray` instance.
