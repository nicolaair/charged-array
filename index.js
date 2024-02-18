import { isPrimitive } from './utils/is_primitive'

export class ChargedArray extends Array {
  #secondaryIndex
  #indexRelations = {}

  constructor (config) {
    super()
    this.#secondaryIndex = config.secondaryIndex ?? 'id'

    if (!config.items) {
      return (...items) => {
        this.push(...items)

        return this
      }
    } else if (config.items.length > 0) {
      this.push(...config.items)
    }
  }

  push (...items) {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i]

      this.add(item, item?.[this.#secondaryIndex])
    }

    return this.length
  }

  splice (start, deleteCount = this.length - start, ...items) {
    const newArray = new ChargedArray({ secondaryIndex: this.#secondaryIndex })()

    if (typeof start === 'undefined') {
      return newArray
    }

    const clonedState = [...this]

    newArray.push(...clonedState.splice(start, deleteCount))
    newArray.push(...items)

    this.length = 0
    this.#indexRelations = {}
    this.push(...clonedState)

    return newArray
  }

  // TODO second argument
  map (callback) {
    const array = new ChargedArray({ secondaryIndex: this.#secondaryIndex })(this.length)

    for (let i = 0; i < this.length; ++i) {
      array[i] = callback(this[i], i, this)
    }

    return array
  }

  filter (callback) {
    const array = new ChargedArray({ secondaryIndex: this.#secondaryIndex })()

    for (let i = 0; i < this.length; ++i) {
      const item = this[i]

      if (callback(item, i, array)) {
        array.push(item)
      }
    }

    return array
  }

  has (key) {
    return !!this.#indexRelations[key]?.length
  }

  get (key) {
    return this[this.#indexRelations[key]]
  }

  getAll (...keys) {
    const array = new ChargedArray({ secondaryIndex: this.#secondaryIndex })()

    keys.flat().forEach(key => {
      const indexes = this.#indexRelations[key]
      if (indexes) {
        indexes.forEach(index => {
          array.add(this[index], key)
        })
      }
    })

    return array
  }

  add (item, key) {
    const lastIndex = super.push(item) - 1
    const relationKey = key ?? (isPrimitive(item) ? item : item?.[this.#secondaryIndex])

    if (relationKey) {
      (this.#indexRelations[relationKey] ??= []).push(lastIndex)
    }

    return this
  }

  set (key, item) {
    const indexes = this.#indexRelations[key]

    if (indexes) {
      indexes.forEach(index => {
        this.splice(index, 1)
      })

      delete this.#indexRelations[key]
    }

    this.add(item, key)

    return this
  }

  delete (...keys) {
    const indexes = keys.flat().map(key => this.#indexRelations[key])

    indexes.forEach(index => {
      const item = this.splice(index, 1)

      if (Object.hasOwn(item, this.#secondaryIndex) && Object.hasOwn(this.#indexRelations, item[this.#secondaryIndex])) {
        this.#indexRelations[item[this.#secondaryIndex]].forEach(key => {
          if (index === key) {
            this.#indexRelations[item[this.#secondaryIndex]].splice(index, 1)
          }
        })

        if (!this.#indexRelations[item[this.#secondaryIndex]].length) {
          delete this.#indexRelations[item[this.#secondaryIndex]]
        }
      }
    })

    return this
  }

  get secondaryIndex () {
    return this.#secondaryIndex
  }

  get indexRelations () {
    return this.#indexRelations
  }
}
