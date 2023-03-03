/**
 * 将毫秒数转为天/时/分/秒的表达形式，一般用于展示耗时情况
 * @param msd {number} -必选 毫秒数
 * @param retuenDefText -可选 默认出数组信息，true则输出统计结果的默认文本
 * @returns {string|[number, number, number, number, number]}
 */
function millisecondToDate(msd: number, returnDefText?: boolean): number[] | string {
  /* 数据预处理 */
  let msdTotal = parseFloat(msd.toString())
  if (msdTotal < 0) msdTotal = 0

  /**
   * parseInt(1/(1000*60*60*24))将出现计算异常
   * 所以需要加上Math.floor进行修正
   * 必须是向下取整，四舍五入或向上取整都将导致出现负数的情况
   * @param num
   * @returns {number}
   */
  function convert(num: number): number {
    return parseInt(Math.floor(num).toString())
  }

  /* 进行硬编码式的递归计算 */
  const oneMillisecond = 1
  const oneSecond = oneMillisecond * 1000
  const oneMinute = oneSecond * 60
  const oneHour = oneMinute * 60
  const oneDay = oneHour * 24
  const dayCount = convert(msdTotal / oneDay)
  msdTotal = msdTotal - dayCount * oneDay
  const hourCount = convert(msdTotal / oneHour)
  msdTotal = msdTotal - hourCount * oneHour
  const minuteCount = convert(msdTotal / oneMinute)
  msdTotal = msdTotal - minuteCount * oneMinute
  const secondCount = convert(msdTotal / oneSecond)
  msdTotal = msdTotal - secondCount * oneSecond
  const millisecondCount = convert(msdTotal / oneMillisecond)
  const result: number[] = [dayCount, hourCount, minuteCount, secondCount, millisecondCount]

  /* 输出结果 */
  if (returnDefText) {
    let str = ''
    const textMap = ['天', '小时', '分钟', '秒', '毫秒']
    result.forEach((val, index) => {
      if (val) str += val + textMap[index] + ' '
    })
    return str
  } else {
    return result
  }
}

export default millisecondToDate
