# shapeleak
Find subsequent changes in Objects which can result in unoptimized code. If you don't know what we talking about I can recommend [this](https://blog.ghaiklor.com/optimizations-tricks-in-v8-d284b6c8b183) article.

Requires Node 6.4+

## Features

- Print exact location of the vulnerability.
- Can be applied to Factory, Object-Literal and objects instantiated by `new`.
- Does not break existing code.

## Example
```js
const S = require('shapeleak')

// new

class A {
  constructor(name) {
    this.name = name
  }
}

A = S(A)

const a = new A('peter')
a.name = 'sandra'
a.name = 1
a.foo = 'bar'
delete a.name

// Factory

function build(name) {
  return {
    name
  }
}

build = S(build)

const b = build('peter')
b.name = 'sandra'
b.name = 1
b.foo = 'bar'
delete b.name

// Object literal

let c = Shaped({
  name: 'peter'
})

c.name = 'sandra'
c.name = 1
c.foo = 'bar'
delete b.name
```

## Output
```
E:\Repositorys\shaped\example.js
  20:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  21:7  create - Property 'foo' was added to shape (name)
  22:1  delete - Property 'name' was deleted from shape (name,foo)
  37:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  38:7  create - Property 'foo' was added to shape (name)
  39:1  delete - Property 'name' was deleted from shape (name,foo)
  50:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  51:7  create - Property 'foo' was added to shape (name)
  52:1  delete - Property 'name' was deleted from shape (foo)
```
