var util = require('util')
var events = require('events')
var mongodb = require('mongodb')

var Collection = require('./collection')
var Grid = require('./grid')

var ObjectID = mongodb.ObjectID
var GridStore = mongodb.GridStore
var GridFSBucket = mongodb.GridFSBucket
var EventEmitter = events.EventEmitter
var MongoClient = mongodb.MongoClient

function Albatross (uri) {
  EventEmitter.call(this)

  this._dbInstance = null
  this._collections = {}
  this._colCache = {}
  this._grids = {}
  this._gridCache = {}
  this.connected = false
  this.connecting = true

  function onConnect (err, db) {
    if (err) return this.emit('error', err)

    this._dbInstance = db
    this.connected = true
    this.connecting = false
    this.emit('connected')
  }

  MongoClient.connect(uri, onConnect.bind(this))
}

util.inherits(Albatross, EventEmitter)

Albatross.prototype._whenConnected = function (cb) {
  if (this.connected) {
    cb.call(this)
  } else {
    this.once('connected', cb.bind(this))
  }
}

Albatross.prototype._getRawCollection = function (name, cb) {
  this._whenConnected(function whenConnected () {
    if (this._colCache.hasOwnProperty(name) === false) {
      this._colCache[name] = this._dbInstance.collection(name)
    }

    return cb(this._colCache[name])
  })
}

Albatross.prototype._getRawGrid = function (name, cb) {
  this._whenConnected(function whenConnected () {
    if (this._gridCache.hasOwnProperty(name) === false) {
      this._gridCache[name] = new GridFSBucket(this._dbInstance, { bucketName: name })
    }

    return cb(this._gridCache[name])
  })
}

Albatross.prototype.id = function (hexString) {
  if (hexString instanceof ObjectID) return hexString

  return new ObjectID(hexString)
}

Albatross.prototype.collection = function (name) {
  if (!this._collections.hasOwnProperty(name)) {
    this._collections[name] = new Collection(this, name)
  }

  return this._collections[name]
}

Albatross.prototype.grid = function (name) {
  if (!name) name = GridStore.DEFAULT_ROOT_COLLECTION

  if (!this._grids.hasOwnProperty(name)) {
    this._grids[name] = new Grid(this, name)
  }

  return this._grids[name]
}

Albatross.prototype.close = function (cb) {
  function done (err) {
    if (cb) return cb(err)
    if (err) return this.emit('error', err)
  }

  if (this.connecting) {
    this.once('connected', this.close.bind(this))
  } else if (this.connected) {
    this._dbInstance.close(done.bind(this))
  } else {
    setImmediate(done.bind(this), null)
  }
}

module.exports = Albatross
