import './style.css'
import WebObserver from './observers'
import { getXPath, getElementByXPath, getStyles } from './helper'
import ElementSelection from './elementSelection'
import { fromEvent, filter, bufferTime } from 'rxjs'
import userActionsToCode from './userActionToCode'
import { seleniumPythonTemplateMap } from './userActionToCode'
;(() => {
  console.log('web-record init')

  const webObs = new WebObserver(document, {
    click: true,
    dblclick: true,
    mousemove: false,
    mousedown: false,
    mouseup: false,
    mouseenter: false,
    mouseleave: false,
    mouseover: false,
    mouseout: false,
    mousemoveSampleInterval: 30,
    mouseHandler(event, action) {
      if (action.type === 'click' || action.type === 'dblclick') {
        const target = event.target as HTMLElement
        const xpath = getXPath(target)
        action.data.xpath = xpath

        // const styles = getStyles(target)
        // action.data.styles = styles
      }
    },

    keydown: true,
    keyup: true,
    keypress: false,
    keyboardHandler(event, action) {
      /* 忽略用户按下的某些按键 */
      if (event.code === 'ControlRight') {
        /* 标识丢弃掉该action */
        action.__drop__ = true
      }
    },
  })

  /* 注册观察者记录用户操作 */
  webObs.recorder.register((action) => {
    const event = action.data.event
    if (action.type !== 'mousemove' && action.type !== 'dblclick' && action.type !== 'scroll') {
      if (!!false) {
        console.log(`Recorded action: [${action.type}]`, event.target, event)
      }
    }

    if (action.type === 'dblclick') {
      // console.log(`Recorded actions: [${action.type}]`, webObs.recorder.getActions())
    }
  })

  /* 开启观察模式 */
  webObs.observer()

  /* 关闭观察模式 */
  // webObs.unObserver()

  const elementSelection = new ElementSelection(document.documentElement)

  // setTimeout(() => {
  //   elementSelection.disable()
  // }, 1000 * 60 * 5)

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
        // console.log('[ctrlPress][event]', event.code)
        return event.key === event2.key && targetKeys.includes(event2.code)
      } else {
        return false
      }
    })
  )

  dblKeyPress.subscribe((events) => {
    const curEl = elementSelection.getCurrentTarget()

    if (curEl) {
      const xpath = getXPath(curEl)
      console.log('[dblKeyPress]', xpath, getElementByXPath(xpath) === curEl)
      console.log(`[Recorded actions]`, webObs.recorder.getActions())
      console.log(`[Recorded actions][code]\n`, userActionsToCode(webObs.recorder.getActions(), seleniumPythonTemplateMap, true))
      // console.log(`[getStyles]`, getStyles(curEl))
    } else {
      const event = events[1] as KeyboardEvent
      console.log('[dblKeyPress][subscribe]', event.code, events)
    }
  })
})()
