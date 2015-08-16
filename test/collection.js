/* eslint-env mocha */

var assert = require('assert')
var includes = require('array-includes')
var albatross = require('../')

var ObjectID = albatross.ObjectID

describe('Collection', function () {
  var db, user, linusId

  before(function () {
    db = albatross('mongodb://localhost/albatross-test')
    user = db.collection('user')
  })

  beforeEach(function () {
    linusId = new ObjectID()

    user
      .remove({})
      .insert({ name: 'Linus', _id: linusId })
      .insert({ name: 'Steve' })
      .insert({ name: 'Bob' })
  })

  describe('#findById', function () {
    it('should find one record', function (done) {
      user.findById(linusId, function (err, doc) {
        assert.ifError(err)
        assert.ok(doc)
        assert.equal(doc.name, 'Linus')
        done()
      })
    })

    it('should not match if string', function (done) {
      user.findById(linusId.toHexString(), function (err, doc) {
        assert.ifError(err)
        assert.equal(doc, null)
        done()
      })
    })
  })

  describe('#findOne', function () {
    it('should find one record', function (done) {
      user.findOne({ name: 'Linus' }, function (err, doc) {
        assert.ifError(err)
        assert.ok(doc)
        assert.equal(doc.name, 'Linus')
        done()
      })
    })

    it('should find only one record', function (done) {
      user.findOne({ name: { $ne: 'Linus' } }, function (err, doc) {
        assert.ifError(err)
        assert.ok(doc)
        assert.notEqual(doc.name, 'Linus')
        done()
      })
    })
  })

  describe('#find', function () {
    it('should find one record', function (done) {
      user.find({ name: 'Linus' }, function (err, docs) {
        assert.ifError(err)
        assert.ok(docs)
        assert.ok(Array.isArray(docs))
        assert.equal(docs.length, 1)
        assert.equal(docs[0].name, 'Linus')
        done()
      })
    })

    it('should find multiple records', function (done) {
      user.find({ name: { $ne: 'Linus' } }, function (err, docs) {
        assert.ifError(err)
        assert.ok(docs)
        assert.ok(Array.isArray(docs))
        assert.equal(docs.length, 2)
        assert.notEqual(docs[0].name, 'Linus')
        assert.notEqual(docs[1].name, 'Linus')
        done()
      })
    })

    it('should find all records', function (done) {
      user.find({}, function (err, docs) {
        assert.ifError(err)
        assert.ok(docs)
        assert.ok(Array.isArray(docs))
        assert.equal(docs.length, 3)
        done()
      })
    })
  })

  describe('#count', function () {
    it('should count one record', function (done) {
      user.count({ name: 'Linus' }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 1)
        done()
      })
    })

    it('should count multiple records', function (done) {
      user.count({ name: { $ne: 'Linus' } }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 2)
        done()
      })
    })

    it('should count all records', function (done) {
      user.count({}, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 3)
        done()
      })
    })
  })

  describe('#distinct', function () {
    it('should find one distinct names', function (done) {
      user.distinct('name', { name: 'Linus' }, function (err, res) {
        assert.ifError(err)
        assert.ok(Array.isArray(res))
        assert.equal(res.length, 1)
        assert.equal(res[0], 'Linus')
        done()
      })
    })

    it('should find some distinct names', function (done) {
      user.distinct('name', { name: { $ne: 'Linus' } }, function (err, res) {
        assert.ifError(err)
        assert.ok(Array.isArray(res))
        assert.equal(res.length, 2)
        assert.ok(includes(res, 'Steve'))
        assert.ok(includes(res, 'Bob'))
        done()
      })
    })

    it('should find all distinct names', function (done) {
      user.distinct('name', function (err, res) {
        assert.ifError(err)
        assert.ok(Array.isArray(res))
        assert.equal(res.length, 3)
        assert.ok(includes(res, 'Linus'))
        assert.ok(includes(res, 'Steve'))
        assert.ok(includes(res, 'Bob'))
        done()
      })
    })
  })

  describe('#insert', function () {
    it('should insert a single document', function (done) {
      user.insert({ test: 'foo' }, function (err, doc) {
        assert.ifError(err)
        assert.ok(doc)
        assert.equal(doc.test, 'foo')
        done()
      })
    })

    it('should insert multiple documents', function (done) {
      user.insert([{ test: 'foo' }, { test: 'bar' }], function (err, docs) {
        assert.ifError(err)
        assert.ok(Array.isArray(docs))
        assert.equal(docs.length, 2)
        assert.equal(docs[0].test, 'foo')
        assert.equal(docs[1].test, 'bar')
        done()
      })
    })
  })

  describe('#update', function () {
    it('should update one record', function (done) {
      user.update({ name: 'Linus' }, { $set: { year: 1992 } }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 1)

        user.find({ name: 'Linus' }, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 1)
          assert.equal(docs[0].name, 'Linus')
          assert.equal(docs[0].year, 1992)
          done()
        })
      })
    })

    it('should update multiple records', function (done) {
      user.update({ name: { $ne: 'Linus' } }, { $set: { famous: true } }, { multi: true }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 2)

        user.find({ name: { $ne: 'Linus' } }, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 2)
          assert.equal(docs[0].famous, true)
          assert.equal(docs[1].famous, true)
          done()
        })
      })
    })

    it('should update all records', function (done) {
      user.update({}, { $set: { planet: 'Earth' } }, { multi: true }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 3)

        user.find({}, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 3)
          assert.equal(docs[0].planet, 'Earth')
          assert.equal(docs[1].planet, 'Earth')
          assert.equal(docs[2].planet, 'Earth')
          done()
        })
      })
    })

    it('should only update one record', function (done) {
      user.update({}, { $set: { planet: 'Earth' } }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 1)
        done()
      })
    })

    it('should not accept single', function () {
      assert.throws(function () {
        user.update({}, { $set: { planet: 'Earth' } }, { single: true })
      })
    })
  })

  describe('#remove', function () {
    it('should remove one record', function (done) {
      user.remove({ name: 'Linus' }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 1)

        user.find({ name: 'Linus' }, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 0)
          done()
        })
      })
    })

    it('should remove multiple records', function (done) {
      user.remove({ name: { $ne: 'Linus' } }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 2)

        user.find({ name: { $ne: 'Linus' } }, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 0)
          done()
        })
      })
    })

    it('should remove all records', function (done) {
      user.remove({}, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 3)

        user.find({}, function (err, docs) {
          assert.ifError(err)
          assert.ok(Array.isArray(docs))
          assert.equal(docs.length, 0)
          done()
        })
      })
    })

    it('should only remove one record', function (done) {
      user.remove({}, { single: true }, function (err, res) {
        assert.ifError(err)
        assert.equal(res, 1)
        done()
      })
    })

    it('should not accept multi', function () {
      assert.throws(function () {
        user.remove({}, { multi: false })
      })
    })
  })
})
