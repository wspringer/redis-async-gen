import { createClient } from 'redis'
import { createClient as createAsyncClient } from 'async-redis'
import 'regenerator-runtime/runtime'
import * as generators from './index'

const freePort = require('find-free-port')
const RedisServer = require('redis-server')

describe('async generator', () => {
  let server = null
  let port = -1
  let client = null
  let asyncClient = null
  let gen = null

  beforeAll(async () => {
    [port] = await freePort(3000)
    server = new RedisServer(port)
    await server.open()
    client = createClient(port)
    gen = generators.using(client)
    asyncClient = createAsyncClient(port)
  })

  afterAll(async () => {
    client.end(false)
    await asyncClient.end(false)
    await server.close()
  })

  it('should return all keys', async () => {
    const allKeys = [...Array(100).keys()].map((idx) => {
      return `test1:${idx}`
    })
    await Promise.all(allKeys.map((key) => asyncClient.sadd(key, 'foo')))
    let counted = 0
    for await (const key of gen.keysMatching('test1*')) {
      expect(allKeys).toContain(key)
      counted += 1
    }
    expect(counted).toEqual(allKeys.length)
  })

  it('should be possible to break halfway', async () => {
    const allKeys = [...Array(100).keys()].map((idx) => {
      return `test2:${idx}`
    })
    await Promise.all(allKeys.map((key) => asyncClient.sadd(key, 'foo')))
    let counted = 0
    for await (const key of gen.keysMatching('test2*')) {
      expect(allKeys).toContain(key)
      counted += 1
      if (counted === 12) break
    }
    expect(counted).toEqual(12)
  })

  it('should return all values', async () => {
    const allValues = [...Array(100).keys()].map((idx) => {
      return `test3:${idx}`
    })
    await Promise.all(allValues.map((value) => asyncClient.sadd('test3', value)))
    let counted = 0
    for await (const value of gen.valuesMatching('test3', 'test3*')) {
      expect(allValues).toContain(value)
      counted += 1
    }
    expect(counted).toEqual(allValues.length)
  })
})
