/**
 * 获取元素的选择器
 * @param el {HTMLElement} - 必选 元素
 * @returns {string} 元素的选择器
 */
export function getSelector(el: HTMLElement) {
  let selector = el.tagName.toLowerCase()
  if (el.id) {
    selector += '#' + el.id
  } else if (el.className) {
    selector += '.' + el.className.split(' ').join('.')
  }
  return selector
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
