declare module "sorted-array-functions" {
  function add<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): void;
  function remove<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): boolean;
  function has<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): boolean;
  function eq<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): number;
  function gte<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): number;
  function gt<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): number;
  function lte<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): number;
  function lt<T>(input: T[], value: T, compare?: (a: T, B: T) => boolean): number;
}
