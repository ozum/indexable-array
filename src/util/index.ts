/* eslint-disable import/prefer-default-export */

export function arrify<T>(value?: T | T[]): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
