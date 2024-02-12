import { describe, expect, test } from 'bun:test'
import { ChargedArray } from '.'

const SECONDARY_KEY = 'slug'
const MOCK = [
  { slug: 'first' },
  { slug: 'second' },
  { slug: 'third' },
  { id: 'fourth' },
  { slug: 'fifth' },
  'sixth',
  { slug: 'seventh' },
  { slug: 'first' },
  { slug: 'first' },
  10
]

const commonCreator = (lengthLimit = MOCK.length) => {
  return lengthLimit >= 0 && lengthLimit < MOCK.length
    ? structuredClone(MOCK).slice(0, lengthLimit)
    : structuredClone(MOCK)
}

const chargedCreator = (lengthLimit = MOCK.length) => {
  return new ChargedArray({
    secondaryKey: SECONDARY_KEY,
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
    console.log('###', array.secondaryKey, array)

    return expect(array.at(0)[array.secondaryKey]).toBe('first')
  })

  test('has secondaryKey', () => {
    expect(chargedCreator().secondaryKey).toBe(SECONDARY_KEY)
  })

  test('has relations', () => {
    const { secondaryKey, relations } = chargedCreator()

    expect(relations).toStrictEqual(
      commonCreator().reduce(function (accumulator, item, index) {
        if (Object.hasOwn(item, secondaryKey)) {
          if (Object.hasOwn(accumulator, item[secondaryKey])) {
            accumulator[item[secondaryKey]].push(index)
          } else {
            accumulator[item[secondaryKey]] = [index]
          }
        }

        return accumulator
      }, {})
    )
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

    return expect(array.splice(0, 1, ...chargedCreator(3)).at(-1)[array.secondaryKey]).toBe('third')
  })
})

describe('map', () => {
  test('change one field from items', () => {
    const array = chargedCreator()
    const newArray = array.map((item) => {
      if (typeof array !== 'object' || !array[array.secondaryKey]) {
        return item
      }

      return { ...item, name: array[array.secondaryKey] }
    })

    expect(newArray.some((item, index) => item.name === array[index][array.secondaryKey])).toBeTrue()
  })

  test('index and inner array are abble', () => {
    chargedCreator().map((item, index, array) => {
      expect(item).toStrictEqual(array[index])

      return item
    }, {})
  })
})

describe('get', () => {
  test('by key', () => {
    const array = chargedCreator()

    expect(array.get('fifth')).toStrictEqual(array[4])
  })
})
