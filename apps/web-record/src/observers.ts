import Recorder from './recorder '
import { UserAction, MouseType, KeyboardType, TouchType } from './recorder '

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

          const action = {
            type: type,
            time: Date.now(),
            data: {
              event: event,
              x: event.clientX,
              y: event.clientY,
            },
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

        const action = {
          type: type,
          time: Date.now(),
          data: {
            event: event,
            // x: event.touches[0].clientX,
            // y: event.touches[0].clientY,
          },
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

    element.addEventListener('mousemove', (event: MouseEvent) => {
      if (isDragging) {
        const action = {
          type: 'drag',
          time: Date.now(),
          target: event.target as HTMLElement,
          data: {
            startX: dragStartX,
            startY: dragStartY,
            endX: event.clientX,
            endY: event.clientY,
          },
        }

        /* 执行自定义事件处理函数 */
        this.opts.dragHandler instanceof Function && this.opts.dragHandler(event, action)

        recorder.record(action)
        dragStartX = event.clientX
        dragStartY = event.clientY
      }
    }, true)

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

      const action = {
        type: 'scroll',
        time: Date.now(),
        data: {
          event: event,
          scrollTop: (event.target as HTMLElement).scrollTop,
        },
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

          const action = {
            type: type,
            time: Date.now(),
            data: {
              event: event,
              key: event.key,
              keyCode: event.keyCode,
            },
          }

          /* 执行自定义事件处理函数 */
          this.opts.keyboardHandler instanceof Function && this.opts.keyboardHandler(event, action)

          recorder.record(action)
        },
        true
      )
    })
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
