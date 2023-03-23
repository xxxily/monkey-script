import copyText from 'common-libs/src/libs/utils/copyToClipboard'
import keyboardHelper from 'common-libs/src/libs/utils/keyboardHelper'
import recordConfig from './recordConfig'
import debug from './debug'
import ElementSelection from './elementSelection'
import { extractElementInfo } from './helper'

function useAutoCollect(element: HTMLElement) {
  if (!recordConfig.get('webObs.autoCollect.enable')) return

  const elementInfo = extractElementInfo(element)
  console.table(elementInfo)

  /* 将指定的数据值复制到剪贴板 */
  const collectFilter = recordConfig.get('webObs.autoCollect.filter') as keyof typeof elementInfo
  const result = elementInfo[collectFilter] || ''
  result && copyText(result)

  return result
}


/* 元素高亮选中组件 */
const highlightPlugin = {
  elementSelection: null as ElementSelection | null,

  init() {

    /* todo: 当前只能对当前页面的元素进行高亮，如果是iframe或shadow dom的元素，还得加兼容代码 */
    this.elementSelection = new ElementSelection(document.documentElement, {
      // style: 'dashed',
      color: 'red',
      // borderRadius: '5px',
      mouseoverCallback: (event, opts) => {
        const element = event.target as HTMLElement
        if (!!false) {
          debug.log('[elementSelection][mouseover]', element, opts)
        }

        /* 判断是否按下了指定的修饰键 */
        const keysPressed = keyboardHelper();
        const modifierKeys = recordConfig.get('webObs.autoCollect.modifierKeys') as string[]
        if (!modifierKeys.some(key => keysPressed[key])) return

        /* 进入快速采集模式，暂时没啥大用，就是为了方便调试 */
        useAutoCollect(element)
      },
      mouseoutCallback: (event, opts) => {
        const element = event.target as HTMLElement
        if (!!false) {
          debug.log('[elementSelection][mouseout]', element, opts)
        }
      },
    })

    if (recordConfig.get('webObs.enable') && recordConfig.get('elementSelection')) {
      this.enable()
    } else {
      this.disable()
    }

    const elementWeakMap = new WeakMap();
    const elementInfoKeys = ['cssSelector', 'xPath', 'fullXPath', 'innerText']
    window.addEventListener('keydown', (event) => {
      if (!this.elementSelection || !this.elementSelection.isAvailable() || !recordConfig.get('webObs.enable')) return

      if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey)) {
        /* 如果用户已选中了其他文本，则不执行采集操作 */
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
          return
        }

        const element = this.elementSelection.getCurrentTarget() as HTMLElement
        const elementInfo = extractElementInfo(element)
        if (!elementWeakMap.get(element)) {
          elementWeakMap.set(element, {
            index: -1,
            timer: -1,
          })
        }

        const elementData = elementWeakMap.get(element)
        elementData.timer && clearTimeout(elementData.timer)
        elementData.index = elementData.index + 1
        elementWeakMap.set(element, elementData)

        /* 轮换复制cssSelector、xPath、fullXPath和innerText */
        const collectFilter = elementInfoKeys[elementData.index % elementInfoKeys.length]
        const content = elementInfo[collectFilter]
        if (content) {
          copyText(content)
          this.elementSelection?.tips(`[已复制]${collectFilter}：${content}`)
        } else {
          this.elementSelection?.tips(`当前元素不存在：${collectFilter} 信息`)
        }

        /* 一段时间后删掉重来 */
        elementData.timer = setTimeout(() => {
          elementWeakMap.delete(element)
        }, 1500)
      }
    })
  },

  enable() {
    if (this.elementSelection) {
      this.elementSelection.enable()
    }
  },
  disable() {
    if (this.elementSelection) {
      this.elementSelection.disable()
    }
  },
}

// highlightPlugin.init()

export default highlightPlugin
