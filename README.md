<!-- DO NOT EDIT README.md (It will be overridden by README.hbs) -->

# Indexable Array

<!-- Badges from shield.io -->

> Extended native JavaScript Array which provides indexed lookup similar to native Map.
>
> [![Commitizen Friendly][commitizen friendly]][commitizen friendly-url][![Conventional Commits][conventional commits]][conventional commits-url]

[commitizen friendly]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen friendly-url]: http://commitizen.github.io/cz-cli/
[conventional commits]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional commits-url]: https://conventionalcommits.org

<!-- START doctoc -->
<!-- END doctoc -->

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

<br><a name="IndexableArray"></a>

## IndexableArray

> <p>Extended native array class to access array elements by fast key lookups using binary search. Used for storing objects.</p>

- [IndexableArray](#IndexableArray)
  - [new IndexableArray(...items)](#new_IndexableArray_new)
  - _instance_
    - [.indexedKeys](#IndexableArray+indexedKeys) : <code>Set.&lt;string&gt;</code>
    - [.addIndex(keys)](#IndexableArray+addIndex) ⇒ <code>this</code>
    - [.addIndexFrom(source)](#IndexableArray+addIndexFrom) ⇒ <code>this</code>
    - [.addSelfIndex()](#IndexableArray+addSelfIndex) ⇒ <code>this</code>
    - [.sortBy([key])](#IndexableArray+sortBy) ⇒ <code>this</code>
    - [.map(callbackFn, [thisArg])](#IndexableArray+map) ⇒ [<code>IndexableArray</code>](#IndexableArray)
    - [.flatMap(callback, thisArg)](#IndexableArray+flatMap)
    - [.mapWithIndex(callbackFn, [thisArg])](#IndexableArray+mapWithIndex) ⇒ [<code>IndexableArray</code>](#IndexableArray)
    - [.flatMapWithIndex(callback, thisArg)](#IndexableArray+flatMapWithIndex)
    - [.mapToArray(callbackfn, [thisArg])](#IndexableArray+mapToArray) ⇒ <code>Array</code>
    - [.concatIndexed(...items)](#IndexableArray+concatIndexed) ⇒ [<code>IndexableArray</code>](#IndexableArray)
    - [.setDefaultIndex(key)](#IndexableArray+setDefaultIndex) ⇒ <code>this</code>
    - [.getIndex(value, [options])](#IndexableArray+getIndex) ⇒ <code>number</code>
    - [.getAllIndexes(value, [options])](#IndexableArray+getAllIndexes) ⇒ <code>Array.&lt;number&gt;</code>
    - [.get(value, [options])](#IndexableArray+get) ⇒ <code>Object</code> \| <code>undefined</code>
    - [.getAll(value, [options])](#IndexableArray+getAll) ⇒ <code>Array.&lt;number&gt;</code>
    - [.has(value, [options])](#IndexableArray+has) ⇒ <code>boolean</code>
    - [.set(position, path, value)](#IndexableArray+set) ⇒ <code>void</code>
    - [.disableIndex()](#IndexableArray+disableIndex)
    - [.enableIndex()](#IndexableArray+enableIndex)
  - _static_
    - [.from(arrayLike, [mapFn], [thisArg])](#IndexableArray.from) ⇒ [<code>IndexableArray</code>](#IndexableArray)

<br><a name="new_IndexableArray_new"></a>

### new IndexableArray(...items)

> <p>Creates an <code>IndexableArray</code> instance from given items.</p>

| Param    | Type            | Description                                              |
| -------- | --------------- | -------------------------------------------------------- |
| ...items | <code>\*</code> | <p>Items to create <code>IndexableArray</code> from.</p> |

**Example**

```ts
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

<br><a name="IndexableArray+indexedKeys"></a>

### indexableArray.indexedKeys : <code>Set.&lt;string&gt;</code>

> <p>Set of the indexed key names. <code>$$self</code> is used for the whole value.</p>

`Read only`<br>
**Example**

```ts
const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addSelfIndex().addIndex("name");
users.indexedArray; // ["$$self", "name"]
```

<br><a name="IndexableArray+addIndex"></a>

### indexableArray.addIndex(keys) ⇒ <code>this</code>

> <p>Adds given keys to the index.</p>

**Returns**: <code>this</code> - <ul>

<li>This object.</li>
</ul>

| Param | Type                                   | Description                          |
| ----- | -------------------------------------- | ------------------------------------ |
| keys  | <code>string</code>, <code>Self</code> | <p>List of keys to add to index.</p> |

<br><a name="IndexableArray+addIndexFrom"></a>

### indexableArray.addIndexFrom(source) ⇒ <code>this</code>

> <p>Adds same index types from another IndexableArray.</p>

**Returns**: <code>this</code> - <ul>

<li>This object.</li>
</ul>

| Param  | Type                                           | Description                                   |
| ------ | ---------------------------------------------- | --------------------------------------------- |
| source | [<code>IndexableArray</code>](#IndexableArray) | <p>IndexableArray to get index keys from.</p> |

**Example**

```ts
const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const other = new IndexableArray().addIndexFrom(users); // Indexes "name".
```

<br><a name="IndexableArray+addSelfIndex"></a>

### indexableArray.addSelfIndex() ⇒ <code>this</code>

> <p>Adds <code>Self</code> (whole object) to index.</p>

**Returns**: <code>this</code> - <ul>

<li>This object.</li>
</ul>  
**Example**  
```ts
const users = new IndexableArray([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }]).addSelfIndex();
const newUser = { id: 3, name: "George" };
users.push(newUser);
users.getIndex(newUser); // 2;
```

<br><a name="IndexableArray+sortBy"></a>

### indexableArray.sortBy([key]) ⇒ <code>this</code>

> <p>Sorts the elements of an array by given key in place and returns the sorted array.</p>

**Returns**: <code>this</code> - <ul>

<li>This instance.</li>
</ul>

| Param | Type                | Default                | Description |
| ----- | ------------------- | ---------------------- | ----------- |
| [key] | <code>string</code> | <code>&quot;defaultKey |             | Self&quot;</code> | <p>Key to sort array by.</p> |

<br><a name="IndexableArray+map"></a>

### indexableArray.map(callbackFn, [thisArg]) ⇒ [<code>IndexableArray</code>](#IndexableArray)

> <p>Creates a new <code>IndexableArray</code> with the results of calling a provided function on every element in the calling array.
> Returned <code>IndexedArray</code> does not have any indexes, because callback function may return different kind of elements from source array.
> To have same indexes as source <code>IndexedArray</code>, use <code>mapWithIndex()</code> instead.</p>

**Returns**: [<code>IndexableArray</code>](#IndexableArray) - <ul>

<li>A new <code>IndexableArray</code> with each element being the result of the callback function. Returned value <strong>has no indexes</strong>.</li>
</ul>  
**See**: [indexableArray#mapWithIndex](indexableArray#mapWithIndex) to get an `IndexableArray` with same index keys.

| Param      | Type                  | Description                                                                                                                                                |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| callbackFn | <code>function</code> | <p>Function that produces an element of the new Array, taking three arguments: <code>value</code>, <code>index</code> and <code>indexableArray</code>.</p> |
| [thisArg]  | <code>\*</code>       | <p>Value to use as this when executing callback.</p>                                                                                                       |

**Example**

```ts
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0, 2) })).addIndex("nick"); // Has only "nick" index.
```

<br><a name="IndexableArray+flatMap"></a>

### indexableArray.flatMap(callback, thisArg)

> <p>Calls a defined callback function on each element of an indexable array. Then, flattens the result into
> a new indexable array.
> This is identical to a map followed by flat with depth 1. Returned <code>IndexedArray</code> does not have any indexes. To have same indexes as source <code>IndexedArray</code>, use <code>flatMapWithIndex()</code> instead.</p>

| Param    | Description                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| callback | <p>A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.</p> |
| thisArg  | <p>An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.</p>   |

<br><a name="IndexableArray+mapWithIndex"></a>

### indexableArray.mapWithIndex(callbackFn, [thisArg]) ⇒ [<code>IndexableArray</code>](#IndexableArray)

> <p>Creates a new <code>IndexableArray</code> with the results of calling a provided function on every element in the calling array.
> Returned <code>IndexedArray</code> have same indexes as source <code>IndexedArray</code>. To have different indexes than source <code>IndexedArray</code> use <code>map()</code> instead.</p>

**Returns**: [<code>IndexableArray</code>](#IndexableArray) - <ul>

<li>A new <code>IndexableArray</code> with each element being the result of the callback function. Returned value <strong>has same indexes with source <code>IndexedArray</code></strong>.</li>
</ul>  
**See**: [indexableArray#map](indexableArray#map) to get an `IndexableArray` without any index keys.

| Param      | Type                  | Description                                                                                                                                                |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| callbackFn | <code>function</code> | <p>Function that produces an element of the new Array, taking three arguments: <code>value</code>, <code>index</code> and <code>indexableArray</code>.</p> |
| [thisArg]  | <code>\*</code>       | <p>Value to use as this when executing callback.</p>                                                                                                       |

**Example**

```ts
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const usersTrimmedName = usersWithName.mapWithIndex(user => ({ id: user.id, name: name.trim() })); // Has "name" index already.
```

<br><a name="IndexableArray+flatMapWithIndex"></a>

### indexableArray.flatMapWithIndex(callback, thisArg)

> <p>Calls a defined callback function on each element of an indexable array. Then, flattens the result into
> a new indexable array.
> This is identical to a map followed by flat with depth 1. Returned <code>IndexedArray</code> have same indexes as source. To have different indexes than source <code>IndexedArray</code> use <code>flatMap()</code> instead.</p>

| Param    | Description                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| callback | <p>A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.</p> |
| thisArg  | <p>An object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.</p>   |

<br><a name="IndexableArray+mapToArray"></a>

### indexableArray.mapToArray(callbackfn, [thisArg]) ⇒ <code>Array</code>

> <p>Creates a new base Array (not IndexableArray) with the results of calling a provided function on every element in the calling array.</p>

**Returns**: <code>Array</code> - <ul>

<li>A new <code>IndexableArray</code> with each element being the result of the callback function. Returned value <strong>has no indexes</strong>.</li>
</ul>  
**See**: [indexableArray#mapWithIndex](indexableArray#mapWithIndex) or [indexableArray#map](indexableArray#map) to get an `IndexableArray`.

| Param      | Type                  | Description                                                                                                                                                |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| callbackfn | <code>function</code> | <p>Function that produces an element of the new Array, taking three arguments: <code>value</code>, <code>index</code> and <code>indexableArray</code>.</p> |
| [thisArg]  | <code>\*</code>       | <p>Value to use as this when executing callback.</p>                                                                                                       |

**Example**

```ts
const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
const baseArray = usersWithName.mapToArray(user => ({ id: user.id, nick: name.substring(0, 2) })); // Normal base array.
```

<br><a name="IndexableArray+concatIndexed"></a>

### indexableArray.concatIndexed(...items) ⇒ [<code>IndexableArray</code>](#IndexableArray)

> <p>Merges two or more arrays. This method does not change the existing arrays, but instead returns a new array.</p>

**Returns**: [<code>IndexableArray</code>](#IndexableArray) - <ul>

<li>A new <code>IndexableArray</code> instance with same indexes as source.</li>
</ul>

| Param    | Type            | Description                                                                                                                                                                   |
| -------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ...items | <code>\*</code> | <p>Arrays and/or values to concatenate into a new array. If all valueN parameters are omitted, concat returns a shallow copy of the existing array on which it is called.</p> |

<br><a name="IndexableArray+setDefaultIndex"></a>

### indexableArray.setDefaultIndex(key) ⇒ <code>this</code>

> <p>Sets default index key to be used with lookup functions such as [get](#IndexableArray+get), [getAll](#IndexableArray+getAll),
> [getIndex](#IndexableArray+getIndex), [getAllIndexes](#IndexableArray+getAllIndexes) etc.
> If not set, <code>IndexedArray</code> uses first indexable key as default key.</p>

**Returns**: <code>this</code> - <ul>

<li>This value.</li>
</ul>

| Param | Type                | Description                                          |
| ----- | ------------------- | ---------------------------------------------------- |
| key   | <code>string</code> | <p>Default key to be used with lookup functions.</p> |

**Example**

```ts
const input = [{ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }];
const users = new IndexableArray(...input).addIndex("name", "id"); // "name" is default index
users.setDefaultIndex("id"); // "id" is default index.
```

<br><a name="IndexableArray+getIndex"></a>

### indexableArray.getIndex(value, [options]) ⇒ <code>number</code>

> <p>Returns the first index at which a given indexed value can be found in the array, or -1 if it is not present.</p>

**Returns**: <code>number</code> - <ul>

<li>The first index of the element in the array; -1 if not found.</li>
</ul>

| Param               | Type                | Description                                                                                                                                                                                                                                                             |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value               | <code>\*</code>     | <p>Indexed value to search for.</p>                                                                                                                                                                                                                                     |
| [options]           | <code>Object</code> | <p>Options</p>                                                                                                                                                                                                                                                          |
| [options.key]       | <code>string</code> | <p>Index field to look for value. Default lookup field is used if no key is provided.</p>                                                                                                                                                                               |
| [options.fromIndex] | <code>number</code> | <p>The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array</p> |

<br><a name="IndexableArray+getAllIndexes"></a>

### indexableArray.getAllIndexes(value, [options]) ⇒ <code>Array.&lt;number&gt;</code>

> <p>Returns all indexes at which a given indexed value can be found in the array, or empty array if it is not present.</p>

**Returns**: <code>Array.&lt;number&gt;</code> - <ul>

<li>All indexes of the element in the array; Empty array if not found.</li>
</ul>

| Param         | Type                | Description                                                                               |
| ------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| value         | <code>\*</code>     | <p>Indexed value to search for.</p>                                                       |
| [options]     | <code>Object</code> | <p>Options</p>                                                                            |
| [options.key] | <code>string</code> | <p>Index field to look for value. Default lookup field is used if no key is provided.</p> |

<br><a name="IndexableArray+get"></a>

### indexableArray.get(value, [options]) ⇒ <code>Object</code> \| <code>undefined</code>

> <p>Returns the first item at which a given indexed value can be found in the array, or <code>undefined</code> if it is not present.</p>

**Returns**: <code>Object</code> \| <code>undefined</code> - <ul>

<li>The first item with given indexed value in the array; <code>undefined</code> if not found.</li>
</ul>

| Param               | Type                | Description                                                                                                                                                                                                                                                             |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value               | <code>\*</code>     | <p>Indexed value to search for.</p>                                                                                                                                                                                                                                     |
| [options]           | <code>Object</code> | <p>Options</p>                                                                                                                                                                                                                                                          |
| [options.key]       | <code>string</code> | <p>Index field to look for value. Default lookup field is used if no key is provided.</p>                                                                                                                                                                               |
| [options.fromIndex] | <code>number</code> | <p>The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array</p> |

<br><a name="IndexableArray+getAll"></a>

### indexableArray.getAll(value, [options]) ⇒ <code>Array.&lt;number&gt;</code>

> <p>Returns all items at which a given indexed value can be found in the array, or empty array if it is not present.</p>

**Returns**: <code>Array.&lt;number&gt;</code> - <ul>

<li>All items with given indexed value in the array; Empty array if not found.</li>
</ul>

| Param         | Type                | Description                                                                               |
| ------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| value         | <code>\*</code>     | <p>Indexed value to search for.</p>                                                       |
| [options]     | <code>Object</code> | <p>Options</p>                                                                            |
| [options.key] | <code>string</code> | <p>Index field to look for value. Default lookup field is used if no key is provided.</p> |

<br><a name="IndexableArray+has"></a>

### indexableArray.has(value, [options]) ⇒ <code>boolean</code>

> <p>Determines whether an array includes a certain indexed value among its entries' keys, returning true or false as appropriate.</p>

**Returns**: <code>boolean</code> - <ul>

<li>True if indexed value is found among array's entries' keys.</li>
</ul>

| Param               | Type                | Description                                                                                                                                                                                                                                                             |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value               | <code>\*</code>     | <p>Indexed value to search for.</p>                                                                                                                                                                                                                                     |
| [options]           | <code>Object</code> | <p>Options</p>                                                                                                                                                                                                                                                          |
| [options.key]       | <code>string</code> | <p>Index field to look for value. Default lookup field is used if no key is provided.</p>                                                                                                                                                                               |
| [options.fromIndex] | <code>number</code> | <p>The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array</p> |

<br><a name="IndexableArray+set"></a>

### indexableArray.set(position, path, value) ⇒ <code>void</code>

> <p>Sets value at path of the object, which is one of the entires of array. To update fields of the objects, this method should be used. Otherwise
> index cannot be updated, because sub fileds are not tracked for chage detection.</p>

| Param    | Type                | Description                                      |
| -------- | ------------------- | ------------------------------------------------ |
| position | <code>number</code> | <p>Index of the item to be changed.</p>          |
| path     | <code>string</code> | <p>Item's path where value to be changed at.</p> |
| value    | <code>\*</code>     | <p>New value to be assigned.</p>                 |

**Example**

```ts
indexedArray[0].name = "DON'T DO THIS"; // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
indexedArray.set(0, "name", "OK"); // Index updated.
```

<br><a name="IndexableArray+disableIndex"></a>

### indexableArray.disableIndex()

> <p>Disables indexing of the array. It may be used to disable temporarily</p>
> <ul>
> <li>to do heavy updates for performance reasons,</li>
> <li>to do operations in sub fields.
> If indexing is not needed anymore, it is suggested to create a new native non-extended array and copy values into it
> for avoiding performance penalty of proxy array used in this library.</li>
> </ul>

**See**: {IndexedArray#enableIndex} method.  
**Example**

```ts
indexedArray.disableIndex();
indexedArray[0].name = "THIS IS OK NOW";
indexedArray.enableIndex(); // Index is recreated from scratch.
```

<br><a name="IndexableArray+enableIndex"></a>

### indexableArray.enableIndex()

> <p>Enables indexing and recreates index from scratch.</p>

**See**: {IndexedArray#disableIndex} method.

<br><a name="IndexableArray.from"></a>

### IndexableArray.from(arrayLike, [mapFn], [thisArg]) ⇒ [<code>IndexableArray</code>](#IndexableArray)

> <p>Creates a new, shallow-copied <code>IndexableArray</code> instance from an array-like or iterable object. If source is also <code>IndexableArray</code>,
> returned <code>IndexableArray</code> will have same indexed keys.</p>

**Returns**: [<code>IndexableArray</code>](#IndexableArray) - <ul>

<li>A new <code>IndexableArray</code> instance.</li>
</ul>

| Param     | Type                                          | Description                                                     |
| --------- | --------------------------------------------- | --------------------------------------------------------------- |
| arrayLike | <code>Iterable</code>, <code>ArrayLike</code> | <p>An array-like or iterable object to convert to an array.</p> |
| [mapFn]   | <code>function</code>                         | <p>Map function to call on every element of the array.</p>      |
| [thisArg] | <code>\*</code>                               | <p>Value to use as this when executing mapFn.</p>               |
