import ready from './ready'

type AttrFilter = string | Array<string>

/**
 * DOM对象属性监听器
 * @param selector {String|Element} -必选 可以是选择器也可以是已存在的dom对象，如果是选择器则会调用ready进行监听
 * @param fn {Function} -必选 属性变化时的回调函数
 * @param attrFilter {String|Array} -可选 指定监听的属性，如果不指定将监听所有属性的变化
 * @param shadowRoot
 */
function attrObserver(selector: string | Element | Array<string>, fn: MutationCallback, attrFilter?: AttrFilter, shadowRoot?: ShadowRoot): boolean {
  if (!selector || !fn) return false
  function _attrObserver(element: HTMLElement) {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    const observer = new MutationObserver(fn)
    const observeOpts: MutationObserverInit = {
      attributes: true,
      attributeOldValue: true,
    }

    if (attrFilter) {
      attrFilter = Array.isArray(attrFilter) ? attrFilter : [attrFilter]
      observeOpts.attributeFilter = attrFilter
    }

    observer.observe(element, observeOpts)
  }

  if (typeof selector === 'string' || Array.isArray(selector)) {
    ready(selector, (element) => _attrObserver(element as HTMLElement), shadowRoot)
    return true
  } else if (/Element/.test(Object.prototype.toString.call(selector))) {
    _attrObserver(selector as HTMLElement)
    return true
  } else {
    return false
  }
}

export default attrObserver
