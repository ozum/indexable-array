/* eslint-disable @typescript-eslint/no-explicit-any, class-methods-use-this, no-dupe-class-members */

import sorted from "sorted-array-functions";
import set from "lodash.set";

export const Self = "$$self";

type IndexKey<I> = keyof I | typeof Self;
type IndexValue<I, K extends IndexKey<I>> = K extends keyof I ? I[K] : I;

interface IndexConfig<I, DK extends IndexKey<I>> {
  key: IndexKey<I> | (IndexKey<I>)[];
  defaultKey?: DK;
}

type PrimitiveLookups<I, K = IndexKey<I>> = Map<K, Map<K extends keyof I ? I[K] : I, number[]>>;
type ObjectLookups<I, K = IndexKey<I>, O extends Record<string, any> = K extends keyof I ? I[K] : I> = Map<K, WeakMap<O, number[]>>;

const addedProperties = new Set(["primitiveLookups", "objectLookups", "indexedKeys", "defaultKey", "indexEnabled", "operationAtEnd"]);

/**
 * Extended native array class to access array elements by fast key lookups using binary search. Used for storing objects.
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
export default class IndexableArray<I extends any, DK extends IndexKey<I> = IndexKey<I>> extends Array<I> {
  private readonly primitiveLookups: PrimitiveLookups<I> = new Map();
  private readonly objectLookups: ObjectLookups<I> = new Map();
  public readonly indexedKeys: Set<keyof I> = new Set();
  private readonly builtIndexKeys: Set<keyof I> = new Set();
  private defaultKey?: IndexKey<I>;
  private indexEnabled: boolean = false;
  private operationAtEnd: boolean = false;

  /**
   * Creates an `IndexableArray` instance from given items.
   * @param   {...*} items - Items to create `IndexableArray` from.
   */
  public constructor(...items: I[]) {
    super(...items);

    addedProperties.forEach(property => Object.defineProperty(this, property, { writable: true, enumerable: false })); // Make added fields non-enumerable.

    return new Proxy(this, {
      set: <T>(target: IndexableArray<T>, property: number, value: T): boolean => target.setProperty(property, value),
      deleteProperty: <T>(target: IndexableArray<T>, property: number): boolean => target.deleteProperty(property),
    });
  }

  public static from<T>(arrayLike: Iterable<T> | ArrayLike<T>): IndexableArray<T>;
  public static from<T, U>(arrayLike: Iterable<T> | ArrayLike<T>, mapFn?: (v: T, k: number) => U, thisArg?: any): IndexableArray<U>;
  /**
   * Creates a new, shallow-copied `IndexableArray` instance from an array-like or iterable object. If source is also `IndexableArray`,
   * returned `IndexableArray` will have same indexed keys.
   * @param   {Iterable|ArrayLike}  arrayLike   - An array-like or iterable object to convert to an array.
   * @param   {Function}            [mapFn]     - Map function to call on every element of the array.
   * @param   {*}                   [thisArg]   - Value to use as this when executing mapFn.
   * @returns {IndexableArray}                  - A new `IndexableArray` instance.
   */
  public static from<T, U>(
    arrayLike: Iterable<T> | ArrayLike<T>,
    mapFn?: (v: T, k: number) => U,
    thisArg?: any
  ): IndexableArray<T> | IndexableArray<U> {
    const array = mapFn ? Array.from(arrayLike, mapFn, thisArg) : super.from(arrayLike);
    const indexableArray = new IndexableArray(...array) as IndexableArray<T> | IndexableArray<U>;

    if (arrayLike instanceof IndexableArray) {
      arrayLike.indexedKeys.forEach(key => indexableArray.addIndex((key as unknown) as any));
    }
    return indexableArray;
  }

  /**
   * Clears index by emptying related index fields.
   * @private
   */
  private clearIndex(): void {
    this.indexedKeys.forEach(key => {
      this.primitiveLookups.set(key, new Map());
      this.objectLookups.set(key, new WeakMap() as WeakMap<Record<string, any>, number[]>);
      this.builtIndexKeys.delete(key);
    });
  }

  /**
   * Adds given keys to the index.
   * @param   {...string|Self}  keys  - List of keys to add to index.
   * @returns {this}                  - This object.
   */
  public addIndex(...indexKeys: IndexKey<I>[]): this {
    const keys = indexKeys.length === 0 ? Array.from(this.indexedKeys) : indexKeys;
    const addedIndexKeys: IndexKey<I>[] = [];
    this.indexEnabled = true;
    this.operationAtEnd = true;

    if (!this.defaultKey) {
      [this.defaultKey] = keys;
    }

    keys.forEach(key => {
      if (!this.builtIndexKeys.has(key)) {
        this.primitiveLookups.set(key, new Map());
        this.objectLookups.set(key, new WeakMap() as WeakMap<Record<string, any>, number[]>);
        this.indexedKeys.add(key);
        this.builtIndexKeys.add(key);
        addedIndexKeys.push(key);
      }
    });

    this.forEach((item, position) => this.addToIndex(position, item, addedIndexKeys));
    this.operationAtEnd = false;
    return this;
  }

  /**
   * Adds `Self` (whole object) to index.
   * @returns {this}    - This object.
   * @example
   * const users = new IndexableArray([{ id: 1, name: "George" }, { id: 2, name: "Lisa" }]).addSelfIndex();
   * const newUser = { id: 3, name: "George" };
   * users.push(newUser);
   * users.getIndex(newUser); // 2;
   */
  public addSelfIndex(): this {
    return this.addIndex(Self);
  }

  /**
   * Returns either `objectLookup` or `primitiveLookup` based on given `field` and `value`
   * @param   {string}  key                               - Array item's field to get lookup for.
   * @param   {*}       value                               - Value stored in that field. (Used for selecting primitve or object lookup)
   * @returns {Map.<*,number[]>|WeakMap.<Object,number[]>}   - Lookup. Map with keys are lookup-values, values are indexes of those values.
   * @private
   */
  private getLookup<K extends IndexKey<I>>(key: K, value: IndexValue<I, K>): Map<any, number[]> | WeakMap<any, number[]> {
    if (!this.indexedKeys.has(key)) {
      throw new Error(`Key is not indexed: ${key}`);
    }

    const lookups = typeof value === "object" ? this.objectLookups : this.primitiveLookups;
    const lookup = lookups.get(key) as Map<any, number[]> | WeakMap<any, number[]>;

    return lookup;
  }

  private getItemValue<K extends IndexKey<I>>(item: I, key: K): IndexValue<I, K> {
    const value = key === Self ? item : item[key];
    return value as IndexValue<I, K>;
  }

  /**
   * Adds index into lookup for given field. Also creates lookup if it does not exists.
   * @param   {number}    position                - Position of item which holds the value for the given field.
   * @param   {Object}    item                    - Item to add to index.
   * @param   {string[]}  [keys=this.indexedKeys] - Fields to add lookup. (i.e. "name")
   * @returns {void}
   * @private
   */
  private addToIndex(position: number, item: I, keys: IndexKey<I>[] = Array.from(this.indexedKeys)): void {
    keys.forEach(key => {
      const value = this.getItemValue(item, key);
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
   * @param   {Object}    item                    - Item to add to index.
   * @param   {number}    position                - Position of item which holds the value for the given field.
   * @param   {string[]}  [keys=this.indexedKeys] - Fields to add lookup. (i.e. "name")
   * @returns {void}
   * @private
   */
  private removeFromIndex(position: number, keys: IndexKey<I>[] = Array.from(this.indexedKeys)): void {
    const item = this[position];
    keys.forEach(key => {
      const value = this.getItemValue(item, key);
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
   * @param   {}          property  - The name or Symbol of the property to set.
   * @param   {}          newItem   - The new value of the property to set.
   * @returns {boolean}             - Whether that assignment succeeded
   * @private
   */
  private setProperty(property: keyof this, newItem: any): boolean {
    if (this.indexEnabled && !addedProperties.has(property as string)) {
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
   * @param   {}          property  - The name or Symbol of the property to delete.
   * @returns {boolean}             - Whether delete operation succeeded
   * @private
   */
  private deleteProperty<T extends IndexableArray<I>>(this: T, property: keyof T): boolean {
    const position = parseInt(property as string, 10);

    if (position !== undefined && this.indexEnabled) {
      this.removeFromIndex(position);
    }

    delete this[property];
    return true;
  }

  /**
   * Returns positive index from start for given positive or negative index. Negative index is used for indexing from the end of array.
   * @param   {number}  index   - Index to get positive for.
   * @returns {number}          - Positive index for given index.
   * @example
   * const indexedArray = IndexedArray.create({ id: 98 }, { id: 43 }, { id: 34 }, { id: 23 });
   * indexedArray.positiveIndexOf(-1); // 3
   * indexedArray.positiveIndexOf(1); // 1
   * @private
   */
  private positiveIndexOf(index: number): number {
    return index >= 0 ? index : Math.max(0, this.length + index);
  }

  /**
   * Throws error if an index based operation is accessed when index is disabled.
   * @throws {Error} - Access error.
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
      this.indexEnabled = false;
      const result = super.splice(start, deleteCount, ...items);
      this.indexEnabled = true;
      this.clearIndex();
      this.addIndex();
      return result;
    }

    return super.splice(start, deleteCount, ...items);
  }

  public setDefaultIndex(key: IndexKey<I>): this {
    this.defaultKey = key;
    return this;
  }

  /**
   * Returns the first index at which a given indexed value can be found in the array, or -1 if it is not present.
   * @param   {*}       value               - Indexed value to search for.
   * @param   {Object}  [options]           - Options
   * @param   {string}  [options.key]       - Index field to look for value. Default lookup field is used if no key is provided.
   * @param   {number}  [options.fromIndex] - The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns {number}                      - The first index of the element in the array; -1 if not found.
   */
  public getIndex<K extends IndexKey<I> = DK>(
    value: IndexValue<I, K>,
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
   * @param   {*}         value               - Indexed value to search for.
   * @param   {Object}    [options]           - Options
   * @param   {string}    [options.key]       - Index field to look for value. Default lookup field is used if no key is provided.
   * @returns {number[]}                      - All indexes of the element in the array; Empty array if not found.
   */
  // public getAllIndexes(value: any, { key = this.defaultKey }: { key?: IndexKey<I> } = {}): number[] {
  public getAllIndexes<K extends IndexKey<I> = DK>(value: IndexValue<I, K>, { key = this.defaultKey as K }: { key?: K } = {}): number[] {
    this.assertIndexEnabled();
    return this.getLookup(key, value).get(value) || [];
  }

  /**
   * Returns the first item at which a given indexed value can be found in the array, or `undefined` if it is not present.
   * @param   {*}       value               - Indexed value to search for.
   * @param   {Object}  [options]           - Options
   * @param   {string}  [options.key]       - Index field to look for value. Default lookup field is used if no key is provided.
   * @param   {number}  [options.fromIndex] - The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns {Object|undefined}            - The first item with given indexed value in the array; `undefined` if not found.
   */
  public get<K extends IndexKey<I> = DK>(
    value: IndexValue<I, K>,
    { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}
  ): I | undefined {
    this.assertIndexEnabled();
    const index = this.getIndex(value, { key, fromIndex });
    return index > -1 ? this[index] : undefined;
  }

  /**
   * Returns all items at which a given indexed value can be found in the array, or empty array if it is not present.
   * @param   {*}         value               - Indexed value to search for.
   * @param   {Object}    [options]           - Options
   * @param   {string}    [options.key]       - Index field to look for value. Default lookup field is used if no key is provided.
   * @returns {number[]}                      - All items with given indexed value in the array; Empty array if not found.
   */

  public getAll<K extends IndexKey<I> = DK>(value: IndexValue<I, K>, { key = this.defaultKey as K }: { key?: K } = {}): I[] {
    this.assertIndexEnabled();
    const allIndexes = this.getAllIndexes(value, { key });
    return allIndexes.map(index => this[index]);
  }

  /**
   * Determines whether an array includes a certain indexed value among its entries' keys, returning true or false as appropriate.
   * @param   {*}       value               - Indexed value to search for.
   * @param   {Object}  [options]           - Options
   * @param   {string}  [options.key]       - Index field to look for value. Default lookup field is used if no key is provided.
   * @param   {number}  [options.fromIndex] - The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned, which means the array will not be searched. If the provided index value is a negative number, it is taken as the offset from the end of the array
   * @returns {boolean}                     - True if indexed value is found among array's entries' keys.
   */
  public has<K extends IndexKey<I> = DK>(
    value: IndexValue<I, K>,
    { key = this.defaultKey as K, fromIndex = 0 }: { key?: K; fromIndex?: number } = {}
  ): boolean {
    this.assertIndexEnabled();
    return this.getIndex(value, { key, fromIndex }) > -1;
  }

  /**
   * Sets value at path of the object, which is one of the entires of array. To update fields of the objects, this method should be used. Otherwise
   * index cannot be updated, because sub fileds are not tracked for chage detection.
   * @param   {number}  position  - Index of the item to be changed.
   * @param   {string}  path      - Item's path where value to be changed at.
   * @param   {*}       value     - New value to be assigned.
   * @returns {void}
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
   * @see {IndexedArray#disableIndex} method.
   */
  public enableIndex(): void {
    this.indexEnabled = true;
    this.clearIndex();
    this.addIndex();
  }
}
