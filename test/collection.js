/* eslint-env mocha */

const assert = require('assert')
const crypto = require('crypto')
const albatross = require('../')

const id = crypto.randomBytes(4).toString('hex')
const ObjectID = albatross.ObjectID

describe('Collection', () => {
  let db, user, linusId

  before(async () => {
    db = albatross('mongodb://localhost/albatross-test')
    user = db.collection('user-' + id)
    await user.remove({})
  })

  beforeEach(async () => {
    linusId = new ObjectID()

    await user.insert({ name: 'Linus', _id: linusId })
    await user.insert({ name: 'Steve' })
    await user.insert({ name: 'Bob' })
  })

  afterEach(async () => {
    await user.remove({})
  })

  after(async () => {
    await db.close()
  })

  describe('#findById', () => {
    it('should find one record', async () => {
      const doc = await user.findById(linusId)
      assert.ok(doc)
      assert.strictEqual(doc.name, 'Linus')
    })

    it('should not match if string', async () => {
      const doc = await user.findById(linusId.toHexString())
      assert.strictEqual(doc, null)
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
  })

  describe('#update', () => {
    it('should update one record', async () => {
      const res = await user.update({ name: 'Linus' }, { $set: { year: 1992 } })
      assert.strictEqual(res, 1)

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 1)
      assert.strictEqual(docs[0].name, 'Linus')
      assert.strictEqual(docs[0].year, 1992)
    })

    it('should update multiple records', async () => {
      const res = await user.update({ name: { $ne: 'Linus' } }, { $set: { famous: true } }, { multi: true })
      assert.strictEqual(res, 2)

      const docs = await user.find({ name: { $ne: 'Linus' } })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 2)
      assert.strictEqual(docs[0].famous, true)
      assert.strictEqual(docs[1].famous, true)
    })

    it('should update all records', async () => {
      const res = await user.update({}, { $set: { planet: 'Earth' } }, { multi: true })
      assert.strictEqual(res, 3)

      const docs = await user.find({})
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 3)
      assert.strictEqual(docs[0].planet, 'Earth')
      assert.strictEqual(docs[1].planet, 'Earth')
      assert.strictEqual(docs[2].planet, 'Earth')
    })

    it('should only update one record', async () => {
      const res = await user.update({}, { $set: { planet: 'Earth' } })
      assert.strictEqual(res, 1)
    })

    it('should not accept single', () => {
      assert.throws(() => {
        user.update({}, { $set: { planet: 'Earth' } }, { single: true })
      })
    })
  })

  describe('#remove', () => {
    it('should remove one record', async () => {
      const res = await user.remove({ name: 'Linus' })
      assert.strictEqual(res, 1)

      const docs = await user.find({ name: 'Linus' })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })

    it('should remove multiple records', async () => {
      const res = await user.remove({ name: { $ne: 'Linus' } })
      assert.strictEqual(res, 2)

      const docs = await user.find({ name: { $ne: 'Linus' } })
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })

    it('should remove all records', async () => {
      const res = await user.remove({})
      assert.strictEqual(res, 3)

      const docs = await user.find({})
      assert.ok(Array.isArray(docs))
      assert.strictEqual(docs.length, 0)
    })

    it('should only remove one record', async () => {
      const res = await user.remove({}, { single: true })
      assert.strictEqual(res, 1)
    })

    it('should not accept multi', () => {
      assert.throws(() => {
        user.remove({}, { multi: false })
      })
    })
  })
})
