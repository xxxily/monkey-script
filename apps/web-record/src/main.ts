import './style.css'
import recordConfig from './recordConfig'
import debug from './debug'
import webObs, { registerWebObserverHotkey } from './webObs'
import highlightPlugin from './highlightPlugin'
import { fromEvent, filter, bufferTime } from 'rxjs'
import userActionsToCode from './userActionToCode'
import { menuRegister } from './menuManager'
// import { getXPath, getElementByXPath, getStyles } from './helper'

function main() {
  menuRegister()

  if (!recordConfig.get('enable')) return

  debug.log('web-record init')

  /* 是否默认启动webRecord的录制功能 */
  recordConfig.get('webObs.enable') ? webObs.observer() : webObs.unObserver()
  registerWebObserverHotkey()

  window.addEventListener('DOMContentLoaded', () => {
    highlightPlugin.init()
  })

  const targetKeys = ['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'Space']
  const dblKeyPress = fromEvent(document, 'keydown', {
    capture: true,
  }).pipe(
    /* 数据只缓存1秒 */
    bufferTime(1000),
    /* 是否为双击事件的过滤器 */
    filter((events) => {
      if (events.length === 2) {
        const event = events[0] as KeyboardEvent
        const event2 = events[1] as KeyboardEvent
        // debug.log('[ctrlPress][event]', event.code)
        return event.key === event2.key && targetKeys.includes(event2.code)
      } else {
        return false
      }
    })
  )

  dblKeyPress.subscribe((events) => {
    debug.log(`[Recorded actions]`, webObs.recorder.getActions())
    debug.log(`[Recorded actions][code]\n`, userActionsToCode(webObs.recorder.getActions(), JSON.parse(recordConfig.get('codeTemplate')), true))

    // const curEl = elementSelection.getCurrentTarget()
    // if (curEl) {
    //   const xpath = getXPath(curEl)
    //   debug.log('[dblKeyPress]', xpath, getElementByXPath(xpath) === curEl)
    //   debug.log(`[getStyles]`, getStyles(curEl))
    // } else {
    //   const event = events[1] as KeyboardEvent
    //   debug.log('[dblKeyPress][subscribe]', event.code, events)
    // }
  })
}

function init(retryCount: number = 0): boolean | void {
  if (!window.document || !window.document.documentElement) {
    setTimeout(() => {
      if (retryCount < 200) {
        init(retryCount + 1)
      } else {
        debug.error('not documentElement detected!', window)
      }
    }, 10)

    return false
  } else if (retryCount > 0) {
    debug.warn('documentElement detected!', retryCount, window)
  }

  main()
}

/**
 * 某些极端情况下，直接访问window对象都会导致报错，所以整个init都try起来
 * 例如：www.icourse163.org 就有一定的机率异常
 */
let initTryCount = 0
try {
  init(0)
} catch (e) {
  setTimeout(() => {
    if (initTryCount < 200) {
      initTryCount++
      init(0)
      debug.error('init error', initTryCount, e)
    }
  }, 10)
}
