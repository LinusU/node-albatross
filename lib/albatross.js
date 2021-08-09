import mongodb from 'mongodb'

import Collection from './collection.js'
import Grid from './grid.js'

const DEFAULT_ROOT_COLLECTION = 'fs'

const kClient = Symbol('client')
const kCollections = Symbol('collections')
const kGrids = Symbol('grids')

export default class Albatross {
  constructor (uri) {
    this[kClient] = new mongodb.MongoClient(uri, { ignoreUndefined: true })
    this[kCollections] = new Map()
    this[kGrids] = new Map()
  }

  async db () {
    await this[kClient].connect()
    return this[kClient].db()
  }

  id (hexString) {
    return (hexString instanceof mongodb.ObjectId) ? hexString : new mongodb.ObjectId(hexString)
  }

  collection (name) {
    if (!this[kCollections].has(name)) {
      this[kCollections].set(name, new Collection(this, name))
    }

    return this[kCollections].get(name)
  }

  grid (bucketName = DEFAULT_ROOT_COLLECTION) {
    if (!this[kGrids].has(bucketName)) {
      this[kGrids].set(bucketName, new Grid(this, bucketName))
    }

    return this[kGrids].get(bucketName)
  }

  async ping (timeout) {
    let timeoutHandle

    const ping = async () => {
      await this[kClient].connect()
      await this[kClient].db().command({ ping: 1 })
    }

    try {
      if (typeof timeout === 'number') {
        const timeoutPromise = new Promise((resolve, reject) => {
          timeoutHandle = setTimeout(() => {
            timeoutHandle = null
            reject(new Error('Timeout reached while waiting for ping'))
          }, timeout)
        })

        await Promise.race([ping(), timeoutPromise])
      } else {
        await ping()
      }
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }
    }
  }

  async transaction (fn) {
    const session = this[kClient].startSession()

    let result

    try {
      await session.withTransaction(async (...args) => {
        result = await fn(...args)
      })
    } finally {
      session.endSession()
    }

    return result
  }

  async close (force) {
    await this[kClient].close(force)
  }
}
