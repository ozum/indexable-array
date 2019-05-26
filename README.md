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

# API

<br><a name="IndexableArray"></a>

## IndexableArray

> <p>Extended native array class to access array elements by fast key lookups using binary search. Used for storing objects.</p>

- [IndexableArray](#IndexableArray)
  - [.addIndex(keys)](#IndexableArray+addIndex) ⇒ <code>this</code>
  - [.addSelfIndex()](#IndexableArray+addSelfIndex) ⇒ <code>this</code>
  - [.getIndex(value, [options])](#IndexableArray+getIndex) ⇒ <code>number</code>
  - [.getAllIndexes(value, [options])](#IndexableArray+getAllIndexes) ⇒ <code>Array.&lt;number&gt;</code>
  - [.get(value, [options])](#IndexableArray+get) ⇒ <code>Object</code> \| <code>undefined</code>
  - [.getAll(value, [options])](#IndexableArray+getAll) ⇒ <code>Array.&lt;number&gt;</code>
  - [.has(value, [options])](#IndexableArray+has) ⇒ <code>boolean</code>
  - [.set(position, path, value)](#IndexableArray+set) ⇒ <code>void</code>
  - [.disableIndex()](#IndexableArray+disableIndex)
  - [.enableIndex()](#IndexableArray+enableIndex)

<br><a name="IndexableArray+addIndex"></a>

### indexableArray.addIndex(keys) ⇒ <code>this</code>

> <p>Adds given keys to the index.</p>

**Returns**: <code>this</code> - <ul>

<li>This object.</li>
</ul>

| Param | Type                                   | Description                          |
| ----- | -------------------------------------- | ------------------------------------ |
| keys  | <code>string</code>, <code>Self</code> | <p>List of keys to add to index.</p> |

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
