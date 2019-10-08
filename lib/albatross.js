const { GridFSBucket, GridStore, MongoClient, ObjectID } = require('mongodb')

const Collection = require('./collection')
const Grid = require('./grid')

class Albatross {
  constructor (uri) {
    this._collections = new Map()
    this._colCache = new Map()
    this._grids = new Map()
    this._gridCache = new Map()

    this._client = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    this._db = this._client.then((client) => client.db())
  }

  _getRawCollection (name) {
    return this._db.then((db) => {
      if (!this._colCache.has(name)) {
        this._colCache.set(name, db.collection(name))
      }

      return this._colCache.get(name)
    })
  }

  _getRawGrid (name) {
    return this._db.then((db) => {
      if (!this._gridCache.has(name)) {
        this._gridCache.set(name, new GridFSBucket(db, { bucketName: name }))
      }

      return this._gridCache.get(name)
    })
  }

  id (hexString) {
    if (hexString instanceof ObjectID) return hexString

    return new ObjectID(hexString)
  }

  collection (name) {
    if (!this._collections.has(name)) {
      this._collections.set(name, new Collection(this, name))
    }

    return this._collections.get(name)
  }

  grid (name = GridStore.DEFAULT_ROOT_COLLECTION) {
    if (!this._grids.has(name)) {
      this._grids.set(name, new Grid(this, name))
    }

    return this._grids.get(name)
  }

  close (force) {
    return new Promise((resolve) => {
      // Give a little time for garbage collected queries to properly close
      setTimeout(() => resolve(this._client.then((client) => client.close(force))), 1)
    })
  }
}

module.exports = Albatross
