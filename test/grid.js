/* eslint-env mocha */

var assert = require('assert')
var stream = require('stream')
var crypto = require('crypto')
var concat = require('concat-stream')
var albatross = require('../')

var NAME = 'hello.txt'
var TYPE = 'text/plain'
var TEST = 'Hello, World!'
var META = { hello: 'World' }
var OPTS = { filename: NAME, contentType: TYPE, metadata: META }

function md5 (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

function testStream () {
  var s = new stream.PassThrough()
  s.end(new Buffer(TEST))
  return s
}

describe('Grid', function () {
  describe('#upload', function () {
    var grid, fileId

    before(function () {
      grid = albatross('mongodb://localhost/albatross-test').grid()
    })

    afterEach(function (done) {
      if (!fileId) return done()
      grid.delete(fileId, done)
      fileId = undefined
    })

    it('should upload a file with options', function (done) {
      grid.upload(testStream(), OPTS, function (err, result) {
        assert.ifError(err)

        fileId = result.id

        assert.ok(result.id instanceof albatross.ObjectID)
        assert.equal(typeof result.chunkSize, 'number')
        assert.equal(result.md5, md5(TEST))
        assert.equal(result.length, TEST.length)
        assert.equal(result.filename, NAME)
        assert.equal(result.contentType, TYPE)
        assert.deepEqual(result.metadata, META)

        done()
      })
    })

    it('should upload a file without options', function (done) {
      grid.upload(testStream(), function (err, result) {
        assert.ifError(err)

        fileId = result.id

        assert.ok(result.id instanceof albatross.ObjectID)
        assert.equal(typeof result.chunkSize, 'number')
        assert.equal(result.md5, md5(TEST))
        assert.equal(result.length, TEST.length)
        assert.equal(result.filename, '')
        assert.equal(result.contentType, '')
        assert.deepEqual(result.metadata, {})

        done()
      })
    })
  })

  describe('#download', function () {
    var grid, fileId

    before(function (done) {
      grid = albatross('mongodb://localhost/albatross-test').grid()

      grid.upload(testStream(), OPTS, function (err, res) {
        if (err) return done(err)

        fileId = res.id
        done()
      })
    })

    after(function (done) {
      if (!fileId) return done()
      grid.delete(fileId, done)
    })

    it('should download a file', function (done) {
      grid.download(fileId, function (err, result) {
        assert.ifError(err)

        assert.equal(result.md5, md5(TEST))
        assert.equal(result.length, TEST.length)
        assert.equal(typeof result.chunkSize, 'number')
        assert.equal(result.filename, NAME)
        assert.equal(result.contentType, TYPE)
        assert.deepEqual(result.metadata, META)

        result.stream.pipe(concat(function (body) {
          assert.equal(body.toString(), TEST)
          done()
        }))
      })
    })
  })

  describe('#delete', function () {
    var grid, fileId

    before(function (done) {
      grid = albatross('mongodb://localhost/albatross-test').grid()

      grid.upload(testStream(), OPTS, function (err, res) {
        if (err) return done(err)

        fileId = res.id
        done()
      })
    })

    it('should delete a file', function (done) {
      grid.delete(fileId, function (err) {
        assert.ifError(err)

        grid.download(fileId, function (err, result) {
          assert.ifError(err)
          assert.equal(result, null)
          done()
        })
      })
    })
  })
})
