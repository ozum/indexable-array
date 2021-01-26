/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import IndexableArray from "../src/index";

class User {
  public id?: number;
  public name: string;

  public constructor(name: string, id?: number) {
    this.id = id;
    this.name = name;
  }

  public get plusOne(): number {
    return (this.id || 0) + 1;
  }
}

function getData(): User[] {
  return [new User("George", 1), new User("Lisa", 10), new User("George", 3)];
}

function ia() {
  return IndexableArray.from(getData(), "name", "id");
  // const b = IndexableArray.from(a, "id", "plusOne", "id");
}

function singleIa() {
  return IndexableArray.from(getData(), "name");
}

// function selfIa() {
//   return new IndexableArray(...getData()).addSelfIndex();
// }

// function selfPrimitiveIa() {
//   return IndexableArray.from([1, 3, 1]);
// }

describe("Indexable Array", () => {
  describe("instance", () => {
    it("should be an instance of Array.", () => {
      expect(Array.isArray(ia())).toBe(true);
    });

    it("should be equal to given array.", () => {
      expect([...ia()]).toEqual(getData());
    });

    it("should update sub values using set().", () => {
      const result = ia();
      result.set(0, "name", "Kevin");
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should throw if non existing item tried to be updated with set().", () => {
      expect(() => ia().set(99, "name", "Kevin")).toThrow("Cannot set field value of undefined");
    });

    it("should throw if non existing index tried to be get.", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => ia().get("XYZ", ({ key: "NON-EXISTING" } as unknown) as any)).toThrow("Key is not indexed");
    });

    it("should update sub values using set() even if sub field does not exists.", () => {
      const result = IndexableArray.from([{ id: 1 }, { id: 10, name: "Lisa" }, { id: 3, name: "George" }], "name");
      result.set(0, "name", "Kevin");
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should disable and enable index.", () => {
      const result = ia();
      result.disableIndex();
      result[0].name = "Kevin";
      result.enableIndex();
      expect(result.getAllIndexes("George")).toEqual([2]);
      expect(result.getAllIndexes("Kevin")).toEqual([0]);
    });

    it("should throw if index based operation is used while index is disabled.", () => {
      const result = ia();
      result.disableIndex();

      expect(() => result.getAllIndexes("Lisa")).toThrow("Index based operations cannot be used");
    });

    it("should return correct value for mixed (object & primitive) keys.", () => {
      const nameObject = { short: "L" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testData: { id?: number; name: string | Record<string, any> }[] = [
        { id: 1, name: "George" },
        { id: 2, name: nameObject },
        { id: 3, name: "George" },
      ];

      const result = IndexableArray.from(testData, "name", "id");

      expect(result.getIndex(nameObject)).toBe(1);
    });

    it("can change default index key.", () => {
      const result = ia().withDefaultIndex("id");
      expect(result.getIndex(1)).toBe(0);
    });

    it("should index getters.", () => {
      const result = IndexableArray.from(getData(), "plusOne");
      expect(result.getIndex(11)).toBe(1);
    });
  });

  describe("IndexableArray.from()", () => {
    it("should create new IndexableArray from normal array", () => {
      const result = IndexableArray.from(
        [
          { id: 1, name: "George" },
          { id: 10, name: "Lisa" },
          { id: 3, name: "George" },
        ],
        "name"
      );
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should create new IndexableArray from IndexableArray", () => {
      const result = IndexableArray.from(ia());
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should create new throwing IndexableArray from throwing IndexableArray", () => {
      const source = IndexableArray.throwingFrom(
        [
          { id: 1, name: "George" },
          { id: 10, name: "Lisa" },
          { id: 3, name: "George" },
        ],
        "name"
      );
      const result = IndexableArray.from(source);
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
      expect(() => result.get("XYZ")).toThrow("'XYZ' cannot be found in Object's name.");
    });
  });

  describe("IndexableArray.throwingFrom()", () => {
    it("should create new IndexableArray from normal array and throw for unknown values", () => {
      const result = IndexableArray.throwingFrom(
        [
          { id: 1, name: "George" },
          { id: 10, name: "Lisa" },
          { id: 3, name: "George" },
        ],
        "name"
      );
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
      expect(() => result.get("XYZ")).toThrow("'XYZ' cannot be found in Object's name.");
    });
  });

  describe("getIndex()", () => {
    it("should return index of value for default field.", () => {
      expect(ia().getIndex("George")).toBe(0);
    });

    it("should return -1 if default field is not found.", () => {
      expect(ia().getIndex("XYZ")).toBe(-1);
    });

    it("should return index of value for default field from given index.", () => {
      expect(ia().getIndex("George", { fromIndex: 1 })).toBe(2);
    });

    it("should return index of value for default field from given negative index.", () => {
      expect(ia().getIndex("George", { fromIndex: -2 })).toBe(2);
    });

    it("should return index of value for given field.", () => {
      expect(ia().getIndex(10, { key: "id" })).toBe(1);
    });

    it("should return -1 if value for given field is not found.", () => {
      expect(ia().getIndex(10, { key: "id" })).toBe(1);
    });

    it("should return index of value for given field from given index.", () => {
      expect(ia().getIndex("George", { key: "name", fromIndex: 1 })).toBe(2);
    });

    it("should return index of value for given field from given negative index.", () => {
      expect(ia().getIndex("George", { key: "name", fromIndex: -2 })).toBe(2);
    });

    it("should return index of value for default field with single field index.", () => {
      expect(singleIa().getIndex("George")).toBe(0);
    });
  });

  describe("get()", () => {
    it("should return value for default field.", () => {
      expect(ia().get("George")).toEqual({ name: "George", id: 1 });
    });

    it("should return undefined if default field is not found.", () => {
      expect(ia().get("XYZ")).toBeUndefined();
    });

    it("should return value for default field from given index.", () => {
      expect(ia().get("George", { fromIndex: 1 })).toEqual({ name: "George", id: 3 });
    });

    it("should return index of value for given field.", () => {
      expect(ia().get(10, { key: "id" })).toEqual({ id: 10, name: "Lisa" });
    });

    it("should return index of value for given field from given index.", () => {
      expect(ia().get("George", { key: "name", fromIndex: 1 })).toEqual({ name: "George", id: 3 });
    });

    it("should thrw for unknown result.", () => {
      expect(() => ia().get("XYZT", { throwUnknown: true })).toThrow("'XYZT' cannot be found in User's name.");
    });
  });

  describe("getSure()", () => {
    it("should throw for unknown result for named object.", () => {
      expect(() => ia().getSure("XYZT")).toThrow("'XYZT' cannot be found in User's name.");
    });

    it("should throw for unknown result for unnamed object.", () => {
      expect(() => IndexableArray.throwingFrom([{ name: "abc" }], "name").getSure("XYZT")).toThrow(
        "'XYZT' cannot be found in Object's name."
      );
    });

    it("should throw for unknown result for unnamed object 2.", () => {
      expect(() => IndexableArray.throwingFrom([] as any, "name" as any).getSure("XYZT")).toThrow("'XYZT' cannot be found in name.");
    });
  });

  describe("getMaybe()", () => {
    it("should return undefined for unknown result.", () => {
      expect(ia().getMaybe("XYZT")).toBeUndefined();
    });
  });

  describe("getAll()", () => {
    it("should return values for default field.", () => {
      expect(ia().getAll("George")).toEqual([
        { name: "George", id: 1 },
        { name: "George", id: 3 },
      ]);
    });

    it("should return empty array if default field is not found.", () => {
      expect(ia().getAll("XYZ")).toEqual([]);
    });

    it("should return index of value for given field.", () => {
      expect(ia().getAll(10, { key: "id" })).toEqual([{ id: 10, name: "Lisa" }]);
    });
  });

  describe("getAllIndexes()", () => {
    it("should return all indexes of value for default field.", () => {
      expect(ia().getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should return empty array for all indexes if default field not found.", () => {
      expect(ia().getAllIndexes("XYZ")).toEqual([]);
    });

    it("should return all indexes of value for given field.", () => {
      expect(ia().getAllIndexes("George", { key: "name" })).toEqual([0, 2]);
    });
  });

  describe("has", () => {
    it("should check existence of value for default field.", () => {
      expect(ia().has("Lisa")).toBe(true);
    });

    it("should check existence of value for given field.", () => {
      expect(ia().has(1, { key: "id" })).toBe(true);
    });
  });

  describe("map()", () => {
    it("should return IndexableArray with same indexes.", () => {
      const result = ia().map((user): { name: string } => ({ name: `X${user.name}` }));
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("XGeorge")).toEqual([0, 2]);
    });

    it("should return IndexableArray with same indexes (custom this argument).", () => {
      const result = ia().map((user): { name: string } => ({ name: `X${user.name}` }), {});
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("XGeorge")).toEqual([0, 2]);
    });

    it("should return IndexableArray with totally different indexes.", () => {
      const result = ia().map((user) => ({ xname: `X${user.name}` }), "xname");
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["xname"]));
      expect(result.getAllIndexes("XGeorge")).toEqual([0, 2]);
    });
  });

  describe("flatMap()", () => {
    it("should return IndexableArray with same indexes.", () => {
      const result = ia().flatMap((user) => [{ name: `X${user.name}` }]);
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("XGeorge")).toEqual([0, 2]);
    });

    it("should return IndexableArray with same indexes (custom this argument).", () => {
      const result = ia().flatMap((user) => [{ name: `X${user.name}` }], {});
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("XGeorge")).toEqual([0, 2]);
    });
  });

  describe("mapToArray()", () => {
    it("should return base array.", () => {
      const result = ia().mapToArray((user): { name: string } => ({ name: `X${user.name}` }));
      expect(result instanceof IndexableArray).toBeFalsy();
      expect(result instanceof Array).toBeTruthy();
      expect(() => (result as any).getAllIndexes(12)).toThrow("result.getAllIndexes is not a function");
    });
  });

  describe("filter()", () => {
    it("should return filtered array with same indexes.", () => {
      const result = ia().filter((user) => user.id && user.id >= 2);
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("George")).toEqual([1]);
    });

    // it("should filter array based on type.", () => {
    //   const localIa = IndexableArray<number | string>.from([1, "a"]).addIndex(Self);
    //   const isNumber = (i: any): i is string => typeof i === "string";
    //   const result = localIa.filter(isNumber);
    //   expect(result instanceof IndexableArray).toBeTruthy();
    //   expect(result.getIndex("a")).toEqual(0);
    // });
  });

  describe("slice()", () => {
    it("should return sliced array with same indexes.", () => {
      const result = ia().slice(0, 1);
      expect(result instanceof IndexableArray).toBeTruthy();
      expect(result.indexedKeys).toEqual(new Set(["id", "name"]));
      expect(result.getAllIndexes("George")).toEqual([0]);
    });
  });

  // describe("includes()", () => {
  //   it("should use binary search if array has self index.", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.includes(1)).toBeTruthy();
  //   });

  //   it("should use binary search if array has self index (with from index).", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.includes(1, 1)).toBeTruthy();
  //   });

  //   it("should use parent method if array does not have self index.", () => {
  //     const result = primitiveIa();
  //     expect(result.includes(1)).toBeTruthy();
  //   });
  // });

  // describe("indexOf()", () => {
  //   it("should use binary search if array has self index.", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.indexOf(1)).toBe(0);
  //   });

  //   it("should use binary search if array has self index (with from index).", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.indexOf(1, 1)).toBe(2);
  //   });

  //   it("should use parent method if array does not have self index.", () => {
  //     const result = primitiveIa();
  //     expect(result.indexOf(1)).toBe(0);
  //   });
  // });

  // describe("lastIndexOf()", () => {
  //   it("should use binary search if array has self index.", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.lastIndexOf(1)).toBe(2);
  //   });

  //   it("should use binary search if array has self index (with from index).", () => {
  //     const result = selfPrimitiveIa();
  //     expect(result.lastIndexOf(1, 1)).toBe(0);
  //   });

  //   it("should use parent method if array does not have self index.", () => {
  //     const result = primitiveIa();
  //     expect(result.lastIndexOf(1)).toBe(2);
  //   });
  // });

  describe("concatIndexed()", () => {
    it("should concat given items and preserve same indexes as source.", () => {
      const result = ia().concat(new User("George", 102));
      expect(result.getAllIndexes("George")).toEqual([0, 2, 3]);
    });
  });

  describe("push()", () => {
    it("should add given values.", () => {
      const result = ia();
      result.push(new User("Mia", 9), new User("Mia", 10));
      expect([...result]).toEqual([...getData(), { name: "Mia", id: 9 }, { name: "Mia", id: 10 }]);
      expect(result.getAllIndexes("Mia")).toEqual([3, 4]);
    });

    it("should add given value even with a missing indexed fields.", () => {
      const result = ia();
      result.push(new User("Mia"));
      expect(result.getIndex(undefined, { key: "id" })).toBe(3);
    });
  });

  describe("pop()", () => {
    it("should remove last value.", () => {
      const result = ia();
      result.pop();
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 10, name: "Lisa" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0]);
    });

    // it("should remove last value for self Indexable Array.", () => {
    //   const result = selfIa();
    //   result.pop();
    //   expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 10, name: "Lisa" }]);
    //   expect(result.getIndex(result[1])).toEqual(1);
    // });

    // it("should return index of self indexed data for default value", () => {
    //   const result = selfIa();
    //   expect(result.getIndex(result[0])).toBe(0);
    // });
  });

  describe("shift()", () => {
    it("should remove first value.", () => {
      const result = ia();
      result.shift();
      expect([...result]).toEqual([
        { id: 10, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([1]);
    });
  });

  describe("unshift()", () => {
    it("should add first value.", () => {
      const result = ia();
      result.unshift(new User("Mia", 9), new User("Mia", 10));
      expect([...result]).toEqual([
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 1, name: "George" },
        { id: 10, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([2, 4]);
    });
  });

  describe("length", () => {
    it("should handle increase.", () => {
      const result = ia();
      result.length = 4;
      expect([...result]).toEqual([{ id: 1, name: "George" }, { id: 10, name: "Lisa" }, { id: 3, name: "George" }, undefined]);
      expect(result.getAllIndexes("George")).toEqual([0, 2]);
    });

    it("should handle decrease.", () => {
      const result = ia();
      result.length = 2;
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 10, name: "Lisa" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0]);
    });
  });

  describe("splice()", () => {
    it("should remove elements.", () => {
      const result = ia();
      result.splice(0, 1);
      expect([...result]).toEqual([
        { id: 10, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([1]);
    });

    it("should add elements.", () => {
      const result = ia();
      result.splice(1, 0, new User("Mia", 9), new User("Mia", 10), new User("George", 11));
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 11, name: "George" },
        { id: 10, name: "Lisa" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0, 3, 5]);
    });

    it("should remove and add elements.", () => {
      const result = ia();
      result.splice(1, 1, new User("Mia", 9), new User("Mia", 10), new User("George", 11));
      expect([...result]).toEqual([
        { id: 1, name: "George" },
        { id: 9, name: "Mia" },
        { id: 10, name: "Mia" },
        { id: 11, name: "George" },
        { id: 3, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([0, 3, 4]);
    });

    it("should disable and recreate index if operations coverage are above threshold", () => {
      const result = ia();
      result.splice(0);
      expect([...result]).toEqual([]);
      expect(result.getAllIndexes("George")).toEqual([]);
    });

    it("should not disable index if operations coverage are below threshold", () => {
      const result = IndexableArray.from(
        [
          { id: 1, name: "Mia" },
          { id: 2, name: "Mia" },
          { id: 3, name: "George" },
          { id: 4, name: "Mia" },
          { id: 5, name: "Sam" },
          { id: 6, name: "Mia" },
        ],
        "name"
      );
      result.splice(5, 1);

      expect([...result]).toEqual([
        { id: 1, name: "Mia" },
        { id: 2, name: "Mia" },
        { id: 3, name: "George" },
        { id: 4, name: "Mia" },
        { id: 5, name: "Sam" },
      ]);

      expect(result.getAllIndexes("Mia")).toEqual([0, 1, 3]);
    });
  });

  describe("reverse()", () => {
    it("should reverse array.", () => {
      const result = ia();
      result.push(new User("Mia", 9));
      result.reverse();
      expect([...result]).toEqual([
        { id: 9, name: "Mia" },
        { id: 3, name: "George" },
        { id: 10, name: "Lisa" },
        { id: 1, name: "George" },
      ]);
      expect(result.getAllIndexes("George")).toEqual([1, 3]);
    });
  });
});

describe("delete", () => {
  it("should delete element.", () => {
    const result = ia();
    delete result[1];
    expect([...result]).toEqual([{ id: 1, name: "George" }, undefined, { id: 3, name: "George" }]);
    expect(result.getAllIndexes("George")).toEqual([0, 2]);
  });
});

describe("copyWithin()", () => {
  it("should copy elements.", () => {
    const result = ia();
    result.copyWithin(0, 1, 2);
    expect([...result]).toEqual([
      { id: 10, name: "Lisa" },
      { id: 10, name: "Lisa" },
      { id: 3, name: "George" },
    ]);
    expect(result.getAllIndexes("Lisa")).toEqual([0, 1]);
    expect(result.getAllIndexes("George")).toEqual([2]);
  });
});

describe("fill()", () => {
  it("should fill elements.", () => {
    const result = ia();
    result.fill(new User("Mia", 9), 1, 3);
    expect([...result]).toEqual([
      { id: 1, name: "George" },
      { id: 9, name: "Mia" },
      { id: 9, name: "Mia" },
    ]);
    expect(result.getAllIndexes("Mia")).toEqual([1, 2]);
    expect(result.getAllIndexes("George")).toEqual([0]);
  });
});

describe("assignment()", () => {
  it("should change value of assigned item.", () => {
    const result = ia();
    result[0] = new User("Mia", 9);
    expect([...result]).toEqual([
      { id: 9, name: "Mia" },
      { id: 10, name: "Lisa" },
      { id: 3, name: "George" },
    ]);
    expect(result.getAllIndexes("Mia")).toEqual([0]);
    expect(result.getAllIndexes("George")).toEqual([2]);
  });

  it("should add value of non-existing item.", () => {
    const result = ia();
    result[5] = new User("Mia", 9);
    expect([...result]).toEqual([
      { id: 1, name: "George" },
      { id: 10, name: "Lisa" },
      { id: 3, name: "George" },
      undefined,
      undefined,
      { id: 9, name: "Mia" },
    ]);
    expect(result.getAllIndexes("Mia")).toEqual([5]);
    expect(result.getAllIndexes("George")).toEqual([0, 2]);
  });
});

describe("sort()", () => {
  it("should sort and update indexes.", () => {
    const result = ia()
      .sort((a, b) => (a.id || 0) - (b.id || 0))
      .getAllIndexes("George");

    expect(result).toEqual([0, 1]);
  });
});

describe("sortBy()", () => {
  it("should sort by given key and update indexes.", () => {
    const result = ia().sortBy("id").getAllIndexes("George");

    expect(result).toEqual([0, 1]);
  });

  it("should sort by default key and update indexes.", () => {
    const result = ia().sortBy();
    expect(result.getAllIndexes("George")).toEqual([0, 1]);
  });

  // it("should sort by self and update indexes.", () => {
  //   const result = primitiveIa().sortBy();
  //   expect(result).toEqual([1, 1, 3]);
  // });
});

describe("Cross Assignment", () => {
  class A {
    public constructor(args: any) {
      this.name = args.name;
      this.surname = args.surname;
    }

    public name: string;
    public surname: string;
    public options: Record<string, any> = {};
  }
  class SubA extends A {
    public constructor(args: any) {
      super(args);
      this.age = args.age;
    }

    public age: number;
  }

  it("should assign sub class to parent type.", () => {
    // const b1 = IndexableArray.from([new SubA({ name: "a", age: 20 })]) as IndexableArray<SubA, "name", "name" | "surname">;

    const b1 = IndexableArray.from([new SubA({ name: "a", age: 20 })], "name", "surname");

    const o: A = new SubA({ name: "j" });
    const b0 = ([] as unknown) as IndexableArray<SubA, "name", "surname">;

    const nb1 = [new SubA({ name: "hj" })];
    const b2: IndexableArray<A, "name", "surname"> = b1;

    const b3 = IndexableArray.from(b1);

    const nb2: A[] = nb1;
    const nb3: A[] = b1;

    const zz = IndexableArray.from([{ name: "js", surname: "d", age: 12 }], "name", "surname");
    const zz2 = IndexableArray.from(zz);

    expect(b1).toBe(b2);
    expect(nb1).toBe(nb2);
    expect(nb3).toBe(b1);
  });

  it("should map sub classses.", () => {
    const a = new Set([
      { name: "oz", sur: 2 },
      { name: "al", sur: 2 },
    ]);
    const b = IndexableArray.from(a, "name");

    const c1 = b.map((e) => ({ fn: e.name, za: 3, name: "j" }));
    const c2 = b.map((e) => ({ fn: e.name, za: 3, name: "j" }), {});
    const c3 = b.map((e) => ({ fn: e.name, za: 3 }), "za");
    const c4 = b.map((e) => ({ fn: e.name, za: 3 }), "za", "fn");
    const c5 = b.map((e) => ({ fn: e.name, za: 3 }), {}, "za");
    const c6 = b.map((e) => ({ fn: e.name, za: 3 }), {}, "za", "fn");

    const fc1 = b.flatMap((e) => ({ fn: e.name, za: 3, name: "j" }));
    const fc2 = b.flatMap((e) => ({ fn: e.name, za: 3, name: "j" }), {});
    const fc3 = b.flatMap((e) => ({ fn: e.name, za: 3 }), "za");
    const fc4 = b.flatMap((e) => ({ fn: e.name, za: 3 }), "za", "fn");
    const fc5 = b.flatMap((e) => ({ fn: e.name, za: 3 }), {}, "za");
    const fc6 = b.flatMap((e) => ({ fn: e.name, za: 3 }), {}, "za", "fn");
    const fc7 = b.flatMap((e) => e.name);
    // const c2 = b.map2(e => ({ fn: e.name, za: 3, name: "j" }), "za");

    const z = b.concat([{ name: "jjj", sur: 9 }]).get("jjj");

    const mul = IndexableArray.from(a, "name", "sur");
    const nm = mul.map((e) => ({ name: "x" }));
    const sc = mul.map((e) => e.name);

    const nm2 = mul.map((e) => ({ xyz: "x" }), "xyz");

    expect(1).toBe(1);
  });
});
