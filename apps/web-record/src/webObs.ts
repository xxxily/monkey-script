import copyText from 'common-libs/src/libs/utils/copyToClipboard'
import SimpleTips from 'common-libs/src/libs/utils/simpleTips'
import recordConfig from './recordConfig'
import WebObserver from './observers'
import userActionsToCode from './userActionToCode'
import highlightPlugin from './highlightPlugin'
import debug, { logMsg } from './debug'
import { UserAction } from './recorder'

const simpleTips = new SimpleTips({
  parentNode: document.body,
  fontSize: 16,
})

const webObs = new WebObserver(document, {
  ...recordConfig.get('webObs.options'),
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
})

let showRecorderInfo = false

/* 注册观察者记录用户操作 */
webObs.recorder.register((action) => {
  /* 为了能进行跨页事件的记录，需将每次用户操作的数据存储到localStorage中，这个操作比较耗性能，待优化 */
  const userAction = recordConfig.get('webObs.userAction') || []
  userAction.push(action)
  recordConfig.setGlobalStorage('webObs.userAction', userAction)

  if (showRecorderInfo) {
    const actions = [action]
    const code = userActionsToCode(actions, JSON.parse(recordConfig.get('codeTemplate')), true)

    if (['click', 'dblclick'].includes(action.type)) {
      const coreData = {
        fullXPath: action.data.fullXPath,
        xPath: action.data.xPath,
        cssSelector: action.data.cssSelector,
        innerText: action.data.innerText,
      }

      console.table(coreData)

      /* 自动将结果复制到剪贴板，减少复制粘贴的操作步骤 */
      // if (recordConfig.get('webObs.autoCollect')) {
      //   const collectFilter = recordConfig.get('webObs.collectFilter') as keyof typeof coreData
      //   const result = coreData[collectFilter] || ''
      //   result && copyText(result)
      // }
    }

    debug.log(`Recorded action: [${action.type}]`, action.data, '\n' + code)
  }
})

/**
 * 对录制的动作数据进行过滤优化
 * @param actions {UserAction[]} -必选 录制的动作数据
 * @returns {UserAction[]} -返回过滤优化后的动作数据
 */
function actionsResultHandler(actions: UserAction[]): UserAction[] {
  /* 消除dblclick动作生产多余的click事件 */
  actions = actions.filter((action) => {
    if (action.type === 'click') {
      const nextAction = actions[actions.indexOf(action) + 1]
      const nextSecondAction = actions[actions.indexOf(action) + 2]
      if (nextAction && nextAction.type === 'dblclick' && nextAction.time - action.time < 300) {
        return false
      } else if (nextSecondAction && nextSecondAction.type === 'dblclick' && nextSecondAction.time - action.time < 800) {
        return false
      }
    }

    return true
  })

  return actions
}

export function useWebObserver(clear: boolean = false) {
  if (clear) {
    webObs.recorder.clear()
    recordConfig.setGlobalStorage('webObs.userAction', [])
    logMsg.log('已清除历史录制结果')
  }

  recordConfig.setGlobalStorage('webObs.enable', true)
  webObs.observer()
  showRecorderInfo = true
  logMsg.log('启动录制模式')

  if (recordConfig.get('elementSelection')) {
    highlightPlugin.enable()
    logMsg.log('启动高亮辅组插件')
  }

  if (clear) {
    simpleTips.show('录制模式已启动, 已清除历史录制结果')
  } else {
    simpleTips.show('录制模式已启动')
  }
}

export function unUseWebObserver() {
  recordConfig.setGlobalStorage('webObs.enable', false)
  webObs.unObserver()
  highlightPlugin.disable()
  showRecorderInfo = false
  logMsg.log('禁用录制模式')
  simpleTips.show('录制模式已禁用')
}

export function toggleWebObserver(clear: boolean = false) {
  if (recordConfig.get('webObs.enable')) {
    unUseWebObserver()
  } else {
    useWebObserver(clear)
  }
}

export function getActionsResult(toCode: boolean = false) {
  const actions = actionsResultHandler((recordConfig.get('webObs.userAction') || []) as UserAction[])

  if (toCode) {
    const code = userActionsToCode(actions, JSON.parse(recordConfig.get('codeTemplate')), true)
    copyText(code || '当前没有录制数据')
    return code
  } else {
    copyText(JSON.stringify(actions, null, 2))
    return actions
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
          logMsg.log(`[Recorded actions to code]\n`, getActionsResult(true))
          simpleTips.show('代码已复制到剪贴板')
          break

        /* 打印录制的用户操作元素数据 */
        case 'F4':
          logMsg.log(`[Record actions]`, getActionsResult())
          simpleTips.show('原始数据已复制到剪贴板')
          break
      }
    },
    true
  )

  hasRegisterWebObserverHotkey = true
}

export function webObsInit() {
  registerWebObserverHotkey()

  /* 是否默认启动webRecord的录制功能 */
  recordConfig.get('webObs.enable') ? useWebObserver() : unUseWebObserver()
}

export default webObs
