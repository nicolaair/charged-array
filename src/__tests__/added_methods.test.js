import { describe, expect, test } from 'bun:test'
import { chargedCreator } from './index.test'

describe('add', () => {
  test('by default key', () => {
    const array = chargedCreator()
    const key = array.secondaryIndex
    const value = { [key]: 'bar' }

    array.add(value)

    expect(array.get(value[key])).toStrictEqual(value)
  })

  test('by custom key', () => {
    const array = chargedCreator()
    const key = 'foo'
    const value = 'bar'

    array.add(value, key)

    expect(array.get(key)).toBe(value)
  })
})

describe('set', () => {
  test('by default key', () => {
    const array = chargedCreator()
    const key = array.secondaryIndex
    const value = { [key]: 'bar' }

    array.set(null, value)

    expect(array.get(value[key])).toBe(value)
  })

  test('by custom key', () => {
    const array = chargedCreator()
    const key = 'foo'
    const value = 'bar'

    array.set(key, value)

    expect(array.get(key)).toBe(value)
  })

  test('by custom key over multiple', () => {
    const array = chargedCreator()
    const key = 'first'
    const value = `new value for ${key} key`
    const initialValuesByKey = array.getAll(key)
    const updatedValuesByKey = array.set(key, value).getAll(key)

    expect(updatedValuesByKey).not.toStrictEqual(initialValuesByKey)
    expect(updatedValuesByKey).toStrictEqual([value])
  })
})

describe('has', () => {
  test('by known key', () => {
    const array = chargedCreator()

    expect(array.has('fifth')).toBeTrue()
  })

  test('by unknown key', () => {
    const array = chargedCreator()

    expect(array.has('eleven')).toBeFalse()
  })
})

describe('get', () => {
  test('by known key', () => {
    const array = chargedCreator()

    expect(array.get('fifth')).toStrictEqual(array.at(4))
  })

  test('by unknown key', () => {
    const array = chargedCreator()

    expect(array.get('eleven')).toBeUndefined()
  })
})

describe('get all', () => {
  test('by known key', () => {
    const array = chargedCreator()
    const key = 'first'

    expect(array.getAll(key)).toStrictEqual(array.filter(item => item[array.secondaryIndex] === key))
  })

  test('by unknown key', () => {
    const array = chargedCreator()
    const key = 'eleven'

    expect(array.getAll(key)).toBeEmpty()
  })
})
