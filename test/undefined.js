/* eslint-env mocha */

import assert from 'node:assert'
import crypto from 'node:crypto'

import albatross from '../index.js'

const id = crypto.randomBytes(4).toString('hex')

describe('Undefined', () => {
  /** @type {import('../').Albatross} */
  let db
  /** @type {import('../').Collection} */
  let collection

  before(async () => {
    db = albatross('mongodb://localhost/albatross-test')
    collection = db.collection('things-' + id)
    await collection.deleteMany({})
  })

  afterEach(async () => {
    await collection.deleteMany({})
  })

  after(async () => {
    await db.close()
  })

  it('#findOne should handle undefined', async () => {
    const inserted = await collection.insert({ foo: 1, bar: 2 })
    const fetched = await collection.findOne({ foo: 1, bar: undefined })
    assert.deepStrictEqual(fetched, inserted)
  })

  it('#find should handle undefined', async () => {
    const inserted = await collection.insert({ foo: 1, bar: 2 })
    const fetched = await collection.find({ foo: 1, bar: undefined })
    assert.deepStrictEqual(fetched, [inserted])
  })

  it('#count should handle undefined', async () => {
    await collection.insert([
      { foo: 'bar', test: 1 },
      { foo: 'bar', test: 2 },
      { foo: 'bar', test: null },
      { foo: 'bar', test: null }
    ])

    assert.strictEqual(await collection.count({ foo: 'bar', test: 5 }), 0)
    assert.strictEqual(await collection.count({ foo: 'bar', test: null }), 2)
    assert.strictEqual(await collection.count({ foo: 'bar', test: undefined }), 4)
  })

  it('#exists should handle undefined', async () => {
    await collection.insert([
      { foo: 'bar', test: 1 },
      { foo: 'bar', test: 2 }
    ])

    assert.strictEqual(await collection.exists({ foo: 'bar', test: 5 }), false)
    assert.strictEqual(await collection.exists({ foo: 'bar', test: null }), false)
    assert.strictEqual(await collection.exists({ foo: 'bar', test: undefined }), true)
  })

  it('#findOneAndUpdate should handle undefined', async () => {
    const inserted = await collection.insert({ a: 1, b: 2, c: 3 })

    const updated = await collection.findOneAndUpdate({ _id: inserted._id }, { $set: { a: undefined, b: null, c: 5 } }, { returnDocument: 'after' })
    assert.deepStrictEqual(updated, { _id: updated._id, a: 1, b: null, c: 5 })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, a: 1, b: null, c: 5 })
  })

  it('#insert should handle undefined', async () => {
    const inserted = await collection.insert({ a: undefined, b: null, c: 3 })
    assert.deepStrictEqual(inserted, { _id: inserted._id, b: null, c: 3 })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, b: null, c: 3 })
  })

  it('#updateOne should handle undefined', async () => {
    const inserted = await collection.insert({ a: 1, b: 2, c: 3 })

    await collection.updateOne({ _id: inserted._id }, { $set: { a: undefined, b: null, c: 5 } })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, a: 1, b: null, c: 5 })
  })

  it('#updateMany should handle undefined', async () => {
    const inserted = await collection.insert({ a: 1, b: 2, c: 3 })

    await collection.updateMany({ _id: inserted._id }, { $set: { a: undefined, b: null, c: 5 } })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, a: 1, b: null, c: 5 })
  })

  it('#deleteOne should handle undefined', async () => {
    await collection.insert({ a: 1, b: 2 })

    assert.strictEqual(await collection.deleteOne({ a: 1, b: null }), 0)
    assert.strictEqual(await collection.deleteOne({ a: 1, b: undefined }), 1)
  })

  it('#deleteMany should handle undefined', async () => {
    await collection.insert([{ a: 1, b: 2 }, { a: 1, b: 5 }])

    assert.strictEqual(await collection.deleteMany({ a: 1, b: null }), 0)
    assert.strictEqual(await collection.deleteMany({ a: 1, b: undefined }), 2)
  })

  it('#aggregate should handle undefined', async () => {
    const inserted = await collection.insert({ foo: 1, bar: 2 })
    const fetched = await collection.aggregate([{ $match: { foo: 1, bar: undefined } }])
    assert.deepStrictEqual(fetched, [inserted])
  })
})
