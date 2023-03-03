/**
 * 简单的复制内容到剪贴板方法
 * @param text {String} -必选 要复制到剪贴板的内容
 * @returns {boolean} 复制成功或失败的状态
 */

function copyText(text: string = ''): boolean {
  let sucStatus = false
  const input = document.createElement('input')

  input.setAttribute('readonly', 'readonly')
  input.setAttribute('value', text)
  document.body.appendChild(input)

  input.setSelectionRange(0, input.value.length)
  input.select()

  if (document.execCommand && document.execCommand('copy')) {
    document.execCommand('copy')
    sucStatus = true
  }

  document.body.removeChild(input)

  return sucStatus
}

export default copyText
