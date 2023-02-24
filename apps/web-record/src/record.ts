type MouseTrace = {
  x: number
  y: number
  time: number
}

const webRecord = {
  name: 'web-record',
  init() {
    console.log('web-record init')

    // 使用ts实现一个录制用户操作的功能，包括鼠标移动、鼠标单击、双击、鼠标拖拽、元素滚动、键盘输入，屏幕触摸等，如果可以，使用一些设计模式，让代码更加精简和优雅

    let mouseTrace: MouseTrace[] = []
    let isDragging = false

    function recordMouseMove(event: MouseEvent) {
      mouseTrace.push({
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
      })
    }

    function recordMouseDown() {
      isDragging = true

      console.log('Mouse Trace: ', mouseTrace)
      console.log('Drag Action: ', isDragging)
    }

    function recordMouseUp() {
      isDragging = false
    }

    function registerEventListeners(frame: Window) {
      frame.addEventListener('mousemove', recordMouseMove)
      frame.addEventListener('mousedown', recordMouseDown)
      frame.addEventListener('mouseup', recordMouseUp)
    }

    function unregisterEventListeners(frame: Window) {
      frame.removeEventListener('mousemove', recordMouseMove)
      frame.removeEventListener('mousedown', recordMouseDown)
      frame.removeEventListener('mouseup', recordMouseUp)
    }

    // Register event listeners for the main window
    registerEventListeners(window)

    // Register event listeners for all iframes
    for (let i = 0; i < window.frames.length; i++) {
      const frame = window.frames[i]
      if (frame && frame.contentWindow) {
        registerEventListeners(frame.contentWindow as Window)
      }
    }

    window.addEventListener('beforeunload', () => {
      if (mouseTrace.length > 0) {
        console.log('Mouse Trace: ', mouseTrace)
        console.log('Drag Action: ', isDragging)
      }

      // Unregister event listeners for the main window
      unregisterEventListeners(window)

      // Unregister event listeners for all iframes
      for (let i = 0; i < window.frames.length; i++) {
        unregisterEventListeners(window.frames[i].contentWindow)
      }
    })
  },
}

export default webRecord
