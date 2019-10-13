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

  update (selector, document, opts) {
    if (opts && 'single' in opts) {
      throw new Error('update dosen\'t support single, use multi')
    }

    return this[kCollection].then((collection) => {
      if (opts && opts.multi === true) {
        this[kDebug]('updateMany(%o, %o)', selector, document)
        return collection.updateMany(selector, document, opts).then(
          (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      } else {
        this[kDebug]('updateOne(%o, %o)', selector, document)
        return collection.updateOne(selector, document, opts).then(
          (res) => { this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      }
    })
  }

  remove (selector, opts) {
    if (opts && 'multi' in opts) {
      throw new Error('remove dosen\'t support multi, use single')
    }

    return this[kCollection].then((collection) => {
      if (opts && opts.single === true) {
        this[kDebug]('removeOne(%o)', selector)
        return collection.removeOne(selector, opts).then(
          (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      } else {
        this[kDebug]('removeMany(%o)', selector)
        return collection.removeMany(selector, opts).then(
          (res) => { this[kDebug](`reply OK ${res.result.n}`); return res.result.n },
          (err) => { this[kDebug]('reply ERR'); throw err }
        )
      }
    })
  }
}

module.exports = Collection
