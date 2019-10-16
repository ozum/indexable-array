/* eslint-disable @typescript-eslint/no-explicit-any, class-methods-use-this, no-dupe-class-members */

import sorted from "sorted-array-functions";
import set from "lodash.set";

type ObjectLookup = WeakMap<object, number[]>;
type ObjectLookups<I, K extends keyof I> = Map<K, ObjectLookup>;
type PrimitiveLookup<I, DK extends keyof I, OK extends keyof I> = Map<I[DK] | I[OK], number[]>; // "john": [1,23], "sarah": [2,4]
type PrimitiveLookups<I, DK extends keyof I, OK extends keyof I> = Map<DK | OK, PrimitiveLookup<I, DK, OK>>; // name: ("john": [1,23], "sarah": [2,4])

type AvailableDefaultIndex<U, DK, OK> = DK extends keyof U ? DK : Extract<OK, keyof U>;
type AvailableIndex<U, DK, OK> = Exclude<Extract<OK, keyof U>, AvailableDefaultIndex<U, DK, OK>>;

type Callback<I, DK extends keyof I, OK extends keyof I, TH extends boolean, R> = (
  value: I,
  index: number,
  array: IndexableArray<I, DK, OK, TH>
) => R;
type CallbackThis<I, DK extends keyof I, OK extends keyof I, TH extends boolean, R, T = undefined> = (
  this: T,
  value: I,
  index: number,
  array: IndexableArray<I, DK, OK, TH>
) => R;

function isDefaultKey<I, DK extends keyof I>(value: any): value is DK {
  return typeof value === "string" || value === undefined;
}

const nonEnumerableProps = new Set([
  "primitiveLookups",
  "objectLookups",
  "indexedKeys",
  "_defaultKey",
  "indexEnabled",
  "operationAtEnd",
  "builtIndexKeys",
  "_throwUnknown",
]);

/**
 * Extended native array class to access array elements by fast key lookups using binary search. Used for storing objects.
 *
 * @example
 * import IndexableArray, { Self } from "indexable-array";
 * const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
 * Array.isArray(users); // true
 * users.get("George"); // { id: 23, name: "George"}
 * const user = { id: 21, name: "Henry" };
 * users[0] = user;
 * users.getIndex(user); // 0 - It is possible to index whole object by { selfIndex: true } option.
 * users.splice(1, 1, { id: 34, name: "Henry" });
 * users.getAllIndexes("Henry"); // [0, 1];
 *
 * users[0].name = "DON'T DO THIS"; // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
 * users.set(0, "name", "OK"); // Index updated.
 * users.disableIndex();
 * users[0].name = "THIS IS OK NOW";
 * users.enableIndex(); // Index is recreated from scratch.
 */
export default class IndexableArray<
  I extends any,
  DK extends keyof I = never,
  OK extends keyof I = never,
  TH extends boolean = false
> extends Array<I> {
  private readonly primitiveLookups: PrimitiveLookups<I, DK, OK> = new Map();
  private readonly objectLookups: ObjectLookups<I, DK | OK> = new Map();
  private readonly builtIndexKeys: Set<DK | OK> = new Set();
  private _defaultKey?: DK;
  private indexEnabled = false;
  private operationAtEnd = false;
  private _throwUnknown = false;

  /**
   * Set of the indexed key names. `$$self` is used for the whole value.
   *
   * @example
   * const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addSelfIndex().addIndex("name");
   * users.indexedArray; // ["$$self", "name"]
   */
  public readonly indexedKeys: Set<DK | OK> = new Set();

  /**
   * Creates an `IndexableArray` instance from given items.
   *
   * @param items are items to create `IndexableArray` from.
   */
  private constructor(...items: I[]) {
    super(...items);

    nonEnumerableProps.forEach(property => Object.defineProperty(this, property, { writable: true, enumerable: false })); // Make added fields non-enumerable.

    return new Proxy(this, {
      set: (target: IndexableArray<I, DK, OK, TH>, property: number, value: I): boolean => target.setProperty(property, value),
      deleteProperty: (target: IndexableArray<I, DK, OK, TH>, property: number): boolean => target.deleteProperty(property),
    });
  }

  public static from<
    I2 extends any,
    DK2 extends keyof I2,
    DK3 extends keyof I2 = DK2,
    OK2 extends keyof I2 = never,
    OK3 extends keyof I2 = OK2,
    TH2 extends boolean = false
  >(
    indexableArray: IndexableArray<I2, DK2, OK2, TH2>,
    defaultKey?: DK3,
    ...indexKeys: OK3[]
  ): IndexableArray<I2, DK3, Exclude<OK3, DK3>, TH2>;

  public static from<I2, DK2 extends keyof I2, OK2 extends keyof I2 = never>(
    arrayLike: Iterable<I2> | ArrayLike<I2>,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<I2, DK2, Exclude<OK2, DK2>, false>;

  /**
   * Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
   * returned `IndexableArray` will have same indexed keys.
   *
   * @param arrayLike is an array-like or iterable object to convert to an array.
   * @param defaultKey is default key to be used with `get()` method if no key is provided.
   * @param indexKeys are keys to be indexed.
   * @returns a new `IndexableArray` instance.
   */
  public static from<
    I2 extends any,
    DK2 extends keyof I2,
    DK3 extends keyof I2 = DK2,
    OK2 extends keyof I2 = never,
    OK3 extends keyof I2 = OK2,
    TH2 extends boolean = false
  >(
    arrayLike: Iterable<I2> | ArrayLike<I2> | IndexableArray<I2, DK2, OK2, TH2>,
    defaultKey?: DK3,
    ...indexKeys: OK3[]
  ): IndexableArray<I2, DK3, Exclude<OK3, DK3>, TH2> {
    const array = Array.isArray(arrayLike) ? arrayLike : Array.from(arrayLike);

    const indexableArray: IndexableArray<I2, DK3, OK3, TH2> = new IndexableArray(...array);

    if (arrayLike instanceof IndexableArray) {
      indexableArray._throwUnknown = arrayLike._throwUnknown;
    }

    if (defaultKey) {
      indexableArray.addIndex(defaultKey, ...indexKeys);
    }

    if (arrayLike instanceof IndexableArray && !defaultKey) {
      indexableArray._copyMeta(arrayLike as any);
    }

    return indexableArray as any;
  }

  public static throwingFrom<
    I2 extends any,
    DK2 extends keyof I2,
    DK3 extends keyof I2 = DK2,
    OK2 extends keyof I2 = never,
    OK3 extends keyof I2 = OK2,
    TH2 extends boolean = false
  >(
    indexableArray: IndexableArray<I2, DK2, OK2, TH2>,
    defaultKey?: DK3,
    ...indexKeys: OK3[]
  ): IndexableArray<I2, DK3, Exclude<OK3, DK3>, true>;

  public static throwingFrom<I2, DK2 extends keyof I2, OK2 extends keyof I2 = never>(
    arrayLike: Iterable<I2> | ArrayLike<I2>,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<I2, DK2, Exclude<OK2, DK2>, true>;

  /**
   * Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
   * returned `IndexableArray` will have same indexed keys. Returned instance throws exception if `get()` methods cannot find given value.
   *
   * @param arrayLike is an array-like or iterable object to convert to an array.
   * @param defaultKey is default key to be used with `get()` method if no key is provided.
   * @param indexKeys are keys to be indexed.
   * @returns a new `IndexableArray` instance.
   */
  public static throwingFrom<
    I2 extends any,
    DK2 extends keyof I2,
    DK3 extends keyof I2 = DK2,
    OK2 extends keyof I2 = never,
    OK3 extends keyof I2 = OK2,
    TH2 extends boolean = false
  >(
    arrayLike: Iterable<I2> | ArrayLike<I2> | IndexableArray<I2, DK2, OK2, TH2>,
    defaultKey?: DK3,
    ...indexKeys: OK3[]
  ): IndexableArray<I2, DK3, Exclude<OK3, DK3>, true> {
    const indexableArray = IndexableArray.from(arrayLike, defaultKey as any, ...indexKeys);
    indexableArray._throwUnknown = true;

    return indexableArray as any;
  }

  private get defaultKey(): DK {
    const firstIndexKey = this.builtIndexKeys.values().next().value;
    /* istanbul ignore next */
    return this._defaultKey === undefined ? firstIndexKey : this._defaultKey;
  }

  /**
   * Clears index by emptying related index fields.
   *
   * @ignore
   */
  private clearIndex(): void {
    this.indexedKeys.forEach(key => {
      this.primitiveLookups.set(key, new Map());
      this.objectLookups.set(key, new WeakMap());
      this.builtIndexKeys.delete(key);
    });
  }

  /**
   * Adds given keys to the index.
   *
   * @ignore
   * @param keys are list of keys to add to index.
   * @returns this object.
   */
  private addIndex(...indexKeys: (DK | OK)[]): this {
    const keys = indexKeys.length === 0 ? Array.from(this.indexedKeys) : indexKeys;
    const addedIndexKeys: (DK | OK)[] = [];
    this.indexEnabled = true;
    this.operationAtEnd = true;

    keys
      .filter(key => !this.builtIndexKeys.has(key))
      .forEach(key => {
        if (!this._defaultKey) {
          this._defaultKey = key as DK;
        }
        this.primitiveLookups.set(key, new Map());
        this.objectLookups.set(key, new WeakMap());
        this.indexedKeys.add(key);
        this.builtIndexKeys.add(key);
        addedIndexKeys.push(key);
      });

    this.forEach((item, position) => this.addToIndex(position, item, addedIndexKeys));
    this.operationAtEnd = false;
    return this;
  }

  /**
   * Adds same index types from another IndexableArray.
   *
   * @ignore
   * @param source is `IndexableArray` to get index keys from.
   * @returns this object.
   * @example
   * const users = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
   * const other = new IndexableArray().addIndexFrom(users); // Indexes "name".
   */
  public _copyMeta<I2 extends any, DK2 extends DK, OK2 extends OK>(source: IndexableArray<I2, DK2, OK2, any>): this {
    this._throwUnknown = source._throwUnknown;
    return this.addIndex(...source.indexedKeys);
  }

  /**
   * Returns either `objectLookup` or `primitiveLookup` based on given `field` and `value`
   *
   * @ignore
   * @param key is array item's field to get lookup for.
   * @param value is value stored in that field. (Used for selecting primitve or object lookup)
   * @returns map with keys are lookup-values, values are indexes of those values.
   */
  private getLookup<I2 extends I, DK2 extends DK, OK2 extends OK>(
    key: DK2 | OK2,
    value: I2[DK2 | OK2]
  ): PrimitiveLookup<I2, DK2, OK2> | ObjectLookup {
    if (!this.indexedKeys.has(key)) {
      throw new Error(`Key is not indexed: ${key}`);
    }

    const lookups = typeof value === "object" ? this.objectLookups : this.primitiveLookups;
    const lookup = lookups.get(key);

    return lookup as any;
  }

  /**
   * Adds index into lookup for given field. Also creates lookup if it does not exists.
   *
   * @ignore
   * @param position is position of item which holds the value for the given field.
   * @param item is item to add to index.
   * @param keys are fields to add lookup. (i.e. "name")
   */
  private addToIndex(position: number, item: I, keys: (DK | OK)[] = Array.from(this.indexedKeys)): void {
    keys.forEach(key => {
      const value = item[key];
      const lookup = this.getLookup(key, value);
      const sortedIndex = lookup.get(value);

      if (sortedIndex) {
        if (position === 0) {
          sortedIndex.unshift(position);
        } else if (this.operationAtEnd || position >= this.length - 1) {
          sortedIndex.push(position);
        } else {
          sorted.add(sortedIndex, position);
        }
      } else {
        lookup.set(value, [position]);
      }
    });
  }

  /**
   * Removes index from lookup for given field. Also deletes lookup if no index remains for this value.
   *
   * @ignore
   * @param item is item to add to index.
   * @param position is position of item which holds the value for the given field.
   * @param keys are fields to add lookup. (i.e. "name")
   */
  private removeFromIndex(position: number, keys: (DK | OK)[] = Array.from(this.indexedKeys)): void {
    const item = this[position];
    keys.forEach(key => {
      const value = item[key];
      const lookup = this.getLookup(key, value);
      const sortedIndex = lookup.get(value) as number[]; // Cannot be undefined, otherwise value should not be there and therefore should not have executed a delete operation.

      if (sortedIndex.length === 1) {
        lookup.delete(value);
      } else if (position === 0) {
        sortedIndex.shift();
      } else if (this.operationAtEnd || position >= this.length - 1) {
        sortedIndex.pop();
      } else {
        sorted.remove(sortedIndex, position);
      }
    });
  }

  /**
   * The `handler.set()` method is a trap for setting a property value of array item.
   *
   * @ignore
   * @param property is the name or Symbol of the property to set.
   * @param newItem is the new value of the property to set.
   * @returns whether that assignment succeeded
   */
  private setProperty(property: keyof this, newItem: any): boolean {
    if (this.indexEnabled && !nonEnumerableProps.has(property as string)) {
      if (property === "length") {
        if (newItem < this.length) {
          const oldLength = this.length;
          const newLength = newItem;
          this.operationAtEnd = true;
          for (let position = newLength; position < oldLength; position += 1) {
            if (this[position] !== undefined) {
              this.removeFromIndex(position);
            }
          }
          this.operationAtEnd = false;
        }
      } else {
        const position = parseInt(property as string, 10);
        const oldItem = this[property];
        if (oldItem) {
          this.removeFromIndex(position);
        }
        this.addToIndex(position, newItem);
      }
    }

    this[property] = newItem;
    return true;
  }

  /**
   * The `handler.deleteProperty()` method is a trap for setting a property value of array item.
   *
   * @ignore
   * @param property is the name or Symbol of the property to delete.
   * @returns whether delete operation succeeded
   */
  private deleteProperty(property: keyof this): boolean {
    const position = parseInt(property as string, 10);

    if (position !== undefined && this.indexEnabled) {
      this.removeFromIndex(position);
    }

    delete this[property];
    return true;
  }

  /**
   * Returns positive index from start for given positive or negative index. Negative index is used for indexing from the end of array.
   *
   * @ignore
   * @param index is index to get positive for.
   * @returns positive index for given index.
   * @example
   * const indexedArray = IndexedArray.create({ id: 98 }, { id: 43 }, { id: 34 }, { id: 23 });
   * indexedArray.positiveIndexOf(-1); // 3
   * indexedArray.positiveIndexOf(1); // 1
   */
  private positiveIndexOf(index: number): number {
    return index >= 0 ? index : Math.max(0, this.length + index);
  }

  /**
   * Throws error if an index based operation is accessed when index is disabled.
   *
   * @private
   */
  private assertIndexEnabled(): void {
    if (!this.indexEnabled) {
      throw new Error("Index based operations cannot be used when index is disabled or there isn't any indexed fields.");
    }
  }

  public push(...items: I[]): number {
    this.operationAtEnd = true;
    const result = super.push(...items);
    this.operationAtEnd = false;
    return result;
  }

  public splice(start: number, deleteCount: number = this.length, ...items: I[]): I[] {
    if (start < this.length * 0.8) {
      this.disableIndex();
      const result = super.splice(start, deleteCount, ...items);
      this.indexEnabled = true;
      this.enableIndex();
      return result;
    }

    return super.splice(start, deleteCount, ...items);
  }

  public sort(compareFn?: (a: I, b: I) => number): this {
    this.disableIndex();
    const result = super.sort(compareFn);
    this.enableIndex();
    return result;
  }

  /**
   * Sorts the elements of an array by given key in place and returns the sorted array.
   *
   * @param key is the key to sort array by.
   * @returns this instance.
   */
  public sortBy(key: DK | OK = this.defaultKey): this {
    return this.sort((a, b) => {
      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return a[key] - b[key];
      }
      const textA = a[key].toUpperCase();
      const textB = b[key].toUpperCase();
      // eslint-disable-next-line no-nested-ternary
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
  }

  public filter<S extends I>(
    callbackfn: (value: I, index: number, array: IndexableArray<I, DK, OK, TH>) => value is S,
    thisArg?: any
  ): IndexableArray<S, DK, OK, TH>;

  public filter(callbackfn: Callback<I, DK, OK, TH, unknown>, thisArg?: any): IndexableArray<I, DK, OK, TH>;
  public filter<S extends I>(
    callbackfn: Callback<I, DK, OK, TH, unknown>,
    thisArg?: any
  ): IndexableArray<I, DK, OK, TH> | IndexableArray<S, DK, OK, TH> {
    const array = super.filter(callbackfn as any, thisArg) as IndexableArray<I, DK, OK, TH>;
    return array._copyMeta(this);
  }

  // public map<U extends I>(callbackFn: Callback<I, DK, OK, TH, U>, thisArg?: object, ...rest: never[]): IndexableArray<U, DK, OK, TH>;
  public map<U extends Pick<I, DK | OK>, DK2 extends keyof U = DK, OK2 extends keyof U = OK>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    defaultKey?: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public map<U extends Pick<I, DK | OK>, DK2 extends keyof U = DK, OK2 extends keyof U = OK>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    thisArg: object,
    defaultKey?: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public map<U extends any, DK2 extends keyof U, OK2 extends keyof U = never>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public map<U extends any, DK2 extends keyof U, OK2 extends keyof U = never>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    thisArg: object,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public map<U extends any>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    thisArg?: object
  ): IndexableArray<U, AvailableDefaultIndex<U, DK, OK>, AvailableIndex<U, DK, OK>, TH>;

  /**
   * Creates a new `IndexableArray` with the results of calling a provided function on every element in the calling array.
   * Returned `IndexedArray` does not have any indexes, because callback function may return different kind of elements from source array.
   * To have same indexes as source `IndexedArray`, use `mapWithIndex()` instead.
   *
   * @param callbackFn is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`.
   * @param defaultKeyOrThisArg is key to be used as a default index on returned `IndexableArray` instance or value to use as `this` when executing callback.
   * @param keys are the keys to be indexed.
   * @returns a new `IndexableArray` with each element being the result of the callback function.
   *
   * @example
   * const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
   * const usersWithNick = usersWithName.map(user => ({ id: user.id, nick: name.substring(0,2) })).addIndex("nick"); // Has only "nick" index.
   */
  public map<U extends any, DK2 extends keyof U = DK, OK2 extends keyof U = never>(
    callbackFn: Callback<I, DK, OK, TH, U>,
    defaultKeyOrThisArg?: DK2 | object,
    ...keys: [DK2, ...OK2[]] | OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH> | IndexableArray<U, AvailableDefaultIndex<U, DK, OK>, AvailableIndex<U, DK, OK>, TH> {
    const [thisArg, defaultKey, indexKeys] = isDefaultKey(defaultKeyOrThisArg)
      ? [undefined, defaultKeyOrThisArg as DK2, keys as OK2[]]
      : [defaultKeyOrThisArg, keys[0] as DK2, keys.slice(1) as OK2[]];

    const indexableArray = super.map(callbackFn as any, thisArg) as IndexableArray<U, DK2, OK2, TH>;

    if (defaultKey) {
      indexableArray._throwUnknown = this._throwUnknown;
      indexableArray._defaultKey = defaultKey;
      indexableArray.addIndex(defaultKey, ...indexKeys);
    } else {
      indexableArray._copyMeta(this as any);
    }

    return indexableArray as any;
  }

  // public flatMap<U extends I, This extends undefined | object = undefined>(
  //   callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
  //   thisArg?: object,
  //   ...rest: never[]
  // ): IndexableArray<U, DK, OK, TH>;
  public flatMap<
    U extends Pick<I, DK | OK>,
    DK2 extends keyof U = DK,
    OK2 extends keyof U = OK,
    This extends undefined | object = undefined
  >(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    defaultKey?: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public flatMap<
    U extends Pick<I, DK | OK>,
    DK2 extends keyof U = DK,
    OK2 extends keyof U = OK,
    This extends undefined | object = undefined
  >(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    thisArg: object,
    defaultKey?: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public flatMap<U extends any, DK2 extends keyof U, OK2 extends keyof U = never, This extends undefined | object = undefined>(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public flatMap<U extends any, DK2 extends keyof U, OK2 extends keyof U = never, This extends undefined | object = undefined>(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    thisArg: object,
    defaultKey: DK2,
    ...indexKeys: OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH>;

  public flatMap<U extends any, This extends undefined | object = undefined>(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    thisArg?: This,
    ...rest: never[]
  ): IndexableArray<U, AvailableDefaultIndex<U, DK, OK>, AvailableIndex<U, DK, OK>, TH>;

  /**
   * Calls a defined callback function on each element of an indexable array. Then, flattens the result into
   * a new indexable array.
   * This is identical to a map followed by flat with depth 1.
   *
   * @param callbackFn is a function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array.
   * @param defaultKeyOrThisArg is key to be used as a default index on returned `IndexableArray` instance or an object to which the this keyword can refer in the callback function. If thisArg is omitted, undefined is used as the this value.
   * @param keys are the keys to be indexed.
   * @returns a new `IndexableArray` of dept 1.
   */
  public flatMap<U extends any, DK2 extends keyof U = DK, OK2 extends keyof U = never, This extends undefined | object = undefined>(
    callbackFn: CallbackThis<I, DK, OK, TH, U | readonly U[], This>,
    defaultKeyOrThisArg: DK2 | This,
    ...keys: [DK2, ...OK2[]] | OK2[]
  ): IndexableArray<U, DK2, Exclude<OK2, DK2>, TH> | IndexableArray<U, AvailableDefaultIndex<U, DK, OK>, AvailableIndex<U, DK, OK>, TH> {
    const [thisArg, defaultKey, indexKeys] = isDefaultKey(defaultKeyOrThisArg)
      ? [undefined, defaultKeyOrThisArg as DK2, keys as OK2[]]
      : [defaultKeyOrThisArg as This, keys[0] as DK2, keys.slice(1) as OK2[]];

    const indexableArray = super.flatMap(callbackFn as any, thisArg) as IndexableArray<U, DK2, OK2, TH>;

    if (defaultKey) {
      indexableArray._defaultKey = defaultKey;
      indexableArray._throwUnknown = this._throwUnknown;
      indexableArray.addIndex(defaultKey, ...indexKeys);
    } else {
      indexableArray._copyMeta(this as any);
    }

    return indexableArray as any;
  }

  /**
   * Creates a new base Array (not IndexableArray) with the results of calling a provided function on every element in the calling array.
   *
   * @param callbackfn is function that produces an element of the new Array, taking three arguments: `value`, `index` and `indexableArray`.
   * @param thisArg is value to use as this when executing callback.
   * @returns a new `Array` with each element being the result of the callback function.
   * @see {@link IndexableArray#map} to get an `IndexableArray`.
   * @example
   * const usersWithName = new IndexableArray({ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }).addIndex("name");
   * const baseArray = usersWithName.mapToArray(user => ({ id: user.id, nick: name.substring(0,2) })); // Normal base array.
   */
  public mapToArray<U>(callbackfn: Callback<I, DK, OK, TH, U | readonly U[]>, thisArg?: any): U[] {
    return Array.from(this).map(callbackfn as any, thisArg);
  }

  public slice(start?: number, end?: number): IndexableArray<I, DK, OK, TH> {
    return (super.slice(start, end) as IndexableArray<I, DK, OK, TH>)._copyMeta(this);
  }

  public concat(...items: ConcatArray<I>[]): IndexableArray<I, DK, OK, TH>;
  public concat(...items: (I | ConcatArray<I>)[]): IndexableArray<I, DK, OK, TH>;
  public concat(...items: (I | ConcatArray<I>)[]): IndexableArray<I, DK, OK, TH> {
    const indexableArray = super.concat(...items) as IndexableArray<I, DK, OK, TH>;
    indexableArray._copyMeta(this as any);
    return indexableArray;
  }

  /**
   * Sets default index key to be used with lookup functions. Returns same instance.
   *
   * @param key is key to be used as default index with lookup functions.
   * @returns this object.
   * @example
   * const input = [{ id: 23, name: "Geroge" }, { id: 96, name: "Lisa" }];
   * let users = new IndexableArray(...input).addIndex("name", "id"); // "name" is default index
   * users = users.withDefaultIndex("id"); // "id" is default index. Assignment is used for TypeScript to assign right type to variable.
   */
  public withDefaultIndex<K extends OK>(key: K): IndexableArray<I, K, OK, TH> {
    this._defaultKey = (key as unknown) as DK;
    return this as any;
  }

  /**
   * Returns the first index at which a given indexed value can be found in the array, or -1 if it is not present.
   *
   * @param value indexed value to search for.
   * @param options are option to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @param options.fromIndex is the index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns the first index of the element in the array; -1 if not found.
   */
  public getIndex<K extends DK | OK>(
    value: I[K],
    { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}
  ): number {
    this.assertIndexEnabled();
    const sortedIndex = this.getLookup(key, value).get(value);
    let index;

    if (sortedIndex) {
      const positiveFromIndex = this.positiveIndexOf(fromIndex);
      index = positiveFromIndex === 0 ? sortedIndex[0] : sortedIndex[sorted.gte(sortedIndex, positiveFromIndex)];
    }
    return index === undefined ? -1 : index;
  }

  /**
   * Returns all indexes at which a given indexed value can be found in the array, or empty array if it is not present.
   *
   * @param value indexed value to search for.
   * @param options are option to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @returns all indexes of the element in the array; Empty array if not found.
   */
  public getAllIndexes<K extends OK | DK>(value: I[K], { key = this.defaultKey as K }: { key?: K } = {}): number[] {
    this.assertIndexEnabled();
    return this.getLookup(key, value).get(value) || [];
  }

  /**
   * Returns the first item at which a given indexed value can be found in the array. According to construction option or `throwUnknown` option,
   * returns `undefined` or throws exception if value cannot be found.
   *
   * @param value is indexed value to search for.
   * @param options are options to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @param options.fromIndex is the index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @param options.throwUnknown is whether to throw exception if value cannot be found in index.
   * @returns the first item with given indexed value in the array; `undefined` if not found.
   */
  public get<K extends DK | OK, TH2 extends boolean | undefined = TH>(
    value: I[K],
    {
      key = this.defaultKey as K,
      fromIndex = 0,
      throwUnknown = this._throwUnknown,
    }: { key?: K; fromIndex?: number; throwUnknown?: TH2 } = {}
  ): TH2 extends true ? I : I | undefined {
    const index = this.getIndex(value, { key, fromIndex });

    if (throwUnknown && index === -1) {
      throw new Error(`'${value}' cannot be found in '${key}'.`);
    }

    return (index > -1 ? this[index] : undefined) as any;
  }

  /**
   * Returns the first item at which a given indexed value can be found in the array, or throws exception if it is not present.
   *
   * @param value is indexed value to search for.
   * @param options are options to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @param options.fromIndex is the index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns the first item with given indexed value in the array; `undefined` if not found.
   */
  public getSure<K extends DK | OK>(value: I[K], { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}): I {
    return this.get(value, { key, fromIndex, throwUnknown: true });
  }

  /**
   * Returns the first item at which a given indexed value can be found in the array. Returns `undefined` if value cannot be found.
   *
   * @param value is indexed value to search for.
   * @param options are options to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @param options.fromIndex is the index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns is the first item with given indexed value in the array; `undefined` if not found.
   */
  public getMaybe<K extends DK | OK>(
    value: I[K],
    { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}
  ): I | undefined {
    return this.get(value, { key, fromIndex, throwUnknown: false });
  }

  /**
   * Returns all items at which a given indexed value can be found in the array, or empty array if it is not present.
   *
   * @param value is indexed value to search for.
   * @param options are options to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @returns all items with given indexed value in the array; Empty array if not found.
   */
  public getAll<K extends DK | OK>(value: I[K], { key = this.defaultKey as K }: { key?: K } = {}): I[] {
    this.assertIndexEnabled();
    const allIndexes = this.getAllIndexes(value, { key });
    return allIndexes.map(index => this[index]);
  }

  /**
   * Determines whether an array includes a certain indexed value among its entries' keys, returning true or false as appropriate.
   *
   * @param value is indexed value to search for.
   * @param options are options to modify behaviour.
   * @param options.key is index field to look for value. Default lookup field is used if no key is provided.
   * @param options.fromIndex is the index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns true if indexed value is found among array's entries' keys.
   */
  public has<K extends DK | OK>(value: I[K], { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}): boolean {
    this.assertIndexEnabled();
    return this.getIndex(value, { key, fromIndex }) > -1;
  }

  /**
   * Sets value at path of the object, which is one of the entires of array. To update fields of the objects, this method should be used. Otherwise
   * index cannot be updated, because sub fileds are not tracked for chage detection.
   *
   * @param position is index of the item to be changed.
   * @param path is item's path where value to be changed at.
   * @param value is new value to be assigned.
   * @example
   * indexedArray[0].name = "DON'T DO THIS";  // WRONG: Sub fields (i.e. [0]."name") of the array is not watched, so index does not get updated.
   * indexedArray.set(0, "name", "OK"); // Index updated.
   *
   */
  public set(position: number, path: string, value: any): void {
    this.assertIndexEnabled();
    const oldItem = this[position];

    if (!oldItem || typeof oldItem !== "object") {
      throw new Error("Cannot set field value of undefined");
    }

    this.removeFromIndex(position);
    const newItem = set(this[position] as Record<string, any>, path, value);
    this.addToIndex(position, newItem as I);
  }

  /**
   * Disables indexing of the array. It may be used to disable temporarily
   * - to do heavy updates for performance reasons,
   * - to do operations in sub fields.
   * If indexing is not needed anymore, it is suggested to create a new native non-extended array and copy values into it
   * for avoiding performance penalty of proxy array used in this library.
   *
   * @see {IndexedArray#enableIndex} method.
   * @example
   * indexedArray.disableIndex();
   * indexedArray[0].name = "THIS IS OK NOW";
   * indexedArray.enableIndex(); // Index is recreated from scratch.
   */
  public disableIndex(): void {
    this.indexEnabled = false;
  }

  /**
   * Enables indexing and recreates index from scratch.
   *
   * @see {IndexedArray#disableIndex} method.
   */
  public enableIndex(): void {
    this.indexEnabled = true;
    this.clearIndex();
    this.addIndex();
  }
}
