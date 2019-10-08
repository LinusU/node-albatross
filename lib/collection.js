const debug = require('debug')
const Request = require('./request')

class Collection {
  constructor (parent, name) {
    this.name = name
    this.parent = parent
    this.debug = debug('albatross:' + name)
  }

  _request (op, args, opts) {
    const req = new Request(this, op, args, opts)
    return this.parent._getRawCollection(this.name).then((col) => req.dispatch(col))
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  findById (id, opts) {
    return this._request('findById', [id], opts)
  }

  findOne (query, opts) {
    return this._request('findOne', [query], opts)
  }

  find (query, opts) {
    return this._request('find', [query], opts)
  }

  count (query, opts) {
    return this._request('count', [query], opts)
  }

  distinct (key, query, opts) {
    return this._request('distinct', [key, query], opts)
  }

  insert (docs, opts) {
    return this._request('insert', [docs], opts)
  }

  update (selector, document, opts) {
    if (opts && 'single' in opts) {
      throw new Error('update dosen\'t support single, use multi')
    }

    return this._request('update', [selector, document], opts)
  }

  remove (selector, opts) {
    if (opts && 'multi' in opts) {
      throw new Error('remove dosen\'t support multi, use single')
    }

    return this._request('remove', [selector], opts)
  }
}

module.exports = Collection
