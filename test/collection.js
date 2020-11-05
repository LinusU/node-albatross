/* eslint-env mocha */

const assert = require('assert')
const crypto = require('crypto')
const albatross = require('../')

const id = crypto.randomBytes(4).toString('hex')
const ObjectId = albatross.ObjectId

describe('Collection', () => {
  /** @type {import('../').Albatross} */
  let db
  /** @type {import('../').Collection} */
  let user
  /** @type {import('../').ObjectId} */
  let linusId

  before(async () => {
    db = albatross('mongodb://localhost/albatross-test')
    user = db.collection('user-' + id)
    await user.deleteMany({})
  })

  beforeEach(async () => {
    linusId = new ObjectId()

    await user.insert({ name: 'Linus', fruits: ['Apple', 'Avocado'], _id: linusId })
    await user.insert({ name: 'Steve', fruits: ['Apple', 'Pear'] })
    await user.insert({ name: 'Bob', fruits: ['Strawberries'] })
  })

  afterEach(async () => {
    await user.deleteMany({})
  })

  after(async () => {
    await db.close()
  })

  describe('#aggregate', () => {
    it('should find one record', async () => {
      const docs = await user.aggregate([{ $match: { name: 'Linus' } }])
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
    })

    it('should perform some pipeline stages', async () => {
      const docs = await user.aggregate([
        { $match: { name: { $ne: 'Linus' } } },
        { $group: { _id: '$name', total: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
      assert.strictEqual(docs[0]._id, 'Bob')
      assert.strictEqual(docs[0].total, 1)
      assert.strictEqual(docs[1]._id, 'Steve')
      assert.strictEqual(docs[1].total, 1)
    })
  })

  describe('#findOne', () => {
    it('should find one record', async () => {
      const doc = await user.findOne({ name: 'Linus' })
      assert.ok(doc)
      assert.strictEqual(doc.name, 'Linus')
    })

    it('should find only one record', async () => {
      const doc = await user.findOne({ name: { $ne: 'Linus' } })
      assert.ok(doc)
      assert.notStrictEqual(doc.name, 'Linus')
    })
  })

  describe('#find', () => {
    it('should find one record', async () => {
      const docs = await user.find({ name: 'Linus' })
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
    })

    it('should find multiple records', async () => {
      const docs = await user.find({ name: { $ne: 'Linus' } })
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
      assert.notStrictEqual(docs[0].name, 'Linus')
      assert.notStrictEqual(docs[1].name, 'Linus')
    })

    it('should find all records', async () => {
      const docs = await user.find({})
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 3)
    })

    it('should limit number of records', async () => {
      const docs = await user.find({}, { limit: 2 })
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
    })

    it('should sort records ascending', async () => {
      const docs = await user.find({}, { sort: { name: 1 } })
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 3)
      assert.strictEqual(docs[0].name, 'Bob')
      assert.strictEqual(docs[1].name, 'Linus')
      assert.strictEqual(docs[2].name, 'Steve')
    })

    it('should sort records descending', async () => {
      const docs = await user.find({}, { sort: { name: -1 } })
      assert.ok(docs)
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 3)
      assert.strictEqual(docs[0].name, 'Steve')
      assert.strictEqual(docs[1].name, 'Linus')
      assert.strictEqual(docs[2].name, 'Bob')
    })
  })

  describe('#count', () => {
    it('should count no records', async () => {
      const res = await user.count({ name: 'Foobar' })
      assert.strictEqual(res, 0)
    })

    it('should count one record', async () => {
      const res = await user.count({ name: 'Linus' })
      assert.strictEqual(res, 1)
    })

    it('should count multiple records', async () => {
      const res = await user.count({ name: { $ne: 'Linus' } })
      assert.strictEqual(res, 2)
    })

    it('should count all records', async () => {
      const res = await user.count({})
      assert.strictEqual(res, 3)
    })
  })

  describe('#distinct', () => {
    it('should find one distinct names', async () => {
      const res = await user.distinct('name', { name: 'Linus' })
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 1)
      assert.strictEqual(res[0], 'Linus')
    })

    it('should find some distinct names', async () => {
      const res = await user.distinct('name', { name: { $ne: 'Linus' } })
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 2)
      assert.ok(res.includes('Steve'))
      assert.ok(res.includes('Bob'))
    })

    it('should find all distinct names', async () => {
      const res = await user.distinct('name')
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 3)
      assert.ok(res.includes('Linus'))
      assert.ok(res.includes('Steve'))
      assert.ok(res.includes('Bob'))
    })

    it('should find all distinct fruits', async () => {
      const res = await user.distinct('fruits')
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 4)
      assert.ok(res.includes('Apple'))
      assert.ok(res.includes('Avocado'))
      assert.ok(res.includes('Pear'))
      assert.ok(res.includes('Strawberries'))
    })

    it('should find some distinct fruits', async () => {
      const res = await user.distinct('fruits', { fruits: 'Apple' })
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 3)
      assert.ok(res.includes('Apple'))
      assert.ok(res.includes('Avocado'))
      assert.ok(res.includes('Pear'))
    })

    it('should find one distinct fruit', async () => {
      const res = await user.distinct('fruits', { fruits: 'Strawberries' })
      assert.ok(Array.isArray(res))
      assert.strictEqual(res.length, 1)
      assert.ok(res.includes('Strawberries'))
    })
  })

  describe('#exists', () => {
    it('should find no records', async () => {
      const res = await user.exists({ name: 'Foobar' })
      assert.strictEqual(res, false)
    })

    it('should find a record', async () => {
      const res = await user.exists({ name: 'Linus' })
      assert.strictEqual(res, true)
    })

    it('should find multiple records', async () => {
      const res = await user.exists({ name: { $ne: 'Linus' } })
      assert.strictEqual(res, true)
    })

    it('should find all records', async () => {
      const res = await user.exists({})
      assert.strictEqual(res, true)
    })
  })

  describe('#insert', () => {
    it('should insert a single document', async () => {
      const doc = await user.insert({ test: 'foo' })
      assert.ok(doc)
      assert.strictEqual(doc.test, 'foo')
    })

    it('should insert multiple documents', async () => {
      const docs = await user.insert([{ test: 'foo' }, { test: 'bar' }])
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
      assert.strictEqual(docs[0].test, 'foo')
      assert.strictEqual(docs[1].test, 'bar')
    })

    it('should give inserted document', async () => {
      const a = { test: 'foo' }
      const b = await user.insert(a)

      // @ts-ignore
      assert(a !== b)

      assert(a._id == null)
      assert(b._id != null)
    })

    it('should give inserted documents', async () => {
      const a = [{ test: 'foo' }, { test: 'bar' }]
      const b = await user.insert(a)

      // @ts-ignore
      assert(a !== b)

      assert(a[0] !== b[0])
      assert(a[1] !== b[1])
      assert(a[0]._id == null)
      assert(b[0]._id != null)
      assert(a[1]._id == null)
      assert(b[1]._id != null)
    })
  })

  describe('#findOneAndUpdate', () => {
    it('should update one record', async () => {
      const res = await user.findOneAndUpdate({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.strictEqual(res.name, 'Linus')
      assert.strictEqual(res.year, undefined)

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
      assert.strictEqual(docs[0].year, 1992)
    })

    it('should return the updated record', async () => {
      const res = await user.findOneAndUpdate({ name: 'Linus' }, { $set: { year: 1992 } }, { returnOriginal: false })
      assert.strictEqual(res.name, 'Linus')
      assert.strictEqual(res.year, 1992)

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
      assert.strictEqual(docs[0].year, 1992)
    })

    it('should return the upserted record', async () => {
      const id = user.id()

      assert.deepStrictEqual(
        await user.findOneAndUpdate({ _id: id }, { $inc: { a: 1 }, $setOnInsert: { b: 1 } }, { returnOriginal: false, upsert: true }),
        { _id: id, a: 1, b: 1 }
      )

      assert.deepStrictEqual(
        await user.findOneAndUpdate({ _id: id }, { $inc: { a: 1 }, $setOnInsert: { b: 2 } }, { returnOriginal: false, upsert: true }),
        { _id: id, a: 2, b: 1 }
      )

      assert.deepStrictEqual(
        await user.findOneAndUpdate({ _id: id }, { $inc: { a: 1 }, $setOnInsert: { b: 3 } }, { returnOriginal: false, upsert: true }),
        { _id: id, a: 3, b: 1 }
      )
    })
  })

  describe('#updateOne', () => {
    it('should update one record', async () => {
      const res = await user.updateOne({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.deepStrictEqual(res, { matched: 1, modified: 1 })

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
      assert.strictEqual(docs[0].year, 1992)
    })

    it('should only update one record', async () => {
      const res = await user.updateOne({}, { $set: { planet: 'Earth' } })
      assert.deepStrictEqual(res, { matched: 1, modified: 1 })
    })

    it('should return number of documents matched & modified', async () => {
      const first = await user.updateOne({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.deepStrictEqual(first, { matched: 1, modified: 1 })

      const second = await user.updateOne({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.deepStrictEqual(second, { matched: 1, modified: 0 })
    })
  })

  describe('#updateMany', () => {
    it('should update multiple records', async () => {
      const res = await user.updateMany({ name: { $ne: 'Linus' } }, { $set: { famous: true } })
      assert.deepStrictEqual(res, { matched: 2, modified: 2 })

      const docs = await user.find({ name: { $ne: 'Linus' } })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
      assert.strictEqual(docs[0].famous, true)
      assert.strictEqual(docs[1].famous, true)
    })

    it('should update all records', async () => {
      const res = await user.updateMany({}, { $set: { planet: 'Earth' } })
      assert.deepStrictEqual(res, { matched: 3, modified: 3 })

      const docs = await user.find({})
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 3)
      assert.strictEqual(docs[0].planet, 'Earth')
      assert.strictEqual(docs[1].planet, 'Earth')
      assert.strictEqual(docs[2].planet, 'Earth')
    })

    it('should return number of documents matched & modified', async () => {
      const first = await user.updateMany({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.deepStrictEqual(first, { matched: 1, modified: 1 })

      const second = await user.updateMany({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.deepStrictEqual(second, { matched: 1, modified: 0 })

      const third = await user.updateMany({ name: { $ne: 'Linus' } }, { $set: { year: 1992 } })
      assert.deepStrictEqual(third, { matched: 2, modified: 2 })

      const fourth = await user.updateMany({ name: { $ne: 'Linus' } }, { $set: { year: 1992 } })
      assert.deepStrictEqual(fourth, { matched: 2, modified: 0 })
    })
  })

  describe('#deleteOne', () => {
    it('should delete one record', async () => {
      const res = await user.deleteOne({ name: 'Linus' })
      assert.strictEqual(res, 1)

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })

    it('should only delete one record', async () => {
      const res = await user.deleteOne({})
      assert.strictEqual(res, 1)
    })
  })

  describe('#deleteMany', () => {
    it('should delete multiple records', async () => {
      const res = await user.deleteMany({ name: { $ne: 'Linus' } })
      assert.strictEqual(res, 2)

      const docs = await user.find({ name: { $ne: 'Linus' } })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })

    it('should delete all records', async () => {
      const res = await user.deleteMany({})
      assert.strictEqual(res, 3)

      const docs = await user.find({})
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })
  })
})
