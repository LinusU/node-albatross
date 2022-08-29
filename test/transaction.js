/* eslint-env mocha */

import assert from 'node:assert'
import crypto from 'node:crypto'

import albatross from '../index.js'

const id = crypto.randomBytes(4).toString('hex')

/**
 * @typedef {Object} User
 * @property {import('bson').ObjectId} _id
 * @property {string} name
 * @property {number} born
 */

describe('Transaction', () => {
  /** @type {import('../').Albatross} */
  let db
  /** @type {import('../').Collection<User>} */
  let user

  before(async () => {
    db = albatross('mongodb://localhost/albatross-test')
    user = db.collection('user-' + id)
    await user.deleteMany({})
  })

  afterEach(async () => {
    await user.deleteMany({})
  })

  after(async () => {
    await db.close()
  })

  describe('#transaction', () => {
    it('should find one record', async () => {
      let result = await db.transaction(async (session) => {
        await user.insert({ name: 'Linus', born: 1992 }, { session })
        await user.insert({ name: 'Steve', born: 1955 }, { session })

        // Not yet visible outside of transaction
        assert.strictEqual(await user.findOne({ born: 1992 }), null)

        return await user.findOne({ born: 1992 }, { session })
      })

      assert.ok(result)
      assert.strictEqual(result.name, 'Linus')
      assert.strictEqual(result.born, 1992)

      // Now visible outside of transaction
      result = await user.findOne({ born: 1992 })

      assert.ok(result)
      assert.strictEqual(result.name, 'Linus')
      assert.strictEqual(result.born, 1992)
    })
  })
})
