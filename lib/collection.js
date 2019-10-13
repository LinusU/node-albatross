const debug = require('debug')

class Collection {
  constructor (parent, name) {
    this.name = name
    this.parent = parent
    this.debug = debug('albatross:' + name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  findOne (query, opts) {
    return this.parent._getRawCollection(this.name).then((col) => {
      this.debug('findOne(%o)', query)

      return col.findOne(query, opts).then(
        (res) => { this.debug('reply OK'); return res },
        (err) => { this.debug('reply ERR'); throw err }
      )
    })
  }

  find (query, opts) {
    return this.parent._getRawCollection(this.name).then((col) => {
      this.debug('find(%o)', query)

      return col.find(query, opts).toArray().then(
        (res) => { this.debug('reply OK'); return res },
        (err) => { this.debug('reply ERR'); throw err }
      )
    })
  }

  count (query, opts) {
    return this.parent._getRawCollection(this.name).then((col) => {
      this.debug('count(%o)', query)

      return col.countDocuments(query, opts).then(
        (res) => { this.debug('reply OK'); return res },
        (err) => { this.debug('reply ERR'); throw err }
      )
    })
  }

  distinct (key, query, opts) {
    return this.parent._getRawCollection(this.name).then((col) => {
      this.debug('distinct(%s, %o)', key, query)

      return col.distinct(key, query, opts).then(
        (res) => { this.debug('reply OK'); return res },
        (err) => { this.debug('reply ERR'); throw err }
      )
    })
  }

  insert (docs, opts) {
    return this.parent._getRawCollection(this.name).then((col) => {
      if (Array.isArray(docs)) {
        this.debug('insertMany(%o)', docs)
        return col.insertMany(docs, opts).then(
          (res) => { this.debug('reply OK'); return res.ops },
          (err) => { this.debug('reply ERR'); throw err }
        )
      } else {
        this.debug('insertOne(%o)', docs)
        return col.insertOne(docs, opts).then(
          (res) => { this.debug('reply OK'); return res.ops[0] },
          (err) => { this.debug('reply ERR'); throw err }
        )
      }
    })
  }

  update (selector, document, opts) {
    if (opts && 'single' in opts) {
      throw new Error('update dosen\'t support single, use multi')
    }

    return this.parent._getRawCollection(this.name).then((col) => {
      if (opts && opts.multi === true) {
        this.debug('updateMany(%o, %o)', selector, document)
        return col.updateMany(selector, document, opts).then(
          (res) => { this.debug(`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
          (err) => { this.debug('reply ERR'); throw err }
        )
      } else {
        this.debug('updateOne(%o, %o)', selector, document)
        return col.updateOne(selector, document, opts).then(
          (res) => { this.debug(`reply OK ${res.result.n} ${res.result.nModified}`); return { matched: res.result.n, modified: res.result.nModified } },
          (err) => { this.debug('reply ERR'); throw err }
        )
      }
    })
  }

  remove (selector, opts) {
    if (opts && 'multi' in opts) {
      throw new Error('remove dosen\'t support multi, use single')
    }

    return this.parent._getRawCollection(this.name).then((col) => {
      if (opts && opts.single === true) {
        this.debug('removeOne(%o)', selector)
        return col.removeOne(selector, opts).then(
          (res) => { this.debug(`reply OK ${res.result.n}`); return res.result.n },
          (err) => { this.debug('reply ERR'); throw err }
        )
      } else {
        this.debug('removeMany(%o)', selector)
        return col.removeMany(selector, opts).then(
          (res) => { this.debug(`reply OK ${res.result.n}`); return res.result.n },
          (err) => { this.debug('reply ERR'); throw err }
        )
      }
    })
  }
}

module.exports = Collection
