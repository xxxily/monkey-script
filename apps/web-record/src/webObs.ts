import recordConfig from './recordConfig'
import WebObserver from './observers'
import userActionsToCode from './userActionToCode'
import highlightPlugin from './highlightPlugin'
import debug, { logMsg } from './debug'

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
  // mousemoveSampleInterval: 30,
  // mouseHandler(event, action) {
  //   if (action.type === 'click' || action.type === 'dblclick') {
  //     const target = event.target as HTMLElement
  //     const xpath = getXPath(target)
  //     action.data.xpath = xpath

  //     const styles = getStyles(target)
  //     action.data.styles = styles
  //   }
  // },

  scroll: false,

  keydown: true,
  keyup: true,
  keypress: false,
  keyboardHandler(event, action) {
    /**
     * 忽略用户按下的某些按键
     * 更简单的做法是把键位码添加到ignore.keyCodes中，
     * 使用Handler的好处是可以拥有更灵活的判断逻辑
     */
    if (event.code === 'ControlRight') {
      /* 标识丢弃掉该action */
      action.__drop__ = true
    }
  },

  ignore: {
    /* 忽略F1-F4按键 */
    keyCodes: [112, 113, 114, 115],
  },
})

let showRecorderInfo = false
let showRecorderInfoToCode = false

/* 注册观察者记录用户操作 */
webObs.recorder.register((action) => {
  if (showRecorderInfo) {
    debug.log(`Recorded action: [${action.type}]`, action.data)
  }

  if (showRecorderInfoToCode) {
    const actions = [action]
    const code = userActionsToCode(actions, JSON.parse(recordConfig.get('codeTemplate')), true)
    debug.log(`[Recorded actions to code]\n`, code)
  }
})

function toggleWebObserver(clear: boolean = false) {
  if (webObs.isObserver()) {
    webObs.unObserver()
    highlightPlugin.disable()
    showRecorderInfo = false
    showRecorderInfoToCode = false
    logMsg.log('禁用录制模式')
  } else {
    clear && webObs.recorder.clear()
    webObs.observer()
    recordConfig.get('elementSelection') && highlightPlugin.enable()
    showRecorderInfo = true
    showRecorderInfoToCode = true
    logMsg.log('启动录制模式')
  }
}

let hasRegisterWebObserverHotkey = false
export function registerWebObserverHotkey() {
  if (hasRegisterWebObserverHotkey) return

  window.addEventListener(
    'keydown',
    (event) => {
      if (!['F1', 'F2', 'F3', 'F4'].includes(event.code)) return

      event.preventDefault()
      event.stopPropagation()
      console.clear()

      switch (event.code) {
        /* 开启或关闭录制功能 */
        case 'F1':
          toggleWebObserver()
          break

        /* 开启或关闭录制功能（开启前清空前面的记录数据） */
        case 'F2':
          toggleWebObserver(true)
          break

        /* 打印录制的用户操作转换成编程代码的结果 */
        case 'F3':
          const actions = webObs.recorder.getActions()
          const code = userActionsToCode(actions, JSON.parse(recordConfig.get('codeTemplate')), true)
          logMsg.log(`[Recorded actions to code]\n`, code)
          break

        /* 打印录制的用户操作元素数据 */
        case 'F4':
          logMsg.log(`[Record actions]`, webObs.recorder.getActions())
          break
      }
    },
    true
  )

  hasRegisterWebObserverHotkey = true
}

export default webObs
