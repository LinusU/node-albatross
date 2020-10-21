/* eslint-env mocha */

const assert = require('assert')
const assertRejects = require('assert-rejects')
const { MongoClient } = require('mongodb')
const albatross = require('../')

const originalConnect = MongoClient.connect

describe('Reconnection', function () {
  afterEach(() => {
    MongoClient.connect = originalConnect
  })

  it('should reconnect when first connection fails', async () => {
    const db = albatross('test://foo')

    class FakeDb {
      command () { return Promise.resolve({ ok: 1 }) }
    }

    class FakeClient {
      isConnected () { return true }
      db () { return new FakeDb() }
    }

    MongoClient.connect = () => Promise.reject(new Error('test'))
    await assertRejects(db.ping(), 'test')

    MongoClient.connect = () => Promise.resolve(/** @type {any} */ (new FakeClient()))
    await db.ping()
  })

  it('should reconnect when a ping fails', async () => {
    const db = albatross('test://foo')

    let pingOk = true
    let closeCalled = 0
    let connectCalled = 0

    class FakeDb {
      command () { return pingOk ? Promise.resolve({ ok: 1 }) : Promise.reject(new Error('test')) }
    }

    class FakeClient {
      constructor () { connectCalled += 1 }
      isConnected () { return true }
      db () { return new FakeDb() }
      async close () { closeCalled += 1 }
    }

    MongoClient.connect = () => Promise.resolve(/** @type {any} */ (new FakeClient()))

    assert.strictEqual(closeCalled, 0)
    assert.strictEqual(connectCalled, 0)
    await db.ping()
    assert.strictEqual(closeCalled, 0)
    assert.strictEqual(connectCalled, 1)

    pingOk = false

    assert.strictEqual(closeCalled, 0)
    assert.strictEqual(connectCalled, 1)
    await assertRejects(db.ping(), 'test')
    assert.strictEqual(closeCalled, 1)
    assert.strictEqual(connectCalled, 1)

    pingOk = true

    assert.strictEqual(closeCalled, 1)
    assert.strictEqual(connectCalled, 1)
    MongoClient.connect = () => Promise.resolve(/** @type {any} */ (new FakeClient()))
    await db.ping()
    assert.strictEqual(closeCalled, 1)
    assert.strictEqual(connectCalled, 2)
  })

  it('should reconnect when connection is lost', async () => {
    const db = albatross('test://foo')

    let networkUp = true
    let connectCalled = 0

    class FakeDb {
      command () { Promise.resolve({ ok: 1 }) }
    }

    class FakeClient {
      isConnected () { return networkUp }
      db () { return new FakeDb() }
      async close () {}
    }

    MongoClient.connect = () => {
      connectCalled += 1
      if (!networkUp) return Promise.reject(new Error('test'))
      return Promise.resolve(/** @type {any} */ (new FakeClient()))
    }

    assert.strictEqual(connectCalled, 0)
    await db.ping()
    assert.strictEqual(connectCalled, 1)

    assert.strictEqual(connectCalled, 1)
    await db.ping()
    assert.strictEqual(connectCalled, 1)

    networkUp = false

    assert.strictEqual(connectCalled, 1)
    await assertRejects(db.ping(), 'test')
    assert.strictEqual(connectCalled, 2)

    assert.strictEqual(connectCalled, 2)
    await assertRejects(db.ping(), 'test')
    assert.strictEqual(connectCalled, 3)

    networkUp = true

    assert.strictEqual(connectCalled, 3)
    await db.ping()
    assert.strictEqual(connectCalled, 4)

    assert.strictEqual(connectCalled, 4)
    await db.ping()
    assert.strictEqual(connectCalled, 4)
  })
})
