class Request {
  constructor (collection, op, args, opts = {}) {
    this.collection = collection
    this.op = op
    this.args = args
    this.opts = opts
  }

  dispatch (col) {
    const debug = this.collection.debug.bind(this.collection)

    const logError = (err) => {
      this.collection.debug('reply ERR')
      throw err
    }

    const cbNormal = (res) => {
      this.collection.debug('reply OK')
      return res
    }

    const cbUpdate = (res) => {
      this.collection.debug(`reply OK ${res.result.n} ${res.result.nModified}`)
      return { matched: res.result.n, modified: res.result.nModified }
    }

    const cbRemove = (res) => {
      this.collection.debug(`reply OK ${res.result.n}`)
      return res.result.n
    }

    const cbFirstOp = (res) => {
      this.collection.debug('reply OK')
      return res.ops[0]
    }

    const cbAllOps = (res) => {
      this.collection.debug('reply OK')
      return res.ops
    }

    switch (this.op) {
      case 'findById':
        debug('findOne({ _id: %s })', this.args[0].toString())
        return col.findOne({ _id: this.args[0] }, this.opts).then(cbNormal, logError)

      case 'findOne':
        debug('findOne(%o)', this.args[0])
        return col.findOne(this.args[0], this.opts).then(cbNormal, logError)

      case 'find':
        debug('find(%o)', this.args[0])
        return col.find(this.args[0], this.opts).toArray().then(cbNormal, logError)

      case 'count':
        debug('count(%o)', this.args[0])
        return col.countDocuments(this.args[0], this.opts).then(cbNormal, logError)

      case 'distinct':
        debug('distinct(%s, %o)', this.args[0], this.args[1])
        return col.distinct(this.args[0], this.args[1], this.opts).then(cbNormal, logError)

      case 'insert':
        if (Array.isArray(this.args[0])) {
          debug('insertMany(%o)', this.args[0])
          return col.insertMany(this.args[0], this.opts).then(cbAllOps, logError)
        } else {
          debug('insertOne(%o)', this.args[0])
          return col.insertOne(this.args[0], this.opts).then(cbFirstOp, logError)
        }

      case 'update':
        if (this.opts.multi === true) {
          debug('updateMany(%o, %o)', this.args[0], this.args[1])
          return col.updateMany(this.args[0], this.args[1], this.opts).then(cbUpdate, logError)
        } else {
          debug('updateOne(%o, %o)', this.args[0], this.args[1])
          return col.updateOne(this.args[0], this.args[1], this.opts).then(cbUpdate, logError)
        }

      case 'remove':
        if (this.opts.single === true) {
          debug('removeOne(%o)', this.args[0])
          return col.removeOne(this.args[0], this.opts).then(cbRemove, logError)
        } else {
          debug('removeMany(%o)', this.args[0])
          return col.removeMany(this.args[0], this.opts).then(cbRemove, logError)
        }

      default:
        return Promise.reject(new Error('Unknown op: ' + this.op))
    }
  }
}

module.exports = Request
