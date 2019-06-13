import { createClient } from 'redis'
import { createClient as createAsyncClient } from 'async-redis'
import 'regenerator-runtime/runtime'
import { create } from './index'

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
    gen = create(client)
    asyncClient = createAsyncClient(port)
  })

  afterAll(async () => {
    client.end(false)
    await asyncClient.end(false)
    await server.close()
  })

  it('should return all keys', async () => {
    const allKeys = [...Array(100).keys()].map((idx) => {
      return `test:${idx}`
    })
    await Promise.all(allKeys.map((key) => asyncClient.sadd(key, 'foo')))
    let counted = 0
    for await (const key of gen.keysMatching('test*')) {
      expect(allKeys).toContain(key)      
      counted += 1
    } 
    expect(counted).toEqual(allKeys.length)
  })

})