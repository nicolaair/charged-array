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
      const lastIndex = super.push(item) - 1

      if (item[this.#secondaryKey]) {
        (this.#relations[item[this.#secondaryKey]] ??= []).push(lastIndex)
      }
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

  get (...keys) {
    if (keys.length > 1 || Array.isArray(keys[0])) {
      const array = new ChargedArray({ secondaryKey: this.#secondaryKey })()

      keys.flat().forEach(key => {
        array.push(this[this.#relations[key]])
      })

      return array
    } else {
      return this[this.#relations[keys[0]]]
    }
  }

  delete (...keys) {
    const indexes = keys
      .flat()
      .map(key => this.#relations[key])
      .flat()

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
