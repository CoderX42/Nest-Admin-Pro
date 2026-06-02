export function stringifyBigInt<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'bigint') return input.toString() as unknown as T;
  if (Array.isArray(input)) return input.map(stringifyBigInt) as unknown as T;
  if (input instanceof Date) return input;

  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      out[key] = stringifyBigInt((input as Record<string, unknown>)[key]);
    }
    return out as T;
  }

  return input;
}
