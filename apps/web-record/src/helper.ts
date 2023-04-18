import { parseURL, stringifyToUrl } from 'common-libs/src/libs/utils/url'


/**
 * 判断选择器是否合法，例如当选择器为 'dark:bg-[#1e1e20]' 时，document.querySelector会报错
 * @param selector {string} - 必选 选择器
 * @returns 
 */
const isSelectorValid = (() => {
  let div: null | HTMLElement = null;
  return (selector: string): boolean => {
    if (!div) { div = document.createElement('div'); }

    try {
      div.querySelector(selector);
      return true;
    } catch (e) {
      return false;
    }
  };
})();

/**
 * 获取元素的选择器
 * @param el {HTMLElement} - 必选 元素
 * @returns {string} 元素的选择器
 */
export function getSelector(el: HTMLElement) {
  const selectorArr: string[] = []
  function recurseSelector(element: HTMLElement): void {
    /* 传入的element不存在，结束递归 */
    if (!element) return

    /* 遇到根节点结束递归 */
    if (element.tagName.toLowerCase() == 'html') {
      selectorArr.push('html')
      return
    };

    let selector = element.tagName.toLowerCase();

    if (element.id && isSelectorValid(`#${element.id}`)) {
      /* 遇到id结束递归 */
      selectorArr.push('#' + element.id)
      return
    } else if (element.classList.length > 0) {
      /* 寻找classList里中能匹配到的最少dom元素的一个值 */
      let className = element.classList[0]

      if (element.classList.length && isSelectorValid(`.${className}`)) {
        let matchElementLength = document.querySelectorAll(`.${className}`).length

        for (let i = 1; i < element.classList.length; i++) {
          const curSelector = `.${element.classList[i]}`
          if (isSelectorValid(curSelector) === false) continue

          let elementsWithClass = document.querySelectorAll(curSelector);

          if (elementsWithClass.length < matchElementLength) {
            className = element.classList[i]
          }
        }
      }

      /* 再次检查提取到的className是否为有效的选择器 */
      if (isSelectorValid(`.${className}`)) {
        // selector = `${selector}.${className}`
        selector = `.${className}`
        let hasNthChildFlag = false

        /* 计算是否需要增加:nth-child */
        if (element.parentElement && element.parentElement.querySelectorAll(selector).length > 1) {
          let siblings = Array.from(element.parentElement.children);
          const index = siblings.findIndex(sibling => sibling === element);

          if (index > 0) {
            selector = `${selector}:nth-child(${index + 1})`
            hasNthChildFlag = true
          }
        }

        /**
         * 优化输出，如果当前选择器已经是唯一，则结束递归
         * 这里也可能产生新的问题，当前来说是唯一，但等它继续加载元素的时候，就不是唯一的了
         */
        if (!hasNthChildFlag && selectorArr.length > 0 && document.querySelectorAll(selector).length === 1) {
          selectorArr.push(selector)
          return
        }
      }
    }

    /**
     * class 选择器没法用，只能退回到tagNames时：
     * 需要判断当前的element.tagName是否和父元素的element.tagName一样，如果一样，需要增加:nth-child
     */
    if (selector === element.tagName.toLowerCase()) {
      /* 计算children里面是否有多个跟element.tagName一样的元素，如果有再按需增加:nth-child */
      if (element.parentElement && element.parentElement.childElementCount > 1) {
        let hasSameTag = false
        for (let i = 0; i < element.parentElement.childElementCount; i++) {
          const child = element.parentElement.children[i];
          if (child.tagName.toLowerCase() === selector && child !== element) {
            hasSameTag = true
            break
          }
        }

        if (hasSameTag) {
          let siblings = Array.from(element.parentElement.children);
          const index = siblings.findIndex(sibling => sibling === element);

          if (index > 0) {
            selector = `${selector}:nth-child(${index + 1})`
          }
        }
      }
    }

    selectorArr.push(selector);

    /* 进行递归 */
    recurseSelector(element.parentNode as HTMLElement);
  }

  recurseSelector(el)

  return selectorArr.reverse().join(" ")
}

/**
 * 获取元素的所应用的样式
 * @param el {HTMLElement} - 必选 元素
 * @returns {Record<string, string>} 元素的样式对象
 */
export function getStyles(element: HTMLElement): Record<string, string> {
  const styles = window.getComputedStyle(element)
  const stylesObject: Record<string, string> = {}

  for (let i = 0; i < styles.length; i++) {
    const propName = styles[i]
    const propValue = styles.getPropertyValue(propName)
    stylesObject[propName] = propValue
  }

  return stylesObject
}

/**
 * 给定一个元素，获取该元素的 XPath 规则
 * https://github.com/mic1on/xpath-helper-plus/blob/main/src/xpath.ts
 * https://juejin.cn/post/7112693331637108743
 * GPT prompt: 用js实现给定dom元素获取其对应的xpath规则，要求：根据元素的id，class属性，自动查找dom结构中是否该xpath语句是唯一指向元素，如果是，则会自动精简，否则，则会继续向上查找，直到找出最精简且唯一的xpath语句
 * @param element {HTMLElement} - 必选 元素
 * @returns {string | null} - 返回元素的 XPath 规则
 */

export function getXPath(element: HTMLElement): string {
  if (element && element.nodeType == 1) {
    // check if element is a valid DOM node
    let path = ''

    // check if element has an ID that is unique within its parent
    if (element.id) {
      path = `id("${element.id}")`
      if (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue === element) {
        return path // ID is unique, return the XPath
      }
    }

    // check if element has a class name that is unique within its parent
    if (element.classList && element.classList.length === 1) {
      path = `${element.tagName.toLowerCase()}[@class="${element.className}"]`
      if (document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue === element) {
        return path // class name is unique, return the XPath
      }
    }

    // if element does not have unique ID or class name, traverse up the DOM until a unique XPath is found
    const siblings = element.parentNode?.children
    let index = 1
    if (siblings) {
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i] as HTMLElement
        if (sibling == element) {
          return `${getXPath(element.parentNode as HTMLElement)}/${element.tagName.toLowerCase()}[${index}]` // recursively call function on parent and add child index
        }
        if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
          index++
        }
      }
    }
  }
  return ''
}

export function getFullXPath(element: HTMLElement | null): string {
  if (element && element.nodeType == Node.ELEMENT_NODE) {
    let xpath = ''

    /* 从指定元素一直遍历到根节点 */
    for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode as HTMLElement | null) {
      const tagName = element.tagName.toLowerCase()
      let index = 1

      /* 计算当前元素在兄弟元素中的索引 */
      for (let sibling = element.previousSibling as HTMLElement | null; sibling; sibling = sibling.previousSibling as HTMLElement | null) {
        if (sibling.nodeType == Node.ELEMENT_NODE && sibling.tagName.toLowerCase() == tagName) {
          index++
        }
      }
      xpath = `/${tagName}[${index}]${xpath}`
    }
    return xpath
  } else {
    return ''
  }
}

/**
 * 通过xpath获取元素
 * https://developer.mozilla.org/zh-CN/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
 * @param xpath {string} - 必选 xpath
 * @returns {Element | null} 元素
 */
export function getElementByXPath(xpath: string): Element | HTMLElement | null {
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
  return result.singleNodeValue as Element | HTMLElement | null
}

interface OpenInTabOpts {
  active: boolean
  insert: boolean
  setParent: boolean
}

export function openInTab(url: string, opts?: OpenInTabOpts, referer?: string) {
  if (referer) {
    const urlObj = parseURL(url)
    if (!urlObj.params.referer) {
      urlObj.params.referer = encodeURIComponent(window.location.href)
      url = stringifyToUrl(urlObj)
    }
  }

  if (window.GM_openInTab) {
    window.GM_openInTab(url, opts || {
      active: true,
      insert: true,
      setParent: true
    })
  }
}


export interface EventObject extends Event {
  [key: string | number | symbol]: any
}

/* 提取事件的相关信息 */
export interface EventInfo {
  [key: string | number | symbol]: any
}

export function extractElementInfo(element: HTMLElement): EventInfo {
  const eventInfo: EventInfo = {}

  /* 利用缓存减少计算量 */
  if (element.__observers_full_xpath__ && getElementByXPath(element.__observers_full_xpath__) === element) {
    eventInfo.fullXPath = element.__observers_full_xpath__
  } else {
    eventInfo.fullXPath = getFullXPath(element)
    element.__observers_full_xpath__ = eventInfo.fullXPath
  }

  /* 利用缓存减少计算量 */
  if (element.__observers_xpath__ && getElementByXPath(element.__observers_xpath__) === element) {
    eventInfo.xPath = element.__observers_xpath__
  } else {
    eventInfo.xPath = getXPath(element)
    element.__observers_xpath__ = eventInfo.xPath
  }

  /* 增加css选择器信息 */
  eventInfo.cssSelector = getSelector(element)

  if (document.querySelector(eventInfo.cssSelector) !== element) {
    console.error('[extractEventInfo] cssSelector is not unique', eventInfo.cssSelector, document.querySelector(eventInfo.cssSelector), element)
  }

  // console.log('[extractEventInfo] cssSelector is unique', eventInfo.cssSelector)

  // if(!eventInfo.cssSelector) {
  //   console.error('[extractEventInfo] cssSelector is empty', element)
  // } else {
  //   alert(eventInfo.cssSelector)
  // }

  /* 获取元素矩形信息，暂时来说没太大用处 */
  // if (element.getBoundingClientRect) {
  //   eventInfo.rect = element.getBoundingClientRect()
  // } else {
  //   /* 当element为document时，element.getBoundingClientRect为undefined */
  //   // console.error('[extractEventInfo] element.getBoundingClientRect is not a function', element)
  // }

  /**
   * 获取元素的innerText
   * 为了降低性能损耗，只有当元素的子元素数量小于等于3个，且子元素的dom节点数小于5，且innerText的字符长度小于80时才获取innerText
   * 另外：过于复杂的dom结构，获取到的innerText并不是我们所需要的
   */
  if (element.childElementCount <= 3 && element.querySelectorAll('*').length < 5 && element.innerText && element.innerText.length < 80) {
    eventInfo.innerText = element.innerText
  }

  return eventInfo
}

export function extractEventInfo(e: EventObject, actionComposeType?: string) {
  const eventInfo: EventInfo = {}

  /* 获取event对象下所有键名，并且将键值为数字或字符串的键值对提取出来 */
  for (const key in e) {
    try {
      const val = e[key]
      if (typeof val !== 'function' && typeof val !== 'object') {
        eventInfo[key] = val
      }
    } catch (err) {
      console.error('[extractEventInfo]', err, e)
    }
  }

  const target = e.target as HTMLElement
  Object.assign(eventInfo, extractElementInfo(target))

  if (actionComposeType) {
    eventInfo.actionCompose = actionComposeType
  }

  return eventInfo
}


/**
 * 由于tampermonkey对window对象进行了封装，我们实际访问到的window并非页面真实的window
 * 这就导致了如果我们需要将某些对象挂载到页面的window进行调试的时候就无法挂载了
 * 所以必须使用特殊手段才能访问到页面真实的window对象，于是就有了下面这个函数
 * @returns {Promise<void>}
 */
export async function getPageWindow() {
  return new Promise(function (resolve, reject) {
    if (window._pageWindow) {
      return resolve(window._pageWindow)
    }

    /* 尝试通过同步的方式获取pageWindow */
    try {
      const pageWin = getPageWindowSync()
      if (pageWin && pageWin.document && pageWin.XMLHttpRequest) {
        window._pageWindow = pageWin
        resolve(pageWin)
        return pageWin
      }
    } catch (e) { }

    /* 下面异步获取pagewindow的方法在最新的chrome浏览器里已失效 */

    const listenEventList = ['load', 'mousemove', 'scroll', 'get-page-window-event']

    function getWin() {
      window._pageWindow = this
      // debug.log('getPageWindow succeed', event)
      listenEventList.forEach(eventType => {
        window.removeEventListener(eventType, getWin, true)
      })
      resolve(window._pageWindow)
    }

    listenEventList.forEach(eventType => {
      window.addEventListener(eventType, getWin, true)
    })

    /* 自行派发事件以便用最短的时间获得pageWindow对象 */
    window.dispatchEvent(new window.Event('get-page-window-event'))
  })
}
getPageWindow()

/**
 * 通过同步的方式获取pageWindow
 * 注意同步获取的方式需要将脚本写入head，部分网站由于安全策略会导致写入失败，而无法正常获取
 * @returns {*}
 */
export function getPageWindowSync(rawFunction?: Function) {
  if (window.unsafeWindow) return window.unsafeWindow
  const document = window.document as any

  if (document._win_) return document._win_

  try {
    rawFunction = rawFunction || window.__rawFunction__ || Function.prototype.constructor || Function
    // return rawFunction('return window')()
    // Function('return (function(){}.constructor("return this")());')
    if (rawFunction) {
      return rawFunction('return (function(){}.constructor("var getPageWindowSync=1; return this")());')()
    }
  } catch (e) {
    console.error('getPageWindowSync error', e)

    const head = document.head || document.querySelector('head')
    const script = document.createElement('script')
    script.appendChild(document.createTextNode('document._win_ = window'))
    head.appendChild(script)

    return document._win_
  }
}