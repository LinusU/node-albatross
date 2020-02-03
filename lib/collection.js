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

  async findOne (query, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('findOne(%o)', query)
      const res = await db.collection(this.name).findOne(query, opts)
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async find (query, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('find(%o)', query)
      const res = await db.collection(this.name).find(query, opts).toArray()
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async count (query, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('count(%o)', query)
      const res = await db.collection(this.name).countDocuments(query, opts)
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async distinct (key, query, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('distinct(%s, %o)', key, query)
      const res = await db.collection(this.name).distinct(key, query, opts)
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async exists (query) {
    const db = await this.parent.db()

    // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
    const cursor = db.collection(this.name).find(query, { projection: { _id: 1 }, limit: 1 })

    try {
      this[kDebug]('exists(%o)', query)
      const res = await cursor.hasNext()
      this[kDebug](`reply OK ${res}`)
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    } finally {
      await cursor.close({ skipKillCursors: true })
    }
  }

  async insert (docs, opts) {
    const db = await this.parent.db()

    try {
      if (Array.isArray(docs)) {
        this[kDebug]('insertMany(%o)', docs)
        const res = await db.collection(this.name).insertMany(docs, opts)
        this[kDebug]('reply OK')
        return res.ops
      } else {
        this[kDebug]('insertOne(%o)', docs)
        const res = await db.collection(this.name).insertOne(docs, opts)
        this[kDebug]('reply OK')
        return res.ops[0]
      }
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async findOneAndUpdate (filter, update, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('findOneAndUpdate(%o, %o)', filter, update)
      const res = await db.collection(this.name).findOneAndUpdate(filter, update, opts)
      this[kDebug]('reply OK')
      return res.value
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async updateOne (filter, update, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('updateOne(%o, %o)', filter, update)
      const res = await db.collection(this.name).updateOne(filter, update, opts)
      this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`)
      return { matched: res.result.n, modified: res.result.nModified }
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async updateMany (filter, update, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('updateMany(%o, %o)', filter, update)
      const res = await db.collection(this.name).updateMany(filter, update, opts)
      this[kDebug](`reply OK ${res.result.n} ${res.result.nModified}`)
      return { matched: res.result.n, modified: res.result.nModified }
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async deleteOne (filter, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('deleteOne(%o)', filter)
      const res = await db.collection(this.name).deleteOne(filter, opts)
      this[kDebug](`reply OK ${res.result.n}`)
      return res.result.n
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async deleteMany (filter, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('deleteMany(%o)', filter)
      const res = await db.collection(this.name).deleteMany(filter, opts)
      this[kDebug](`reply OK ${res.result.n}`)
      return res.result.n
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }

  async aggregate (pipeline, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('aggregate(%o)', pipeline)
      const res = await db.collection(this.name).aggregate(pipeline, opts).toArray()
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }
}

module.exports = Collection
