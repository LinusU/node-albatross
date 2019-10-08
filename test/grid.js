/* eslint-env mocha */

var assert = require('assert')
var stream = require('stream')
var crypto = require('crypto')
var getStream = require('get-stream')
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
  s.end(Buffer.from(TEST))
  return s
}

describe('Grid', () => {
  describe('#upload', () => {
    var grid, fileId

    before(() => {
      grid = albatross('mongodb://localhost/albatross-test').grid()
    })

    afterEach(async () => {
      if (!fileId) return
      await grid.delete(fileId)
      fileId = undefined
    })

    after(async () => {
      await grid.parent.close()
    })

    it('should upload a file with options', async () => {
      const result = await grid.upload(testStream(), OPTS)
      fileId = result.id

      assert.ok(result.id instanceof albatross.ObjectID)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.md5, md5(TEST))
      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(result.filename, NAME)
      assert.strictEqual(result.contentType, TYPE)
      assert.deepStrictEqual(result.metadata, META)
    })

    it('should upload a file without options', async () => {
      const result = await grid.upload(testStream())
      fileId = result.id

      assert.ok(result.id instanceof albatross.ObjectID)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.md5, md5(TEST))
      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(result.filename, '')
      assert.strictEqual(result.contentType, '')
      assert.deepStrictEqual(result.metadata, {})
    })
  })

  describe('#download', () => {
    var grid, fileId

    before(async () => {
      grid = albatross('mongodb://localhost/albatross-test').grid()

      const res = await grid.upload(testStream(), OPTS)
      fileId = res.id
    })

    after(async () => {
      if (!fileId) return
      await grid.delete(fileId)
      await grid.parent.close()
    })

    it('should download a file', async () => {
      const result = await grid.download(fileId)

      assert.strictEqual(result.md5, md5(TEST))
      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.filename, NAME)
      assert.strictEqual(result.contentType, TYPE)
      assert.deepStrictEqual(result.metadata, META)

      assert.strictEqual(await getStream(result.stream), TEST)
    })
  })

  describe('#delete', () => {
    var grid, fileId

    before(async () => {
      grid = albatross('mongodb://localhost/albatross-test').grid()

      const res = await grid.upload(testStream(), OPTS)
      fileId = res.id
    })

    after(async () => {
      await grid.parent.close()
    })

    it('should delete a file', async () => {
      await grid.delete(fileId)

      const result = await grid.download(fileId)
      assert.strictEqual(result, null)
    })
  })
})
