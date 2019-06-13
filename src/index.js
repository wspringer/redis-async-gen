import { promisify } from 'util'

export function create(client) {

  const scan = promisify(client.scan).bind(client)

  return {
    keysMatching: async function* (pattern) {
      async function* iterate(curs, pattern) {
        const [cursor, keys] = await scan(curs, 'MATCH', pattern)
        for (const key of keys) yield key        
        if (cursor !== '0') yield* iterate(cursor, pattern)
      }
      yield* iterate(0, pattern)
    }  
  }

}

