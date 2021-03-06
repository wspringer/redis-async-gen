![Build status](https://travis-ci.org/wspringer/redis-async-gen.svg?branch=master)

# README

A little library to make scanning for a set of keys in a Redis database a little bit more tolerable. 

Scanning a Redis database for a key matching a pattern is not necessarily hard, but if you use the standard Redis NPM library, then there's still quite some stuff that you need to carefully handle yourself. 

This project figures all of that can be simplified by introducing a *generator* for scanning keys, allowing the blissfully ignorant JavaScript programmer to simply use a `for` comprehension:

```javascript
const redis = require('redis')
const client = redis.createClient(…)
const generators = require('redis-async-gen')
const { keysMatching } = generators.using(client)

…

for await (const key of keysMatching('test*')) {
  console.info(key)
}
```

Under the hoods, this library will execute the scan command repeatedly, fetching new sets of keys whenever it needs. The underlying cursor logic is completely hidden. 

If you *are* using the `for` comprehension to loop over keys matching a certain pattern, then be advised that you can break out of the loop at any time using the `break` operation. 

The library also has support for scanning values from a [Set](https://redis.io/topics/data-types#sets). The following will retrieve all values from a Set defined at key `aaa`, starting with the prefix `test`.

```javascript
const redis = require('redis')
const client = redis.createClient(…)
const generators = require('redis-async-gen')
const { keysMatching } = generators.using(client)

…

for await (const key of valuesMatching('aaa', 'test*')) {
  console.info(key)
}
```
