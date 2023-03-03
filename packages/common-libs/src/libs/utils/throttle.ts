/**
 * 简单的节流函数
 * @param fn
 * @param interval
 * @returns {Function}
 */
function throttle<F extends (...args: any[]) => any>(fn: F, interval = 80): (...args: Parameters<F>) => void {
  let timeout: number | null = null
  return function (this: any, ...args: Parameters<F>): void {
    if (timeout) return
    timeout = setTimeout(() => {
      timeout = null
    }, interval)
    fn.apply(this, args)
  }
}

export { throttle }
