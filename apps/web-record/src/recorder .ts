export type MouseType = 'click' | 'dblclick' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout'
export type KeyboardType = 'keydown' | 'keyup' | 'keypress'
export type TouchType = 'touchstart' | 'touchmove' | 'touchend'
export type DragType = 'dragstart' | 'drag' | 'dragend' | 'dragenter' | 'dragleave' | 'dragover' | 'drop'
export type ScrollType = 'scroll'

// 定义用户操作类型
export type UserActionType = MouseType | KeyboardType | TouchType | DragType | ScrollType | string

// 定义用户操作数据
export interface UserAction {
  type: UserActionType
  time: number // 操作时间
  target?: HTMLElement // 操作目标元素
  data?: any // 其他操作数据
  __drop__?: undefined | null | boolean // 是否将当前数据丢弃的标识
}

// 定义录制器类
export default class Recorder {
  private actions: UserAction[] = [] // 用户操作记录

  private observers: ((action: UserAction) => void)[] = [] // 观察者列表

  // 注册观察者
  public register(observer: (action: UserAction) => void) {
    this.observers.push(observer)
  }

  // 取消注册观察者
  public unregister(observer: (action: UserAction) => void) {
    const index = this.observers.indexOf(observer)
    if (index >= 0) {
      this.observers.splice(index, 1)
    }
  }

  // 通知观察者记录用户操作
  private notify(action: UserAction) {
    for (const observer of this.observers) {
      observer(action)
    }
  }

  // 记录用户操作
  public record(action: UserAction) {
    if (action.__drop__) return
    this.actions.push(action)
    this.notify(action)
  }

  // 获取用户操作记录
  public getActions(): UserAction[] {
    return this.actions
  }

  // 清除用户操作记录
  public clear() {
    this.actions = []
  }
}
