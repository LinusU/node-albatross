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

  [kConnect] () {
    if (this[kClient] == null) {
      const client = MongoClient.connect(this[kURI], { useNewUrlParser: true, useUnifiedTopology: true })
      this[kClient] = client
      client.catch(() => { this[kClient] = null })
      return client
    }

    return this[kClient].then((client) => {
      if (!client.isConnected()) {
        this[kClient] = null
        return this[kConnect]()
      }

      return client
    })
  }

  db () {
    return this[kConnect]().then((client) => client.db())
  }

  id (hexString) {
    if (hexString instanceof ObjectId) return hexString

    return new ObjectId(hexString)
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

  ping () {
    return this.db().then((db) => db.command({ ping: 1 })).then(
      () => {},
      (err) => {
        this[kClient] = null
        throw err
      }
    )
  }

  close (force) {
    if (this[kClient] == null) {
      return Promise.resolve()
    }

    return this[kClient]
      .then((client) => client.close(force))
      .then(() => { this[kClient] = null })
  }
}

module.exports = Albatross
