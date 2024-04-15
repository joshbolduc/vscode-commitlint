export function isNodeExceptionCode<T extends string>(
  e: unknown,
  code: T,
): e is NodeJS.ErrnoException & { code: T } {
  return !!(
    e &&
    typeof e === 'object' &&
    (e as NodeJS.ErrnoException).code === code
  );
}
