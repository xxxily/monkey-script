import ConfigManager from 'common-libs/src/libs/monkey/configManager'
import { seleniumPythonTemplateMap } from './userActionToCode'
import { Options } from './observers'
import { UserAction } from './recorder'

export interface DefRecordConfig {
  enable: boolean
  webObs: {
    enable: boolean
    options: Options
    userAction?: UserAction[]

    /* 自动采集元素选择器的控制选项 */
    autoCollect?: {
      enable: boolean
      /* 自动采集时，采集的元素选择器类型 */
      filter: 'cssSelector' | 'xPath' | 'fullXPath' | 'innerText'
      /* 激活自动采集的修饰键 */
      modifierKeys: string[]
    }
  }
  elementSelection: boolean
  codeTemplate: string
  debug: boolean
}

export const defaultConfig: DefRecordConfig = {
  /* 是否启用webRecord功能 */
  enable: true,

  /* 是否默认启用webObs录制功能 */
  webObs: {
    enable: false,
    options: {
      DOMContentLoaded: true,
      pushstate: true,
      replacestate: true,
      popstate: true,
      hashchange: true,

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

      scroll: false,

      keydown: true,
      keyup: true,
      keypress: false,
      ignore: {
        /* 忽略F1-F12按键 */
        // keyCodes: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
        codes: [
          'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
          'ControlRight', 'AltRight', 'ShiftRight', 'MetaRight',
        ],
      },
    },
    userAction: [],

    autoCollect: {
      enable: true,
      filter: 'cssSelector',
      modifierKeys: ['AltRight', 'ShiftRight', 'MetaRight'],
    }
  },

  /* 是否启用高亮辅助插件 */
  elementSelection: true,

  /* 代码模板，json字符串 */
  codeTemplate: JSON.stringify(seleniumPythonTemplateMap),

  debug: true,
}

const recordConfig = new ConfigManager({
  prefix: '_recordConfig_',
  config: defaultConfig,
})
export default recordConfig
