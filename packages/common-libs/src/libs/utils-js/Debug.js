import { isObj, isArr } from './typeof'

class Debug {
  constructor (msg) {
    const t = this
    msg = msg || 'debug message:'
    t.log = t.createDebugMethod('log', null, msg)
    t.error = t.createDebugMethod('error', null, msg)
    t.info = t.createDebugMethod('info', null, msg)
  }

  create (msg) {
    return new Debug(msg)
  }

  createDebugMethod (name, color, tipsMsg) {
    name = name || 'info'

    const bgColorMap = {
      info: '#2274A5',
      log: '#95B46A',
      error: '#D33F49'
    }

    const handler = function () {
      if (!window._debugMode_) {
        return false
      }

      const curTime = new Date()
      const H = curTime.getHours()
      const M = curTime.getMinutes()
      const S = curTime.getSeconds()
      const msg = tipsMsg || 'debug message:'

      const arg = Array.from(arguments)
      arg.unshift(`color: white; background-color: ${color || bgColorMap[name] || '#95B46A'}`)
      arg.unshift(`%c [${H}:${M}:${S}] ${msg} `)
      window.console[name].apply(window.console, arg)
    }

    handler.parse = function () {
      const arg = Array.from(arguments)
      arg.forEach((val, index) => {
        if (val) {
          if (val.__ob__ || isObj(val) || isArr(val)) {
            try {
              arg[index] = JSON.parse(JSON.stringify(val))
            } catch (e) {
              arg[index] = val
            }
          } else if (typeof val === 'string') {
            const tmpObj = JSON.parse(JSON.stringify(val))
            if (isObj(tmpObj) || isArr(tmpObj)) {
              arg[index] = tmpObj
            }
          }
        }
      })
      handler.apply(handler, arg)
    }

    return handler
  }

  isDebugMode () {
    return Boolean(window._debugMode_)
  }
}

export default new Debug()
