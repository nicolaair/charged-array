export class ChargedArray extends Array {
  #secondaryKey
  #relations = {}

  constructor (config) {
    super()
    this.#secondaryKey = config.secondaryKey ?? 'id'

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

      this.add(item, item?.[this.#secondaryKey])
    }

    return this.length
  }

  splice (start, deleteCount = this.length - start, ...items) {
    const newArray = new ChargedArray({ secondaryKey: this.#secondaryKey })()

    if (typeof start === 'undefined') {
      return newArray
    }

    const clonedState = [...this]

    newArray.push(...clonedState.splice(start, deleteCount))
    newArray.push(...items)

    this.length = 0
    this.#relations = {}
    this.push(...clonedState)

    return newArray
  }

  // TODO second argument
  map (callback) {
    const array = new ChargedArray({ secondaryKey: this.#secondaryKey })(this.length)

    for (let i = 0; i < this.length; ++i) {
      array[i] = callback(this[i], i, this)
    }

    return array
  }

  filter (callback) {
    const array = new ChargedArray({ secondaryKey: this.#secondaryKey })()

    for (let i = 0; i < this.length; ++i) {
      const item = this[i]

      if (callback(item, i, array)) {
        array.push(item)
      }
    }

    return array
  }

  has (key) {
    return !!this.#relations[key]?.length
  }

  get (key) {
    return this[this.#relations[key]]
  }

  getAll (...keys) {
    const array = new ChargedArray({ secondaryKey: this.#secondaryKey })()

    keys.flat().forEach(key => {
      const indexes = this.#relations[key]
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
    const relationKey = key ?? item?.[this.#secondaryKey]

    if (relationKey) {
      (this.#relations[relationKey] ??= []).push(lastIndex)
    }

    return this
  }

  set (key, item) {
    const indexes = this.#relations[key]

    if (indexes) {
      indexes.forEach(index => {
        this.splice(index, 1)
      })

      delete this.#relations[key]
    }

    this.add(item, key)

    return this
  }

  delete (...keys) {
    const indexes = keys.flat().map(key => this.#relations[key])

    indexes.forEach(index => {
      const item = this.splice(index, 1)

      if (Object.hasOwn(item, this.#secondaryKey) && Object.hasOwn(this.#relations, item[this.#secondaryKey])) {
        this.#relations[item[this.#secondaryKey]].forEach(key => {
          if (index === key) {
            this.#relations[item[this.#secondaryKey]].splice(index, 1)
          }
        })

        if (!this.#relations[item[this.#secondaryKey]].length) {
          delete this.#relations[item[this.#secondaryKey]]
        }
      }
    })

    return this
  }

  get secondaryKey () {
    return this.#secondaryKey
  }

  get relations () {
    return this.#relations
  }
}
