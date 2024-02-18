import { describe, expect, test } from 'bun:test'
import { ChargedArray } from '.'
import { isPrimitive } from './utils/is_primitive'

const SECONDARY_INDEX = 'slug'
const MOCK = [
  { slug: 'first', name: 'first 1' },
  { slug: 'second' },
  { slug: 'third' },
  { id: 'fourth' },
  { slug: 'fifth' },
  'sixth',
  { slug: 'seventh' },
  { slug: 'first', name: 'first 2' },
  { slug: 'first', name: 'first 3' },
  10
]

const commonCreator = (lengthLimit = MOCK.length) => {
  return lengthLimit >= 0 && lengthLimit < MOCK.length
    ? structuredClone(MOCK).slice(0, lengthLimit)
    : structuredClone(MOCK)
}

const chargedCreator = (lengthLimit = MOCK.length) => {
  return new ChargedArray({
    secondaryIndex: SECONDARY_INDEX,
    items: commonCreator(lengthLimit)
  })
}

describe('instance', () => {
  test('is charged array', () => {
    return expect(chargedCreator()).toBeInstanceOf(ChargedArray)
  })

  test('is extend array', () => {
    return expect(chargedCreator()).toBeInstanceOf(Array)
  })

  test('has item passed from constructor', () => {
    const array = chargedCreator()

    return expect(array.at(0)[array.secondaryIndex]).toBe('first')
  })

  test('has secondary index', () => {
    expect(chargedCreator().secondaryIndex).toBe(SECONDARY_INDEX)
  })

  test('has index relations', () => {
    const { secondaryIndex, indexRelations } = chargedCreator()

    const expected = commonCreator().reduce(function (accumulator, item, index) {
      const relationKey = isPrimitive(item) ? item : item?.[secondaryIndex]
      if (relationKey) {
        (accumulator[relationKey] ??= []).push(index)
      }

      return accumulator
    }, {})

    expect(indexRelations).toStrictEqual(expected)
  })
})

describe('push', () => {
  test('one item', () => {
    const array = chargedCreator(0)
    const item = commonCreator(1).at(0)

    array.push(item)

    return expect(array.at(0)).toStrictEqual(item)
  })

  test('multiple items', () => {
    const array = chargedCreator(0)
    const items = commonCreator()

    array.push(...items)

    return expect(array).toStrictEqual(items)
  })

  test('returned new length', () => {
    const commonLengthLimit = 3
    const array = chargedCreator(commonLengthLimit)
    const newLength = array.push(...array)

    return expect(newLength).toBe(commonLengthLimit * 2)
  })
})

describe('splice', () => {
  test('without arguments', () => {
    const array = chargedCreator()

    array.splice()

    return expect(array).toStrictEqual(commonCreator())
  })

  test('from start to end', () => {
    return expect(chargedCreator().splice(1)).toStrictEqual(commonCreator().splice(1))
  })

  test('from start to count limit', () => {
    return expect(chargedCreator().splice(2, 4)).toStrictEqual(commonCreator().splice(2, 4))
  })

  test('with items', () => {
    const array = chargedCreator()

    return expect(array.splice(0, 1, ...chargedCreator(3)).at(-1)[array.secondaryIndex]).toBe('third')
  })
})

describe('map', () => {
  test('change one field from items', () => {
    const array = chargedCreator()
    const newArray = array.map((item) => {
      if (typeof array !== 'object' || !array[array.secondaryIndex]) {
        return item
      }

      return { ...item, name: array[array.secondaryIndex] }
    })

    expect(newArray.some((item, index) => item.name === array[index][array.secondaryIndex])).toBeTrue()
  })

  test('index and inner array are abble', () => {
    chargedCreator().map((item, index, array) => {
      expect(item).toStrictEqual(array[index])

      return item
    }, {})
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
    const initialValuesByKey = structuredClone(array.getAll(key))
    const updatedValuesByKey = array.set(key, value).getAll(key)

    expect(updatedValuesByKey).not.toStrictEqual(initialValuesByKey)
    expect(updatedValuesByKey).toStrictEqual([value])
  })
})
