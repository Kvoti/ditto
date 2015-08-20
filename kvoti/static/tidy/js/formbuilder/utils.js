export function inputValueToInt(value) {
  if (value === '') {
    return null;
  }
  let parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return value;
  }
  return parsed;
}
