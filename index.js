export class ChargedArray extends Array {
  #secondaryKey
  #relations

  constructor (secondaryKey = 'id', instantly = true) {
    if (instantly) {
      super()
      this.#secondaryKey = secondaryKey
      this.#relations = {}
    } else {
      return (...params) => {
        super()
        this.#secondaryKey = secondaryKey
        this.#relations = {}

        params.forEach(item => {
          this.push(item)
        })

        return this
      }
    }
  }

  #push = Array.prototype.push.bind(this)
  push (...items) {
    items.forEach(item => {
      const index = this.#push(item) - 1

      if (!Object.hasOwn(item, this.#secondaryKey)) {
        return
      }

      if (Object.hasOwn(this.#relations, item[this.#secondaryKey])) {
        this.#relations[item[this.#secondaryKey]].push(index)
      } else {
        this.#relations[item[this.#secondaryKey]] = [index]
      }
    })

    return this.length
  }

  #splice = Array.prototype.splice.bind(this)
  splice (start, deleteCount = this.length - start, ...items) {
    if (typeof start === 'undefined') {
      return new ChargedArray(this.#secondaryKey)
    }

    const end = start + deleteCount
    const array = new ChargedArray(this.#secondaryKey)

    for (let i = 0; i < this.length; ++i) {
      const item = this[i]

      if (i >= start && i < end) {
        array.push(item)

        if (Object.hasOwn(item.hasOwnProperty, this.#secondaryKey) && Object.hasOwn(this.#relations, item[this.#secondaryKey])) {
          this.#relations[item[this.#secondaryKey]].forEach((key, index) => {
            if (i === key) {
              this.#relations[item[this.#secondaryKey]].splice(index, 1)
            }
          })

          if (!this.#relations[item[this.#secondaryKey]].length) {
            delete this.#relations[item[this.#secondaryKey]]
          }
        }
      } else if (
        i >= end &&
        Object.hasOwn(item, this.#secondaryKey) &&
        Object.hasOwn(this.#relations, item[this.#secondaryKey])
      ) {
        this.#relations[item[this.#secondaryKey]].forEach((key, index) => {
          if (i === key) {
            this.#relations[item[this.#secondaryKey]][index] = this.#relations[item[this.#secondaryKey]][index] - deleteCount
          }
        })
      }
    }

    array.push(...items)
    this.#splice(start, deleteCount)

    return array
  }

  // TODO second argument
  map (callback) {
    const array = new ChargedArray(this.#secondaryKey, false)(this.length)

    for (let i = 0; i < this.length; ++i) {
      array[i] = callback(this[i], i, this)
    }

    return array
  }

  filter (callback) {
    const array = new ChargedArray(this.#secondaryKey)

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
      const array = new ChargedArray(this.#secondaryKey)

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
