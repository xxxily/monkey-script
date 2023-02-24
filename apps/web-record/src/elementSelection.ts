export interface BoxOptions {
  type?: 'div' | 'outline' | 'box-shadow' | 'boxShadow' | 'combine'
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'
  color?: string
  width?: string
  borderRadius?: string
  mouseoverCallback?: (element: HTMLElement, opts: BoxOptions) => void
  mouseoutCallback?: (element: HTMLElement, opts: BoxOptions) => void
}

export default class ElementSelection {
  private available: boolean = true
  private currentTarget: HTMLElement | null = null

  constructor(element: HTMLElement, opts: BoxOptions = {}) {
    this.toogleBoxShadow(element, opts)
  }

  /**
   * 实现元素的边框高亮/框选效果
   * @param element {HTMLElement} - 必选 元素
   * @param opts {BoxOptions} - 可选 边框配置, 默认值：{ type: 'div', style: 'dashed', color: 'blue', width: '1px', borderRadius: '3px' }
   * @param opts.type {BoxType} - 可选 边框类型，可选值：div、outline、box-shadow、boxShadow、combine，默认值：div
   * 使用outline、box-shadow的性能最好，且能正确高亮运动中的元素，但是会覆盖原有的outline、box-shadow样式，且兼容性较差，容易受其它元素的覆盖，而不一定能完全将元素高亮出来
   * 使用div的性能较差，对于运动中的元素会出现框选滞后而出现的错位问题，但是不会覆盖原有的outline、box-shadow样式，且兼容性较好，不容易受其它元素的覆盖影响
   * @returns {void}
   */
  toogleBoxShadow(element: HTMLElement, opts: BoxOptions = {}) {
    const boxShadowSty = `inset 0 0 0 ${opts.width || '1px'} ${opts.color || 'blue'}`
    const outlineSty = `${opts.width || '1px'} ${opts.style || 'dashed'} ${opts.color || 'blue'}`
    let originalBoxShadow = ''
    let originalOutline = ''

    const borderBox = (document.querySelector('#__el_border_box__') || document.createElement('div')) as HTMLElement
    borderBox.id = '__el_border_box__'
    borderBox.style.position = 'fixed'
    borderBox.style.border = outlineSty
    borderBox.style.pointerEvents = 'none'
    borderBox.style.zIndex = '9999999'
    borderBox.style.borderRadius = `${opts.borderRadius || '3px'}`
    borderBox.style.visibility = 'hidden'
    document.body.appendChild(borderBox)

    const boxType = opts.type || 'div'
    const useOutline = boxType === 'outline' || boxType === 'combine'
    const useBoxShadow = boxType === 'box-shadow' || boxType === 'boxShadow' || boxType === 'combine'
    const useDiv = boxType === 'div' || boxType === 'combine'

    element.addEventListener(
      'mouseover',
      (event) => {
        if (!this.available) return

        const target = event.target as HTMLElement
        this.currentTarget = target

        if (useBoxShadow) {
          const hasBoxShadow = target.style.boxShadow && target.style.boxShadow !== 'none'
          if (hasBoxShadow) {
            originalBoxShadow = getComputedStyle(target).getPropertyValue('box-shadow')
          }

          target.style.boxShadow = boxShadowSty
        }

        if (useOutline) {
          const hasOutline = target.style.outline && target.style.outline !== 'none'
          if (hasOutline) {
            originalOutline = getComputedStyle(target).getPropertyValue('outline')
          }

          target.style.outline = outlineSty
        }

        if (useDiv) {
          const rect = target.getBoundingClientRect()
          borderBox.style.top = rect.top + 'px'
          borderBox.style.left = rect.left + 'px'
          borderBox.style.width = rect.width + 'px'
          borderBox.style.height = rect.height + 'px'
          borderBox.style.visibility = 'visible'
        }

        opts.mouseoverCallback instanceof Function && opts.mouseoverCallback(target, opts)
      },
      true
    )

    element.addEventListener(
      'mouseout',
      (event) => {
        if (!this.available) return

        const target = event.target as HTMLElement
        useBoxShadow && (target.style.boxShadow = originalBoxShadow || '')
        useOutline && (target.style.outline = originalOutline || '')
        useDiv && (borderBox.style.visibility = 'hidden')
        originalBoxShadow = ''
        originalOutline = ''

        opts.mouseoutCallback instanceof Function && opts.mouseoutCallback(target, opts)
      },
      true
    )
  }

  enable() {
    this.available = true
  }

  disable() {
    this.available = false

    /* 清除div类型的高亮 */
    const borderBox = document.querySelector('#__el_border_box__') as HTMLElement
    borderBox && (borderBox.style.visibility = 'hidden')
  }

  getCurrentTarget() {
    return this.currentTarget
  }

  isAvailable() {
    return this.available
  }

  destroy() {}
}
