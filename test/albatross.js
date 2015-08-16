/* eslint-env mocha */

var assert = require('assert')
var mongodb = require('mongodb')
var albatross = require('../')

describe('Albatross', function () {
  var db

  before(function () {
    db = albatross('mongodb://localhost/albatross-test')
  })

  it('should connect', function (done) {
    if (db.connected) {
      process.nextTick(done)
    } else {
      db.once('connected', done)
    }
  })

  it('should throw errors', function () {
    assert.throws(function () {
      albatross('hgjfdkgdfgjiod')
    })
  })

  it('should emit errors', function (done) {
    albatross('mongodb://127.0.0.1:46543').once('error', function (err) {
      assert(err)
      done()
    })
  })

  it('should make ids', function () {
    var id1 = db.id()
    var str = id1.toHexString()
    var id2 = db.id(str)

    assert(id1 instanceof albatross.ObjectID)
    assert(id2 instanceof albatross.ObjectID)
    assert(albatross.ObjectID.isValid(str))
    assert(id1.equals(id2))
  })

  it('should expose mongodb bson api', function () {
    assert.equal(albatross.BSON, mongodb.BSON)
    assert.equal(albatross.Binary, mongodb.Binary)
    assert.equal(albatross.Code, mongodb.Code)
    assert.equal(albatross.DBRef, mongodb.DBRef)
    assert.equal(albatross.Double, mongodb.Double)
    assert.equal(albatross.Long, mongodb.Long)
    assert.equal(albatross.MaxKey, mongodb.MaxKey)
    assert.equal(albatross.MinKey, mongodb.MinKey)
    assert.equal(albatross.ObjectID, mongodb.ObjectID)
    assert.equal(albatross.Symbol, mongodb.Symbol)
    assert.equal(albatross.Timestamp, mongodb.Timestamp)
  })
})
