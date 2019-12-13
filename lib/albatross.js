const { GridStore, MongoClient, ObjectId } = require('mongodb')

const Collection = require('./collection')
const Grid = require('./grid')

const kClient = Symbol('client')
const kCollections = Symbol('collections')
const kConnect = Symbol('connect')
const kGrids = Symbol('grids')
const kURI = Symbol('uri')

class Albatross {
  constructor (uri) {
    this[kClient] = null
    this[kCollections] = new Map()
    this[kGrids] = new Map()
    this[kURI] = uri
  }

  async [kConnect] () {
    if (this[kClient] == null) {
      this[kClient] = MongoClient.connect(this[kURI], { useNewUrlParser: true, useUnifiedTopology: true })

      try {
        return await this[kClient]
      } catch (err) {
        this[kClient] = null
        throw err
      }
    }

    const client = await this[kClient]

    if (!client.isConnected()) {
      this[kClient] = null
      return this[kConnect]()
    }

    return client
  }

  async db () {
    return (await this[kConnect]()).db()
  }

  id (hexString) {
    return (hexString instanceof ObjectId) ? hexString : new ObjectId(hexString)
  }

  collection (name) {
    if (!this[kCollections].has(name)) {
      this[kCollections].set(name, new Collection(this, name))
    }

    return this[kCollections].get(name)
  }

  grid (bucketName = GridStore.DEFAULT_ROOT_COLLECTION) {
    if (!this[kGrids].has(bucketName)) {
      this[kGrids].set(bucketName, new Grid(this, bucketName))
    }

    return this[kGrids].get(bucketName)
  }

  async ping () {
    try {
      const db = await this.db()
      await db.command({ ping: 1 })
    } catch (err) {
      this[kClient] = null
      throw err
    }
  }

  async close (force) {
    if (this[kClient] == null) return

    const client = await this[kClient]
    await client.close(force)
    this[kClient] = null
  }
}

module.exports = Albatross
