/* eslint-env mocha */

const assert = require('assert')
const assertRejects = require('assert-rejects')
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

    assert.ok(id1 instanceof albatross.ObjectId)
    assert.ok(id2 instanceof albatross.ObjectId)
    assert.ok(albatross.ObjectId.isValid(str))
    assert.ok(id1.equals(id2))
  })

  it('should expose mongodb bson api', function () {
    assert.strictEqual(albatross.Binary, mongodb.Binary)
    assert.strictEqual(albatross.Code, mongodb.Code)
    assert.strictEqual(albatross.DBRef, mongodb.DBRef)
    assert.strictEqual(albatross.Decimal128, mongodb.Decimal128)
    assert.strictEqual(albatross.Double, mongodb.Double)
    assert.strictEqual(albatross.Int32, mongodb.Int32)
    assert.strictEqual(albatross.Long, mongodb.Long)
    assert.strictEqual(albatross.MaxKey, mongodb.MaxKey)
    assert.strictEqual(albatross.MinKey, mongodb.MinKey)
    assert.strictEqual(albatross.ObjectId, mongodb.ObjectId)
    assert.strictEqual(albatross.Timestamp, mongodb.Timestamp)
  })

  it('should ping server', async () => {
    assert.strictEqual(await db.ping(), undefined)
  })

  it('should ping server with timeout', async () => {
    assert.strictEqual(await db.ping(500), undefined)
  })

  it('should timeout when pinging server', async () => {
    async function ping () {
      // Because of how Node.js schedules things, the ping can complete before
      // a setTimeout(..., 0) call when running against a local MongoDB instance.
      // Running a few times makes sure that one of them should time out.
      for (let i = 0; i < 100; i++) await db.ping(0)
    }

    await assertRejects(ping(), /Timeout reached while waiting for ping/)
  })
})
