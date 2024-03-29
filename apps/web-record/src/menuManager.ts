import { MenuInfo } from 'common-libs/src/libs/monkey/monkeyMenu'
import { codeTemplateVerify, seleniumPythonTemplateMap } from './userActionToCode'
import monkeyMenu from 'common-libs/src/libs/monkey/monkeyMenu'
import recordConfig from './recordConfig'
import { DefRecordConfig } from './recordConfig'
import highlightPlugin from './highlightPlugin'
import { openInTab } from './helper'

/* 菜单构造函数（必须是函数才能在点击后动态更新菜单状态） */
function menuBuilder() {
  let monkeyMenuList: MenuInfo[] = [
    {
      title: () => `${recordConfig.get('enable') ? '禁用脚本' : '启用脚本'} [全局]`,
      fn: () => {
        recordConfig.setGlobalStorage('enable', !recordConfig.get('enable'))
        window.location.reload()
      },
      disable: false,
    },
    {
      title: () => `${recordConfig.get('webObs.enable') ? '禁用录制模式' : '启用录制模式'} [全局]`,
      fn: () => {
        recordConfig.setGlobalStorage('webObs.enable', !recordConfig.get('webObs.enable'))
        window.location.reload()
      },
      disable: false,
    },
    {
      title: () => '编辑代码模板 [全局]',
      fn: () => {
        function setCodeTemplate(template?: string) {
          const codeTemplate = template || recordConfig.get('codeTemplate')

          const useOnlineEditor = confirm('是否使用在线编辑器？')
          if(useOnlineEditor){
            openInTab('https://h5player.anzz.top/tools/json-editor/index.html?&mode=code&saveHandlerName=saveWebRecordCodeTemplate&json=' + encodeURIComponent(codeTemplate))
            return
          }

          const newCodeTemplate = prompt('请输入代码模板，注：请将模板复制到本地或线上编辑器进行编辑，如：json.cn', codeTemplate)

          if (newCodeTemplate === null) return

          if (!newCodeTemplate) {
            if (confirm('代码模板为空，是否恢复默认模板？')) {
              recordConfig.setGlobalStorage('codeTemplate', JSON.stringify(seleniumPythonTemplateMap))
              alert('代码模板已恢复默认模板')
            }

            return
          }

          if (!codeTemplateVerify(newCodeTemplate)) {
            alert('代码模板不合法，请检查')

            /* 再次弹出编辑框，让用户修改错误的代码模板 */
            setCodeTemplate(newCodeTemplate)
            return
          }

          recordConfig.setGlobalStorage('codeTemplate', newCodeTemplate)
          alert('代码模板已更新')
        }

        setCodeTemplate()
      },
      disable: false,
    },
    {
      title: () => `${recordConfig.get('debug') ? '关闭调试模式' : '开启调试模式'} [全局]`,
      fn: () => {
        recordConfig.setGlobalStorage('debug', !recordConfig.get('debug'))
        window.location.reload()
      },
    },
    {
      title: () => `${recordConfig.get('elementSelection') ? '禁用元素高亮辅助插件' : '启用元素高亮辅助插件'} [全局]`,
      fn: () => {
        if (recordConfig.get('elementSelection')) {
          highlightPlugin.disable()
        } else {
          highlightPlugin.enable()
        }

        recordConfig.setGlobalStorage('elementSelection', !recordConfig.get('elementSelection'))
        window.location.reload()
      },
      disable: false,
    },
    {
      title: () => `更多设置`,
      fn: () => {
        const config = JSON.parse(JSON.stringify(recordConfig.getConfObj())) as DefRecordConfig
        
        /* 录制下来的动作不应该纳入配置 */
        delete config.codeTemplate
        delete config.webObs.userAction

        openInTab('https://h5player.anzz.top/tools/json-editor/index.html?&mode=tree&saveHandlerName=saveWebRecordConfig&json=' + encodeURIComponent(JSON.stringify(config)))
      },
      disable: false,
    },
    {
      title: () => `脚本帮助`,
      fn: () => {
        openInTab('https://greasyfork.org/zh-CN/scripts/461403')
      },
      disable: false,
    },
  ]

  return monkeyMenuList
}

/* 注册动态菜单 */
export function menuRegister() {
  monkeyMenu.build(menuBuilder)
}
