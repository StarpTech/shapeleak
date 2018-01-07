'use strict'

const ErrorStackParser = require('error-stack-parser')
const Chalk = require('chalk')
const LogUpdate = require('log-update')
const items = new Map()

function build(pObject) {
  if (
    (typeof pObject !== 'object' && typeof pObject !== 'function') ||
    pObject === null
  ) {
    return pObject
  }

  function getStack(functionName) {
    const trace = {}
    Error.captureStackTrace(trace)
    const frames = ErrorStackParser.parse(trace)
    let index = 0

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]
      if (frame.functionName === functionName) {
        if (frames[i + 1].functionName !== functionName) {
          index = i + 1
          break
        }
      }
    }

    return frames[index]
  }

  function draw() {
    let text = ''
    for (const [fileName, value] of items) {
      text += fileName + '\n'
      for (let i = 0; i < value.length; i++) {
        const frame = value[i]
        const fieldsLimit = 20
        const shapeString =
          frame.shape.length < fieldsLimit
            ? frame.shape
            : frame.shape.slice(0, fieldsLimit).join(',') + '...'
        const location = `${frame.stackFrame.lineNumber}:${
          frame.stackFrame.columnNumber
        }`

        if (frame.operation === 'delete') {
          text += `${' '}${location}  ${Chalk.red.bold('error')} - Property '${
            frame.property
          }' was deleted from shape (${shapeString}) \n`
        } else if (frame.operation === 'set') {
          text += `${' '}${location}  ${Chalk.red.bold('error')} - Property '${
            frame.property
          }' was added to shape (${shapeString}) \n`
        } else if (frame.operation === 'type') {
          text += `${' '}${location}  ${Chalk.yellow.bold(
            'warn'
          )}${'  '}- Property '${frame.property}' has changed it's type from '${
            frame.oldType
          }' to '${frame.newType}' \n`
        }
      }
    }

    LogUpdate(text)
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
      const stackFrame = getStack('Object.deleteProperty')
      const item = { stackFrame, operation: 'delete', shape, property }
      if (items.has(stackFrame.fileName)) {
        items.get(stackFrame.fileName).push(item)
      } else {
        items.set(stackFrame.fileName, [item])
      }

      draw()

      delete target[property]
      return true
    },
    set: (target, property, value, receiver) => {
      const shape = Object.getOwnPropertyNames(target)
      const stackFrame = getStack('Object.set')
      const item = { stackFrame, operation: 'set', shape, property }
      if (shape.indexOf(property) === -1) {
        if (items.has(stackFrame.fileName)) {
          items.get(stackFrame.fileName).push(item)
        } else {
          items.set(stackFrame.fileName, [item])
        }
      }
      if (target[property] && typeof target[property] !== typeof value) {
        const item = {
          stackFrame,
          operation: 'type',
          shape,
          property,
          oldType: typeof target[property],
          newType: typeof value
        }
        if (items.has(stackFrame.fileName)) {
          items.get(stackFrame.fileName).push(item)
        } else {
          items.set(stackFrame.fileName, [item])
        }
      }

      draw()

      target[property] = value
      return true
    }
  }

  return new Proxy(pObject, proxyOpts)
}

module.exports = build
