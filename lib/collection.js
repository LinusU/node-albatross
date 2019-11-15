const debug = require('debug')

const kCollection = Symbol('collection')
const kDebug = Symbol('debug')

class Collection {
  constructor (parent, name, collectionPromise) {
    this.name = name
    this.parent = parent
    this[kCollection] = collectionPromise
    this[kDebug] = debug('albatross:' + name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  findOne (query, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('findOne(%o)', query)

      return collection.findOne(query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  find (query, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('find(%o)', query)

      return collection.find(query, opts).toArray().then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  count (query, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('count(%o)', query)

      return collection.countDocuments(query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  distinct (key, query, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('distinct(%s, %o)', key, query)

      return collection.distinct(key, query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  exists (query) {
    return this[kCollection].then((collection) => {
      this[kDebug]('exists(%o)', query)

      // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
      const cursor = collection.find(query, { projection: { _id: 1 }, limit: 1 })

      return cursor.hasNext().then(
        (res) => { this[kDebug](`reply OK ${res}`); return cursor.close({ skipKillCursors: true }).then(() => { return res }) },
        (err) => { this[kDebug]('reply ERR'); return cursor.close({ skipKillCursors: true }).then(() => { throw err }) }
      )
    })
  }

  insert (docs, opts) {
    return this[kCollection].then((collection) => {
      if (Array.isArray(docs)) {
        this[kDebug]('insertMany(%o)', docs)
        return collection.insertMany(docs, opts).then(
          (res) => { this[kDebug]('reply OK'); return res.ops },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      } else {
        this[kDebug]('insertOne(%o)', docs)
        return collection.insertOne(docs, opts).then(
          (res) => { this[kDebug]('reply OK'); return res.ops[0] },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      }
    })
  }

  findOneAndUpdate (filter, update, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('findOneAndUpdate(%o, %o)', filter, update)

      return collection.findOneAndUpdate(filter, update, opts).then(
        (res) => { this[kDebug]('reply OK'); return res.value },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  updateOne (filter, update, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('updateOne(%o, %o)', filter, update)

      return collection.updateOne(filter, update, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  updateMany (filter, update, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('updateMany(%o, %o)', filter, update)

      return collection.updateMany(filter, update, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  deleteOne (filter, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('deleteOne(%o)', filter)

      return collection.deleteOne(filter, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  deleteMany (filter, opts) {
    return this[kCollection].then((collection) => {
      this[kDebug]('deleteMany(%o)', filter)

      return collection.deleteMany(filter, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }
}

module.exports = Collection
