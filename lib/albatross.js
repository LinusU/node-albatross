var util = require('util')
var events = require('events')
var mongodb = require('mongodb')

var Collection = require('./collection')

var ObjectID = mongodb.ObjectID
var EventEmitter = events.EventEmitter
var MongoClient = mongodb.MongoClient

function Albatross (uri) {
  EventEmitter.call(this)

  this._dbInstance = null
  this._collections = {}
  this._colCache = {}
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

Albatross.prototype._getRawCollection = function (name, cb) {
  function whenConnected () {
    if (this._colCache.hasOwnProperty(name) === false) {
      this._colCache[name] = this._dbInstance.collection(name)
    }

    return cb(this._colCache[name])
  }

  if (this.connected) {
    whenConnected.call(this)
  } else {
    this.once('connected', whenConnected.bind(this))
  }
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
