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
        /* 忽略F1-F4按键 */
        keyCodes: [112, 113, 114, 115],
      },
    },
    userAction: [],
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
