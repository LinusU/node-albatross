/* eslint-env mocha */

import assert from 'node:assert'
import mongodb from 'mongodb'

import albatross, { Binary, Code, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp } from '../index.js'

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

    assert.ok(id1 instanceof ObjectId)
    assert.ok(id2 instanceof ObjectId)
    assert.ok(ObjectId.isValid(str))
    assert.ok(id1.equals(id2))
  })

  it('should expose mongodb bson api', function () {
    assert.strictEqual(Binary, mongodb.Binary)
    assert.strictEqual(Code, mongodb.Code)
    assert.strictEqual(Decimal128, mongodb.Decimal128)
    assert.strictEqual(Double, mongodb.Double)
    assert.strictEqual(Int32, mongodb.Int32)
    assert.strictEqual(Long, mongodb.Long)
    assert.strictEqual(MaxKey, mongodb.MaxKey)
    assert.strictEqual(MinKey, mongodb.MinKey)
    assert.strictEqual(ObjectId, mongodb.ObjectId)
    assert.strictEqual(Timestamp, mongodb.Timestamp)
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

    await assert.rejects(ping(), /Timeout reached while waiting for ping/)
  })
})
