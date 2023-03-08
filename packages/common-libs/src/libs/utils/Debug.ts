import { isObj, isArr } from './typeof'

type DebugMethodNames = 'log' | 'error' | 'info' | 'warn'
interface DebugMethod {
  (msg?: any, ...optionalParams: any[]): void
  parse?(...args: any[]): void
}

class Debug {
  public log: DebugMethod = () => {}
  public error: DebugMethod = () => {}
  public info: DebugMethod = () => {}
  public warn: DebugMethod = () => {}

  private debugMode: boolean = false

  constructor(msg?: string) {
    const t = this
    msg = msg || 'debug message:'

    t.log = t.createDebugMethod('log', null, msg)
    t.error = t.createDebugMethod('error', null, msg)
    t.info = t.createDebugMethod('info', null, msg)
    t.warn = t.createDebugMethod('warn', null, msg)
  }

  public create(msg?: string): Debug {
    return new Debug(msg)
  }

  public setDebugMode(mode: boolean): void {
    this.debugMode = mode
  }

  public enable() {
    this.setDebugMode(true)
  }

  public disable() {
    this.setDebugMode(false)
  }

  public isDebugMode(): boolean {
    return this.debugMode
  }

  private createDebugMethod(name: DebugMethodNames, color?: string | null, tipsMsg?: string): DebugMethod {
    const bgColorMap: Record<DebugMethodNames, string> = {
      info: '#2274A5',
      log: '#95B46A',
      error: '#D33F49',
      warn: '#FFA500',
    }

    const handler: DebugMethod = (...args: any[]) => {
      if (!this.isDebugMode()) return

      const curTime = new Date()
      const H = curTime.getHours()
      const M = curTime.getMinutes()
      const S = curTime.getSeconds()
      const msg = tipsMsg || 'debug message:'

      args.unshift(`color: white; background-color: ${color || bgColorMap[name] || '#95B46A'}`)
      args.unshift(`%c [${H}:${M}:${S}] ${msg} `)
      window.console[name].apply(window.console, args)
    }

    handler.parse = (...args: any[]) => {
      args.forEach((val, index) => {
        if (val) {
          if (val.__ob__ || isObj(val) || isArr(val)) {
            try {
              args[index] = JSON.parse(JSON.stringify(val))
            } catch (e) {
              args[index] = val
            }
          } else if (typeof val === 'string') {
            const tmpObj = JSON.parse(JSON.stringify(val))
            if (isObj(tmpObj) || isArr(tmpObj)) {
              args[index] = tmpObj
            }
          }
        }
      })
      handler(...args)
    }

    return handler
  }
}

export default Debug
