export const isPrimitive = (value) => {
  if (value === null) {
    return true
  }

  if (['object', 'function'].includes(typeof value)) {
    return false
  }

  return true
}
