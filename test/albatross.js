/* eslint-env mocha */

const assert = require('assert')
const mongodb = require('mongodb')
const albatross = require('../')

describe('Albatross', function () {
  let db

  before(function () {
    db = albatross('mongodb://localhost/albatross-test')
  })

  after(async () => {
    await db.close()
  })

  it('should make ids', function () {
    const id1 = db.id()
    const str = id1.toHexString()
    const id2 = db.id(str)

    assert.ok(id1 instanceof albatross.ObjectID)
    assert.ok(id2 instanceof albatross.ObjectID)
    assert.ok(albatross.ObjectID.isValid(str))
    assert.ok(id1.equals(id2))
  })

  it('should expose mongodb bson api', function () {
    assert.strictEqual(albatross.Admin, mongodb.Admin)
    assert.strictEqual(albatross.AggregationCursor, mongodb.AggregationCursor)
    assert.strictEqual(albatross.BSONRegExp, mongodb.BSONRegExp)
    assert.strictEqual(albatross.Binary, mongodb.Binary)
    assert.strictEqual(albatross.Chunk, mongodb.Chunk)
    assert.strictEqual(albatross.Code, mongodb.Code)
    assert.strictEqual(albatross.Collection, mongodb.Collection)
    assert.strictEqual(albatross.CommandCursor, mongodb.CommandCursor)
    assert.strictEqual(albatross.CoreConnection, mongodb.CoreConnection)
    assert.strictEqual(albatross.CoreServer, mongodb.CoreServer)
    assert.strictEqual(albatross.Cursor, mongodb.Cursor)
    assert.strictEqual(albatross.DBRef, mongodb.DBRef)
    assert.strictEqual(albatross.Db, mongodb.Db)
    assert.strictEqual(albatross.Decimal128, mongodb.Decimal128)
    assert.strictEqual(albatross.Double, mongodb.Double)
    assert.strictEqual(albatross.GridFSBucket, mongodb.GridFSBucket)
    assert.strictEqual(albatross.GridStore, mongodb.GridStore)
    assert.strictEqual(albatross.Int32, mongodb.Int32)
    assert.strictEqual(albatross.Logger, mongodb.Logger)
    assert.strictEqual(albatross.Long, mongodb.Long)
    assert.strictEqual(albatross.Map, mongodb.Map)
    assert.strictEqual(albatross.MaxKey, mongodb.MaxKey)
    assert.strictEqual(albatross.MinKey, mongodb.MinKey)
    assert.strictEqual(albatross.MongoClient, mongodb.MongoClient)
    assert.strictEqual(albatross.MongoError, mongodb.MongoError)
    assert.strictEqual(albatross.MongoNetworkError, mongodb.MongoNetworkError)
    assert.strictEqual(albatross.MongoTimeoutError, mongodb.MongoTimeoutError)
    assert.strictEqual(albatross.Mongos, mongodb.Mongos)
    assert.strictEqual(albatross.ObjectID, mongodb.ObjectID)
    assert.strictEqual(albatross.ObjectId, mongodb.ObjectId)
    assert.strictEqual(albatross.ReadPreference, mongodb.ReadPreference)
    assert.strictEqual(albatross.ReplSet, mongodb.ReplSet)
    assert.strictEqual(albatross.Server, mongodb.Server)
    assert.strictEqual(albatross.Symbol, mongodb.Symbol)
    assert.strictEqual(albatross.Timestamp, mongodb.Timestamp)
  })
})
