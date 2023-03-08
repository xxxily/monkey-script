import recordConfig from './recordConfig'
import debug from './debug'
import ElementSelection from './elementSelection'

/* 元素高亮选中组件 */
const highlightPlugin = {
  elementSelection: null as ElementSelection | null,

  init() {
    /* todo: 当前只能对当前页面的元素进行高亮，如果是iframe或shadow dom的元素，还得加兼容代码 */
    this.elementSelection = new ElementSelection(document.documentElement, {
      // style: 'dashed',
      color: 'red',
      // borderRadius: '5px',
      mouseoverCallback: (element, opts) => {
        if (!!false) {
          debug.log('[elementSelection][mouseover]', element, opts)
        }
      },
      mouseoutCallback: (element, opts) => {
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
