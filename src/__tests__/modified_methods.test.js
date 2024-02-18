import { describe, expect, test } from 'bun:test'
import { chargedCreator, commonCreator } from './index.test'

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

describe('push', () => {
  test('primitive', () => {
    const array = chargedCreator(0)
    const item = 'new primitive value'

    array.push(item)

    return expect(array.at(0)).toBe(item)
  })

  test('object', () => {
    const array = chargedCreator(0)
    const item = commonCreator(1).at(0)

    array.push(item)

    return expect(array.at(0)).toStrictEqual(item)
  })

  test('multiple', () => {
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
