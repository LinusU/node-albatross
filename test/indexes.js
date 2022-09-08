/* eslint-env mocha */

const assert = require('assert')
const assertRejects = require('assert-rejects')
const crypto = require('crypto')
const albatross = require('../')

const id = crypto.randomBytes(4).toString('hex')

describe('Indexes', () => {
  /** @type {import('../').Albatross} */
  let db
  /** @type {import('../').Collection} */
  let collection

  before(async () => {
    db = albatross('mongodb://localhost/albatross-test')
    collection = db.collection('indexed-' + id)
    await collection.deleteMany({})
  })

  afterEach(async () => {
    await collection.deleteMany({})
  })

  after(async () => {
    await db.close()
  })

  it('#createIndex should create an index', async () => {
    const index = await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    assert.strictEqual(index, 'test_index')
  })

  it('#findOne should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1 })
    const fetched = await collection.findOne({ foo: 1 }, { hint: 'test_index' })
    assert.deepStrictEqual(fetched, inserted)
    await assertRejects(collection.findOne({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#find should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1 })
    const fetched = await collection.find({ foo: 1 }, { hint: 'test_index' })
    assert.deepStrictEqual(fetched, [inserted])
    await assertRejects(collection.find({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#count should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })

    await collection.insert([
      { foo: 1 },
      { foo: 2 },
      { foo: 2 },
      { foo: 3 },
      { foo: 3 },
      { foo: 3 }
    ])

    assert.strictEqual(await collection.count({ foo: 0 }, { hint: 'test_index' }), 0)
    assert.strictEqual(await collection.count({ foo: 1 }, { hint: 'test_index' }), 1)
    assert.strictEqual(await collection.count({ foo: 2 }, { hint: 'test_index' }), 2)
    assert.strictEqual(await collection.count({ foo: 3 }, { hint: 'test_index' }), 3)
    await assertRejects(collection.count({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#exists should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    await collection.insert({ foo: 1 })

    assert.strictEqual(await collection.exists({ foo: 0 }, { hint: 'test_index' }), false)
    assert.strictEqual(await collection.exists({ foo: 1 }, { hint: 'test_index' }), true)
    await assertRejects(collection.exists({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#findOneAndUpdate should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1, bar: 1 })

    const updated = await collection.findOneAndUpdate({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'test_index', returnOriginal: false })
    assert.deepStrictEqual(updated, { _id: updated._id, foo: 1, bar: 2 })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, foo: 1, bar: 2 })

    await assertRejects(collection.findOneAndUpdate({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'no_index', returnOriginal: false }), /hint provided does not correspond to an existing index/)
  })

  it('#updateOne should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1, bar: 1 })

    await collection.updateOne({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'test_index' })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, foo: 1, bar: 2 })

    await assertRejects(collection.updateOne({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#updateMany should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1, bar: 1 })

    await collection.updateMany({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'test_index' })

    const fetched = await collection.findOne({ _id: inserted._id })
    assert.deepStrictEqual(fetched, { _id: fetched._id, foo: 1, bar: 2 })

    await assertRejects(collection.updateMany({ foo: 1 }, { $set: { bar: 2 } }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#deleteOne should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    await collection.insert({ foo: 1 })

    assert.strictEqual(await collection.deleteOne({ foo: 0 }, { hint: 'test_index' }), 0)
    assert.strictEqual(await collection.deleteOne({ foo: 1 }, { hint: 'test_index' }), 1)

    await assertRejects(collection.deleteOne({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#deleteMany should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    await collection.insert({ foo: 1 })

    assert.strictEqual(await collection.deleteMany({ foo: 0 }, { hint: 'test_index' }), 0)
    assert.strictEqual(await collection.deleteMany({ foo: 1 }, { hint: 'test_index' }), 1)

    await assertRejects(collection.deleteMany({ foo: 1 }, { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })

  it('#aggregate should use index', async () => {
    await collection.createIndex({ foo: 1 }, { name: 'test_index' })
    const inserted = await collection.insert({ foo: 1 })
    const fetched = await collection.aggregate([{ $match: { foo: 1 } }], { hint: 'test_index' })
    assert.deepStrictEqual(fetched, [inserted])

    await assertRejects(collection.aggregate([{ $match: { foo: 1 } }], { hint: 'no_index' }), /hint provided does not correspond to an existing index/)
  })
})
