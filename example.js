'use strict'

const Shaped = require('./')

/**
 * Class support
 */

class A {
  constructor(name) {
    this.name = name
  }
}

A = Shaped(A)
const a = new A('peter')
a.name = 'sandra'
a.name = 1
a.foo = 'bar'
delete a.name

/**
 * Factory support
 */
function build(name) {
  return {
    name
  }
}

build = Shaped(build)

const b = build('peter')
b.name = 'sandra'
b.name = 1
b.foo = 'bar'
delete b.name
