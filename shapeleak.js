'use strict'

const ErrorStackParser = require('error-stack-parser')
const Chalk = require('chalk')
const _ = require('lodash')

function build(pObject) {
  if (
    (typeof pObject !== 'object' && typeof pObject !== 'function') ||
    pObject === null
  ) {
    return pObject
  }

  function getStack(operation) {
    const trace = {}
    Error.captureStackTrace(trace)
    const frames = ErrorStackParser.parse(trace)
    let index = 0

    switch (operation) {
      case 'set':
        index = _.findLastIndex(
          frames,
          x =>
            x.functionName === 'Object.set' &&
            x.fileName.endsWith('shaped\\shapeleak.js')
        )
        break
      case 'delete':
        index = _.findLastIndex(
          frames,
          x =>
            x.functionName === 'Object.deleteProperty' &&
            x.fileName.endsWith('shaped\\shapeleak.js')
        )
        break
    }

    const targetFrame = frames[index + 1]

    return `${targetFrame.fileName}:${targetFrame.lineNumber}:${
      targetFrame.columnNumber
    }`
  }

  const proxyOpts = {
    apply: function(target, thisArg, argumentsList) {
      const newObj = target.apply(thisArg, argumentsList)
      return new Proxy(newObj, proxyOpts)
    },
    construct: function(Target, argumentsList, newTarget) {
      const newObj = new Target(...argumentsList)
      return new Proxy(newObj, proxyOpts)
    },
    deleteProperty: (target, property) => {
      const shape = Object.getOwnPropertyNames(target)
      console.log(Chalk.blue.underline(`${getStack('delete')}`))
      console.log(
        `\t Property '${Chalk.blue.bgRed.bold(
          property
        )}' was deleted from original shape [${shape.join(',')}]`
      )
      delete target[property]
      return true
    },
    set: (target, property, value, receiver) => {
      const shape = Object.getOwnPropertyNames(target)
      if (shape.indexOf(property) === -1) {
        console.log(Chalk.blue.underline(`${getStack('set')}`))
        console.log(
          `\t Property '${Chalk.blue.bgRed.bold(
            property
          )}' was added to original shape [${shape.join(',')}]`
        )
      } else if (typeof target[property] !== typeof value) {
        console.log(Chalk.blue.underline(`${getStack('set')}`))
        console.log(
          `\t Property '${Chalk.blue.bgRed.bold(
            property
          )}' has changed their concrete type from '${typeof target[
            property
          ]}' to '${typeof value}'`
        )
      }

      target[property] = value
      return true
    }
  }

  return new Proxy(pObject, proxyOpts)
}

module.exports = build
