/* eslint-env mocha */

import assert from 'node:assert'
import stream from 'node:stream'
import getStream from 'get-stream'

import albatross, { ObjectId } from '../index.js'

const NAME = 'hello.txt'
const TYPE = 'text/plain'
const TEST = 'Hello, World!'
const META = { hello: 'World' }
const OPTS = { filename: NAME, contentType: TYPE, metadata: META }

function testStream () {
  const s = new stream.PassThrough()
  s.end(Buffer.from(TEST))
  return s
}

describe('Grid', () => {
  describe('#upload', () => {
    /** @type {import('../').Grid} */
    let grid
    /** @type {import('../').ObjectId} */
    let fileId

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

      assert.ok(result.id instanceof ObjectId)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(result.filename, NAME)
      assert.strictEqual(result.contentType, TYPE)
      assert.deepStrictEqual(result.metadata, META)
    })

    it('should upload a file without options', async () => {
      const result = await grid.upload(testStream())
      fileId = result.id

      assert.ok(result.id instanceof ObjectId)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(result.filename, '')
      assert.strictEqual(result.contentType, '')
      assert.deepStrictEqual(result.metadata, {})
    })
  })

  describe('#download', () => {
    /** @type {import('../').Grid} */
    let grid
    /** @type {import('../').ObjectId} */
    let fileId

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

      assert.strictEqual(result.length, TEST.length)
      assert.strictEqual(typeof result.chunkSize, 'number')
      assert.strictEqual(result.filename, NAME)
      assert.strictEqual(result.contentType, TYPE)
      assert.deepStrictEqual(result.metadata, META)

      assert.strictEqual(await getStream(result.stream), TEST)
    })
  })

  describe('#delete', () => {
    /** @type {import('../').Grid} */
    let grid
    /** @type {import('../').ObjectId} */
    let fileId

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
