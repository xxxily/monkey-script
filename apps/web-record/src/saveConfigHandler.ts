import { getPageWindow } from './helper'
import recordConfig from './recordConfig'

function init(pageWindow: Window) {
  pageWindow.saveWebRecordConfig = function (editor: any) {
    try {
      const newConfig = editor.get()
      recordConfig.setGlobalStorageByObj(newConfig)
      alert('配置已更新')
    } catch (e) {
      alert(`配置格式异常，保存失败：${e}`)
    }
  }

  pageWindow.saveWebRecordCodeTemplate = function (editor: any) {
    try {
      const newCodeTemplate = editor.get()
      recordConfig.setGlobalStorage('codeTemplate', JSON.stringify(newCodeTemplate))
      alert('代码模板已更新')
    } catch (e) {
      alert(`代码模板格式异常，保存失败：${e}`)
    }
  }
}

let checkCount = 0
function checkJSONEditor(pageWindow: Window) {
  if (!pageWindow.JSONEditor) {
    if (checkCount < 10) {
      setTimeout(() => {
        checkCount++
        checkJSONEditor(pageWindow)
      }, 1000)
    }

    return
  }

  init(pageWindow)
}

export default async function initSaveConfigHandler() {
  const pageWindow = await getPageWindow() as Window

  if (!pageWindow) {
    return
  }

  checkJSONEditor(pageWindow)
}