const { GridFSBucket, GridStore, MongoClient, ObjectId } = require('mongodb')

const Collection = require('./collection')
const Grid = require('./grid')

const kClient = Symbol('client')
const kCollections = Symbol('collections')
const kDB = Symbol('db')
const kGrids = Symbol('grids')

class Albatross {
  constructor (uri) {
    this[kCollections] = new Map()
    this[kGrids] = new Map()

    this[kClient] = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    this[kDB] = this[kClient].then((client) => client.db())
  }

  id (hexString) {
    if (hexString instanceof ObjectId) return hexString

    return new ObjectId(hexString)
  }

  collection (name) {
    if (!this[kCollections].has(name)) {
      this[kCollections].set(name, new Collection(this, name, this[kDB].then((db) => db.collection(name))))
    }

    return this[kCollections].get(name)
  }

  grid (bucketName = GridStore.DEFAULT_ROOT_COLLECTION) {
    if (!this[kGrids].has(bucketName)) {
      this[kGrids].set(bucketName, new Grid(this, bucketName, this[kDB].then((db) => new GridFSBucket(db, { bucketName }))))
    }

    return this[kGrids].get(bucketName)
  }

  close (force) {
    return new Promise((resolve) => {
      // Give a little time for garbage collected queries to properly close
      setTimeout(() => resolve(this[kClient].then((client) => client.close(force))), 1)
    })
  }
}

module.exports = Albatross
