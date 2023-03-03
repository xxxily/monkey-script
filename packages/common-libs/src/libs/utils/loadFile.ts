/*!
 * @name         loadScript.js
 * @description  用于动态加载为外部文件
 * @version      0.0.1
 * @author       Blaze
 * @date         12/08/2019 10:21
 * @github       https://github.com/xxxily
 */

type LoadFileCallback = (err: Error | null, el?: HTMLElement) => void
type LoadFileType = 'script' | 'link' | 'iframe'
type BeforeAppendHandler = (el: HTMLElement, src: string) => void

interface Callbacks {
  [src: string]: LoadFileCallback[]
}

interface LoadedElement extends HTMLElement {
  [prop: string]: any
  _isLoaded_?: boolean
}

const callbacks: Callbacks = {}

/**
 * 动态加载外部文件
 * @param type {String} -必选 要加载的文件类型，支持： script, link, iframe 三种类型标志
 * @param src {String} -必选 外部文件的地址
 * @param callback {Function} -必选 加载成功或失败时的回调
 * @param beforeAppend {Function} -可选 插入DOM执行加载动作前的钩子函数 一般iframe才需要此函数，执行提前处理好样式等操作
 * @param appendDom {el} -可选 指定将文件插入到哪个DOM里面，一般iframe才会使用此选项，不指定都是按默认规则插入
 */
function loadFile(type: LoadFileType, src: string, callback?: LoadFileCallback, beforeAppend?: BeforeAppendHandler, appendDom?: HTMLElement): boolean | void {
  if (!type || !/^(script|link|iframe)$/.test(type)) return false

  const existing = document.getElementById(src) as LoadedElement
  const cb = callback || function () {}

  /* 每个链接有自己对应的回调队列 */
  if (!callbacks[src]) {
    callbacks[src] = []
  }

  if (existing && existing._isLoaded_) {
    cb(null, existing)
  } else {
    callbacks[src].push(cb)
  }

  function handler(isSuc: boolean, el: LoadedElement) {
    /* 执行回调队列 */
    for (const cb of callbacks[src]) {
      isSuc ? cb(null, el) : cb(new Error('Failed to load ' + src), el as HTMLElement)
    }

    el.onerror = el.onload = el.onreadystatechange = null
    delete callbacks[src]

    if (isSuc) {
      el._isLoaded_ = true
    } else {
      /* 移除加载出错脚本，以便下个执行的函数可以尝试继续加载 */
      el.parentElement && el.parentElement.removeChild(el)
    }
  }

  if (!existing) {
    /* 生成并注入脚本标签 */
    const el = document.createElement(type) as LoadedElement
    el.id = src

    /* 使用正确的连接属性 */
    if (/^(script|iframe)$/.test(type)) {
      el.src = src
    } else {
      el.type = 'text/css'
      el.rel = 'stylesheet'
      el.href = src
    }

    /* 获得正确的插入节点 */
    if (!appendDom || !appendDom.appendChild) {
      if (/^(script|link)$/.test(type)) {
        appendDom = document.getElementsByTagName('head')[0] || document.body
      } else {
        appendDom = document.body
      }
    }

    /* 处理相关事件 */
    el.onload = el.onreadystatechange = function () {
      if (!el._isLoaded_ && (!this.readyState || this.readyState === 'complete')) {
        handler(true, el)
      }
    }

    el.onerror = function () {
      handler(false, el)
    }

    if (beforeAppend instanceof Function) {
      beforeAppend(el, src)
    }

    /* 插入到dom元素，执行加载操作 */
    appendDom.appendChild(el)
  }
}

const loadScript = (src: string, callback: LoadFileCallback) => loadFile('script', src, callback)

const loadCss = (src: string, callback: LoadFileCallback) => loadFile('link', src, callback)

const loadIframe = (src: string, callback: LoadFileCallback, beforeAppend: BeforeAppendHandler, appendDom: HTMLElement) =>
  loadFile('iframe', src, callback, beforeAppend, appendDom)

export { loadFile, loadScript, loadCss, loadIframe }
