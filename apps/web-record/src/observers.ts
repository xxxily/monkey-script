import Recorder from './recorder'
import { UserAction, MouseType, KeyboardType, TouchType } from './recorder'
import { extractEventInfo } from './helper'

// 创建录制器实例
const recorder = new Recorder()

// 注册观察者记录用户操作
// recorder.register((action: UserAction) => {
//   if (action.type !== 'mousemove') {
//     console.log(`Recorded action: ${action.type}`)
//   }
// })

export type ObserverElement = HTMLElement | Document

export interface Options {
  /* 大类别 */
  navigation?: boolean
  mouse?: boolean
  touch?: boolean
  drag?: boolean
  scroll?: boolean
  keyboard?: boolean

  /* 页面URL变化的事件 */
  DOMContentLoaded?: boolean // 该事件为自定义数据，表示页面进入时的url
  pushstate?: boolean
  replacestate?: boolean
  popstate?: boolean
  hashchange?: boolean

  /* 鼠标事件 */
  click?: boolean
  dblclick?: boolean
  mousemove?: boolean
  mousedown?: boolean
  mouseup?: boolean
  mouseenter?: boolean
  mouseleave?: boolean
  mouseover?: boolean
  mouseout?: boolean

  /* 键盘事件 */
  keydown?: boolean
  keyup?: boolean
  keypress?: boolean

  /* 触摸事件 */
  touchstart?: boolean
  touchmove?: boolean
  touchend?: boolean

  /* 拖拽事件 */
  dragstart?: boolean
  dragend?: boolean
  dragenter?: boolean
  dragleave?: boolean
  dragover?: boolean

  /* 采样控制 */
  mousemoveSampleInterval?: number

  /* 自定义事件处理函数，通过自定义处理函数可以往UserAction里增加自己需要的信息自动 */
  navigationHandler?: (e: Event, action: UserAction) => void
  mouseHandler?: (e: MouseEvent, action: UserAction) => void
  keyboardHandler?: (e: KeyboardEvent, action: UserAction) => void
  touchHandler?: (e: TouchEvent, action: UserAction) => void
  dragHandler?: (e: DragEvent | MouseEvent, action: UserAction) => void
  scrollHandler?: (e: Event, action: UserAction) => void

  /* TODO 忽略某些元素或特定键位的录制，待完善 */
  ignore?: {
    className?: string[]
    tagName?: string[]
    ids?: string[]
    keyCodes?: number[]
    codes?: string[]
    hotKeys?: string[]
    handler?: (e: Event) => boolean
  }
}

/**
 * 解决for in 类型报：在类型 "xxx"上找不到具有类型为 "string" 的参数的索引签名
 * https://blog.csdn.net/zy21131437/article/details/121246493
 */

/* 判断键名是否是对象的键名 */
export function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
  return key in object
}


export default class WebObserver {
  record: (action: UserAction) => void
  recorder: Recorder
  private element: ObserverElement
  private disable: boolean = false
  private hasRegistered: boolean = false
  private opts: Options = {
    /* 大类 */
    navigation: true,
    mouse: true,
    touch: true,
    drag: true,
    scroll: true,
    keyboard: true,

    /* 小类 */
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

    keydown: true,
    keyup: true,
    keypress: false,

    touchstart: true,
    touchmove: true,
    touchend: true,

    dragstart: true,
    dragend: true,
    dragenter: true,
    dragleave: true,
    dragover: true,

    /* mousemove采样间隔，单位毫秒，值越大性能越好但失真度越高，0表示记录所有触发的事件 */
    mousemoveSampleInterval: 10,
  }

  constructor(element: ObserverElement, opts?: Options, startObserver: boolean = false) {
    this.record = recorder.record.bind(recorder)

    // 判断传入的element是否为dom元素
    if (!(element instanceof HTMLElement || element instanceof Document)) {
      throw new Error('element is not a HTMLElement')
    }

    this.element = element
    this.disable = !startObserver
    this.recorder = recorder
    this.opts = Object.assign(this.opts, opts)

    if (!this.disable) {
      this.observer()
    }
  }

  isIgnoreDom(target: HTMLElement) {
    let isIgnored = false
    if (this.opts.ignore) {
      const { className, tagName, ids } = this.opts.ignore

      if (className && className.length) {
        for (let i = 0; i < className.length; i++) {
          if (target.classList.contains(className[i])) {
            isIgnored = true
            break
          }
        }
      }

      if (tagName && tagName.length) {
        for (let i = 0; i < tagName.length; i++) {
          if (target.tagName === tagName[i].toUpperCase()) {
            isIgnored = true
            break
          }
        }
      }

      if (ids && ids.length) {
        for (let i = 0; i < ids.length; i++) {
          if (target.id === ids[i]) {
            isIgnored = true
            break
          }
        }
      }
    }

    return isIgnored
  }

  isIgnoredKeyboardEvent(e: KeyboardEvent) {
    let isIgnored = false
    if (this.opts.ignore) {
      const { keyCodes, codes, hotKeys } = this.opts.ignore

      if (keyCodes && keyCodes.length && keyCodes.includes(e.keyCode)) {
        isIgnored = true
      }

      if (codes && codes.length && codes.includes(e.code)) {
        isIgnored = true
      }

      if (hotKeys && hotKeys.length) {
        /* TODO 待完善 */
        // for (let i = 0; i < hotKeys.length; i++) {
        //   const hotKey = hotKeys[i]

        //   if (hotKey.ctrlKey && !e.ctrlKey) continue
        //   if (hotKey.shiftKey && !e.shiftKey) continue
        //   if (hotKey.altKey && !e.altKey) continue
        //   if (hotKey.metaKey && !e.metaKey) continue
        //   if (hotKey.keyCode && hotKey.keyCode !== e.keyCode) continue
        //   if (hotKey.code && hotKey.code !== e.code) continue

        //   isIgnored = true
        //   break
        // }
      }
    }

    return isIgnored
  }

  /* 监听页面导航，URL变化的事件 */
  navigationObserver() {
    if (!this.opts.navigation) return

    const navigationEventHandler = (event: Event) => {
      const action = {
        type: event.type.replace(/^__navigation_/, ''),
        time: Date.now(),
        data: {
          actionCompose: 'navigation',
          referrer: document.referrer,
          hash: location.hash,
          host: location.host,
          hostname: location.hostname,
          href: location.href,
          origin: location.origin,
          pathname: location.pathname,
          port: location.port,
          protocol: location.protocol,
        },
      }

      /* 执行自定义事件处理函数 */
      this.opts.navigationHandler instanceof Function && this.opts.navigationHandler(event, action)

      recorder.record(action)
    }

    this.opts.DOMContentLoaded && window.addEventListener('DOMContentLoaded', navigationEventHandler)
    this.opts.popstate && window.addEventListener('popstate', navigationEventHandler)
    this.opts.hashchange && window.addEventListener('hashchange', navigationEventHandler)

    function historyHooks(type: 'pushState' | 'replaceState') {
      const originMethod = history[type]

      return function () {
        interface CustomEvent extends Event {
          [prop: string | number | symbol]: any
        }

        const result = originMethod.apply(history, arguments as any)

        /* 为了避免导致应用重复监听到replaceState和pushState事件，这里的自定义事件名称要取得不一样 */
        const customEvent: CustomEvent = new Event(`__navigation_${type.toLowerCase()}`)

        customEvent.arguments = arguments
        window.dispatchEvent(customEvent)

        return result
      }
    }

    history.pushState = historyHooks('pushState')
    history.replaceState = historyHooks('replaceState')

    /**
     * 由于pushState和replaceState不会触发popstate和hashchange事件，所以需要通过AOP或Proxy来增加replaceState和pushState的事件监听
     * https://github.com/forthealllight/blog/issues/37
     */
    this.opts.replacestate && window.addEventListener('__navigation_replacestate', navigationEventHandler)
    this.opts.popstate && window.addEventListener('__navigation_pushstate', navigationEventHandler)
  }

  /* 监听鼠标移动事件 */
  mouseObserver(element: ObserverElement) {
    const mouseType: MouseType[] = ['click', 'dblclick', 'mousemove', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout']

    let lastMousemoveEvent: MouseEvent | null = null

    mouseType.forEach((type) => {
      if (!this.opts.mouse || !this.opts[type]) return

      element.addEventListener(
        type,
        (e: MouseEvent | Event) => {
          if (this.disable) return

          const event = e as MouseEvent

          /* 对mousemove进行采样限定，以提高性能 */
          if (type === 'mousemove' && this.opts.mousemoveSampleInterval) {
            if (lastMousemoveEvent && event.timeStamp - lastMousemoveEvent.timeStamp < this.opts.mousemoveSampleInterval) return
            lastMousemoveEvent = event
          }

          if (this.isIgnoreDom(event.target as HTMLElement)) return

          const action = {
            type: type,
            time: Date.now(),
            data: extractEventInfo(event, 'mouse'),
          }

          /* 执行自定义事件处理函数 */
          this.opts.mouseHandler instanceof Function && this.opts.mouseHandler(event, action)

          recorder.record(action)

          // TODO 待完善和修复监控bug
          if (type === 'mousemove') {
            // this.dragObserver(event.target as HTMLElement)
          }
        },
        true
      )
    })
  }

  /* 监听屏幕触摸事件 */
  touchObserver(element: ObserverElement) {
    const touchType: TouchType[] = ['touchstart', 'touchmove', 'touchend']

    touchType.forEach((type) => {
      if (!this.opts.touch || !this.opts[type]) return

      element.addEventListener(type, (e: TouchEvent | Event) => {
        if (this.disable) return

        const event = e as TouchEvent

        if (this.isIgnoreDom(event.target as HTMLElement)) return

        const action = {
          type: type,
          time: Date.now(),
          data: extractEventInfo(event, 'touch'),
        }

        /* 执行自定义事件处理函数 */
        this.opts.touchHandler instanceof Function && this.opts.touchHandler(event, action)

        recorder.record(action)
      })
    }, true)
  }

  /**
   * 监听鼠标拖拽事件
   * TODO 待完善
   * @param element
   */
  dragObserver(element: HTMLElement) {
    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0

    element.addEventListener('mousedown', (event: MouseEvent) => {
      isDragging = true
      dragStartX = event.clientX
      dragStartY = event.clientY
    })

    element.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        if (isDragging) {
          const action = {
            type: 'drag',
            time: Date.now(),
            target: event.target as HTMLElement,
            data: extractEventInfo(event, 'drag'),
          }

          /* 执行自定义事件处理函数 */
          this.opts.dragHandler instanceof Function && this.opts.dragHandler(event, action)

          recorder.record(action)
          dragStartX = event.clientX
          dragStartY = event.clientY
        }
      },
      true
    )

    element.addEventListener('mouseup', (event: MouseEvent) => {
      isDragging = false
    })
  }

  /**
   * 监听元素滚动事件
   * TODO 待完善
   * @param element
   */
  scrollObserver(element: ObserverElement) {
    if (!this.opts.scroll) return

    element.addEventListener('scroll', (event: Event) => {
      if (this.disable) return

      if (this.isIgnoreDom(event.target as HTMLElement)) return

      const action = {
        type: 'scroll',
        time: Date.now(),
        data: extractEventInfo(event, 'scroll'),
      }

      /* 执行自定义事件处理函数 */
      this.opts.scrollHandler instanceof Function && this.opts.scrollHandler(event, action)

      recorder.record(action)
    })
  }

  keyboardObserver(element: ObserverElement) {
    const keyboardType: KeyboardType[] = ['keydown', 'keyup', 'keypress']

    keyboardType.forEach((type) => {
      if (!this.opts.keyboard || !this.opts[type]) return

      element.addEventListener(
        type,
        (e: KeyboardEvent | Event) => {
          if (this.disable) return

          const event = e as KeyboardEvent

          if (this.isIgnoredKeyboardEvent(event)) return

          const action = {
            type: type,
            time: Date.now(),
            data: extractEventInfo(event, 'keyboard'),
          }

          /* 执行自定义事件处理函数 */
          this.opts.keyboardHandler instanceof Function && this.opts.keyboardHandler(event, action)

          recorder.record(action)
        },
        true
      )
    })
  }

  isObserver() {
    return !this.disable
  }

  observer() {
    this.disable = false

    if (this.hasRegistered) return true
    this.hasRegistered = true

    /* 注册各个事件的观察函数 */
    const element = this.element
    this.opts.navigation && this.navigationObserver()
    this.opts.mouse && this.mouseObserver(element)
    this.opts.touch && this.touchObserver(element)
    this.opts.scroll && this.scrollObserver(element)
    this.opts.keyboard && this.keyboardObserver(element)

    return this.hasRegistered
  }

  unObserver() {
    this.disable = true
  }
}
