# shapeleak
Find subsequent changes in the shape (hidden-class) of your Objects which results in unoptimized code. If you don't know what we talking about I can recommend [this](https://blog.ghaiklor.com/optimizations-tricks-in-v8-d284b6c8b183) article.

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

/*
E:\Repositorys\shaped\example.js:18:8
         Property 'name' has changed their concrete type from 'string' to 'number'
E:\Repositorys\shaped\example.js:19:7
         Property 'foo' was added to original shape [name]
E:\Repositorys\shaped\example.js:20:1
         Property 'name' was deleted from original shape [name]
*/

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

/*
E:\Repositorys\shaped\example.js:35:8
         Property 'name' has changed their concrete type from 'string' to 'number'
E:\Repositorys\shaped\example.js:36:7
         Property 'foo' was added to original shape [name]
E:\Repositorys\shaped\example.js:37:1
         Property 'name' was deleted from original shape [name]
*/

// Object literal

let c = Shaped({
  name: 'peter'
})

c.name = 'sandra'
c.name = 1
c.foo = 'bar'
delete b.name

/*
E:\Repositorys\shaped\example.js:50:8
         Property 'name' has changed their concrete type from 'string' to 'number'
E:\Repositorys\shaped\example.js:51:7
         Property 'foo' was added to original shape [name]
E:\Repositorys\shaped\example.js:52:1
         Property 'name' was deleted from original shape [foo]
*/
```
