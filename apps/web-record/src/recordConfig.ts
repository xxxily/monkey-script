import ConfigManager from 'common-libs/src/libs/monkey/configManager'
import { seleniumPythonTemplateMap } from './userActionToCode'

export interface DefRecordConfig {
  enable: boolean
  webObs: {
    enable: boolean
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
