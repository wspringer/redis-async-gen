import { promisify } from 'util'

export function using (client) {
  const scan = promisify(client.scan).bind(client)
  const sscan = promisify(client.sscan).bind(client)
  return {
    keysMatching: async function * (pattern) {
      async function * iterate (curs, pattern) {
        const [cursor, keys] = await scan(curs, 'MATCH', pattern)
        for (const key of keys) yield key
        if (cursor !== '0') yield * iterate(cursor, pattern)
      }
      yield * iterate(0, pattern)
    },
    valuesMatching: async function * (key, pattern) {
      async function * iterate (curs, pattern) {
        const [cursor, values] = await sscan(key, curs, 'MATCH', pattern)
        for (const value of values) yield value
        if (cursor !== '0') yield * iterate(cursor, pattern)
      }
      yield * iterate(0, pattern)
    }
  }
}
