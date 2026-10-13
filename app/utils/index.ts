/**
 * Returns a random integer between `min` and `max` (inclusive).
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer in the range [min, max].
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Returns a random element from the given array.
 * @param array - The array to pick from.
 * @returns A randomly selected element.
 */
export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
