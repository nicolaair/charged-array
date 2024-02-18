import { describe, expect, test } from 'bun:test'
import { ChargedArray } from 'charged-array'
import { isPrimitive } from 'charged-array/utils/is_primitive'

const SECONDARY_INDEX = 'slug'

const ITEMS = [
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

export const commonCreator = (lengthLimit = ITEMS.length) => {
  const items = structuredClone(ITEMS)

  return lengthLimit >= 0 && lengthLimit < items.length ? items.slice(0, lengthLimit) : items
}

export const chargedCreator = (lengthLimit = ITEMS.length) => {
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

  test('has length', () => {
    const array = chargedCreator()

    expect(array.length).toBeGreaterThanOrEqual(0)
    expect(array.length).toBe(commonCreator().length)
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
