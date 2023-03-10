import Recorder from './recorder'
import { UserAction, MouseType, KeyboardType, TouchType } from './recorder'
import { getXPath, getFullXPath, getElementByXPath } from './helper'

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
  mouse?: boolean
  touch?: boolean
  drag?: boolean
  scroll?: boolean
  keyboard?: boolean

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
    hotKeys?: string[]
    handler?: (e: Event) => boolean
  }
}

/* 判断键名是否是对象的键名 */
export function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
  return key in object
}

/**
 * 解决for in 类型报：在类型 "xxx"上找不到具有类型为 "string" 的参数的索引签名
 * https://blog.csdn.net/zy21131437/article/details/121246493
 */
interface EventObject extends Event {
  [key: string | number | symbol]: any
}

/* 提取事件的相关信息 */
export interface EventInfo {
  [key: string | number | symbol]: any
}

function extractEventInfo(e: EventObject) {
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

  /* 利用缓存减少计算量 */
  if (target.__observers_full_xpath__ && getElementByXPath(target.__observers_full_xpath__) === target) {
    eventInfo.fullXPath = target.__observers_full_xpath__
  } else {
    eventInfo.fullXPath = getFullXPath(target)
    target.__observers_full_xpath__ = eventInfo.fullXPath
  }

  /* 利用缓存减少计算量 */
  if (target.__observers_xpath__ && getElementByXPath(target.__observers_xpath__) === target) {
    eventInfo.xPath = target.__observers_xpath__
  } else {
    eventInfo.xPath = getXPath(target)
    target.__observers_xpath__ = eventInfo.xPath
  }

  /* 获取元素矩形信息，暂时来说没太大用处 */
  // if (target.getBoundingClientRect) {
  //   eventInfo.rect = target.getBoundingClientRect()
  // } else {
  //   /* 当target为document时，target.getBoundingClientRect为undefined */
  //   // console.error('[extractEventInfo] target.getBoundingClientRect is not a function', target)
  // }

  /**
   * 获取元素的innerText
   * 为了降低性能损耗，只有当元素的子元素数量小于等于3个，且子元素的dom节点数小于5，且innerText的字符长度小于80时才获取innerText
   * 另外：过于复杂的dom结构，获取到的innerText并不是我们所需要的
   */
  if (target.childElementCount <= 3 && target.querySelectorAll('*').length < 5 && target.innerText && target.innerText.length < 80) {
    eventInfo.innerText = target.innerText
  }

  return eventInfo
}

export default class WebObserver {
  record: (action: UserAction) => void
  recorder: Recorder
  private element: ObserverElement
  private disable: boolean = false
  private hasRegistered: boolean = false
  private opts: Options = {
    /* 大类 */
    mouse: true,
    touch: true,
    drag: true,
    scroll: true,
    keyboard: true,

    /* 小类 */
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
    if (this.opts.ignore) {
      const { className, tagName, ids } = this.opts.ignore

      if (className && className.length) {
        for (let i = 0; i < className.length; i++) {
          if (target.classList.contains(className[i])) {
            return true
          }
        }
      }

      if (tagName && tagName.length) {
        for (let i = 0; i < tagName.length; i++) {
          if (target.tagName === tagName[i].toUpperCase()) {
            return true
          }
        }
      }

      if (ids && ids.length) {
        for (let i = 0; i < ids.length; i++) {
          if (target.id === ids[i]) {
            return true
          }
        }
      }
    }

    return false
  }

  isIgnoredKeyboardEvent(e: KeyboardEvent) {
    if (this.opts.ignore) {
      const { keyCodes } = this.opts.ignore

      if (keyCodes && keyCodes.length) {
        return keyCodes.includes(e.keyCode)
      }
    }

    return false
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
            data: extractEventInfo(event),
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
          data: extractEventInfo(event),
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
            data: extractEventInfo(event),
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
        data: extractEventInfo(event),
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
            data: extractEventInfo(event),
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
