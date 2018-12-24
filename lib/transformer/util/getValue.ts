export function getValue<T = any>(value: () => T) {
  try {
    return value();
  } catch (error) {}
}
