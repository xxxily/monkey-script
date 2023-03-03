/*!
 * @name         locker.js
 * @description  上锁函数
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/5/13 17:41
 * @github       https://github.com/xxxily
 */

interface LockInfo {
  count: number
  expirationTime: number
  unlockTime: number
}

class Locker {
  lockInfo: LockInfo | null

  constructor() {
    this.lockInfo = null
  }

  /**
   * 计次锁，单位时间内调用多少次即进行锁定
   * @param limit {number} -必选 上锁条件一： 达到多少次的调用次数就进行锁定
   * @param duration {number} -必选 上锁条件二：多少时间内达到limit值才上锁，单位毫秒
   * @param delayed {number} -可选 自动解锁时间，默认 0，单位毫秒，即默认锁定后不进行解锁，
   */
  countLocker(limit: number, duration: number, delayed?: number | null | undefined) {
    const t = this
    let needLock = false
    const curTime = new Date().getTime()

    function initLocker() {
      t.lockInfo = {
        count: 1,
        expirationTime: curTime + duration,
        unlockTime: 0,
      }
    }

    if (t.lockInfo) {
      const lock = t.lockInfo
      const isLock = lock.unlockTime && curTime < lock.unlockTime
      if (isLock) {
        needLock = true
      } else {
        lock.count += 1
        const isLimit = lock.count >= limit
        if (isLimit) {
          const outOfDuration = curTime > lock.expirationTime
          if (outOfDuration) {
            /* 超过上锁条件限定的持续时间，需进行重新计算 */
            initLocker()
          } else {
            /* 设定解锁时间标识 */
            if (!delayed) {
              /* 如果未设定解锁时间，则默认设置为10年后解锁（1000 * 60 * 60 * 24 * 365 * 10），相当于永不解锁 */
              lock.unlockTime = curTime + 315360000000
            } else {
              lock.unlockTime = curTime + Number(delayed)
            }
          }
        }
      }
    } else {
      initLocker()

      if (limit <= 1) {
        needLock = true
      }
    }

    return needLock
  }
}

// function demo () {
//   const myLocker = new Locker()
//
//   setInterval(function () {
//     const isLock = myLocker.countLocker(3, 1000, 1000)
//
//     if (isLock) {
//       return false
//     }
//
//     console.log(myLocker.lockInfo)
//   }, 0)
// }
// demo()

export default Locker
