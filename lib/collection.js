const debug = require('debug')

const kDebug = Symbol('debug')

class Collection {
  constructor (parent, name) {
    this.name = name
    this.parent = parent
    this[kDebug] = debug('albatross:' + name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  findOne (query, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('findOne(%o)', query)

      return db.collection(this.name).findOne(query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  find (query, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('find(%o)', query)

      return db.collection(this.name).find(query, opts).toArray().then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  count (query, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('count(%o)', query)

      return db.collection(this.name).countDocuments(query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  distinct (key, query, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('distinct(%s, %o)', key, query)

      return db.collection(this.name).distinct(key, query, opts).then(
        (res) => { this[kDebug]('reply OK'); return res },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  exists (query) {
    return this.parent.db().then((db) => {
      this[kDebug]('exists(%o)', query)

      // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
      const cursor = db.collection(this.name).find(query, { projection: { _id: 1 }, limit: 1 })

      return cursor.hasNext().then(
        (res) => { this[kDebug](`reply OK ${res}`); return cursor.close({ skipKillCursors: true }).then(() => { return res }) },
        (err) => { this[kDebug]('reply ERR'); return cursor.close({ skipKillCursors: true }).then(() => { throw err }) }
      )
    })
  }

  insert (docs, opts) {
    return this.parent.db().then((db) => {
      if (Array.isArray(docs)) {
        this[kDebug]('insertMany(%o)', docs)
        return db.collection(this.name).insertMany(docs, opts).then(
          (res) => { this[kDebug]('reply OK'); return res.ops },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      } else {
        this[kDebug]('insertOne(%o)', docs)
        return db.collection(this.name).insertOne(docs, opts).then(
          (res) => { this[kDebug]('reply OK'); return res.ops[0] },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      }
    })
  }

  findOneAndUpdate (filter, update, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('findOneAndUpdate(%o, %o)', filter, update)

      return db.collection(this.name).findOneAndUpdate(filter, update, opts).then(
        (res) => { this[kDebug]('reply OK'); return res.value },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  updateOne (filter, update, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('updateOne(%o, %o)', filter, update)

      return db.collection(this.name).updateOne(filter, update, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  updateMany (filter, update, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('updateMany(%o, %o)', filter, update)

      return db.collection(this.name).updateMany(filter, update, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  deleteOne (filter, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('deleteOne(%o)', filter)

      return db.collection(this.name).deleteOne(filter, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }

  deleteMany (filter, opts) {
    return this.parent.db().then((db) => {
      this[kDebug]('deleteMany(%o)', filter)

      return db.collection(this.name).deleteMany(filter, opts).then(
        (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
        (err) => { this[kDebug]('reply ERR'); throw err }
      )
    })
  }
}

module.exports = Collection
