import BSON from 'bson'
import debug from 'debug'

const kDebug = Symbol('debug')

function prepareDocument (document) {
  return BSON.deserialize(BSON.serialize(document), { promoteValues: true })
}

export default class Collection {
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

  async exists (query, opts) {
    const db = await this.parent.db()

    // https://blog.serverdensity.com/checking-if-a-document-exists-mongodb-slow-findone-vs-find/
    const cursor = db.collection(this.name).find(query, { projection: { _id: 1 }, limit: 1 })

    if (opts && opts.hint) {
      cursor.hint(opts.hint)
    }

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
        const documents = docs.map(prepareDocument)
        this[kDebug]('insertMany(%o)', documents)
        await db.collection(this.name).insertMany(documents, opts)
        this[kDebug]('reply OK')
        return documents
      } else {
        const document = prepareDocument(docs)
        this[kDebug]('insertOne(%o)', document)
        await db.collection(this.name).insertOne(document, opts)
        this[kDebug]('reply OK')
        return document
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
      this[kDebug](`reply OK ${res.matchedCount} ${res.modifiedCount}`)
      return { matched: res.matchedCount, modified: res.modifiedCount }
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
      this[kDebug](`reply OK ${res.matchedCount} ${res.modifiedCount}`)
      return { matched: res.matchedCount, modified: res.modifiedCount }
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
      this[kDebug](`reply OK ${res.deletedCount}`)
      return res.deletedCount
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
      this[kDebug](`reply OK ${res.deletedCount}`)
      return res.deletedCount
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

  async createIndex (indexSpec, opts) {
    const db = await this.parent.db()

    try {
      this[kDebug]('createIndex(%o, %o)', indexSpec, opts)
      const res = await db.collection(this.name).createIndex(indexSpec, opts)
      this[kDebug]('reply OK')
      return res
    } catch (err) {
      this[kDebug]('reply ERR')
      throw err
    }
  }
}
