'use strict'

const ErrorStackParser = require('error-stack-parser')
const Chalk = require('chalk')

function build(pObject) {
  if (typeof pObject !== 'object' || pObject === null) {
    return pObject
  }

  function getStack() {
    const trace = {}
    Error.captureStackTrace(trace)
    const frames = ErrorStackParser.parse(trace)
    const targetFrame = frames[2]
    return `${targetFrame.fileName}:${targetFrame.lineNumber}:${
      targetFrame.columnNumber
    }`
  }

  function shapeDetector(shape, newObj) {
    return new Proxy(newObj, {
      deleteProperty: (target, property) => {
        console.log(Chalk.blue.underline(`${getStack()}`))
        console.log(
          `\t Property '${Chalk.blue.bgRed.bold(
            property
          )}' was deleted from original shape [${shape.join(',')}]`
        )
        delete target[property]
        return true
      },
      set: (target, property, value, receiver) => {
        if (shape.indexOf(property) === -1) {
          console.log(Chalk.blue.underline(`${getStack()}`))
          console.log(
            `\t Property '${Chalk.blue.bgRed.bold(
              property
            )}' was added to original shape [${shape.join(',')}]`
          )
        } else if (typeof target[property] !== typeof value) {
          console.log(Chalk.blue.underline(`${getStack()}`))
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
    })
  }

  return new Proxy(pObject, {
    apply: function(target, thisArg, argumentsList) {
      const newObj = target.apply(thisArg, argumentsList)
      const shape = Object.getOwnPropertyNames(newObj)
      return shapeDetector(shape, newObj)
    },
    construct: function(Target, argumentsList, newTarget) {
      const newObj = new Target(...argumentsList)
      const shape = Object.getOwnPropertyNames(newObj)
      return shapeDetector(shape, newObj)
    }
  })
}

module.exports = build
