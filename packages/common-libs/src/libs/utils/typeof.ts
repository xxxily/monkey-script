/*!
 * @name         utils.js
 * @description  数据类型相关的方法
 * @version      0.0.1
 * @author       Blaze
 * @date         22/03/2019 22:46
 * @github       https://github.com/xxxily
 */

/**
 * 准确地获取对象的具体类型 参见：https://www.talkingcoder.com/article/6333557442705696719
 * @param obj { all } -必选 要判断的对象
 * @returns {*} 返回判断的具体类型
 */
function getType(obj: any): string {
  if (obj == null) {
    return String(obj)
  }

  if (typeof obj === 'object' || typeof obj === 'function') {
    let type = obj.constructor && obj.constructor.name && obj.constructor.name.toLowerCase()

    if (type) {
      return type
    }

    type = /function\s(.+?)\(/.exec(obj.constructor)

    if (type && type[1]) {
      return type[1].toLowerCase()
    } else {
      console.warn('getType: 获取对象类型异常，请注意优化', obj)
      return 'unknown'
    }
  } else {
    return typeof obj
  }
}

const isType = (obj: any, typeName: string) => getType(obj) === typeName
const isObj = (obj: any) => isType(obj, 'object')
const isErr = (obj: any) => isType(obj, 'error')
const isArr = (obj: any) => isType(obj, 'array')
const isRegExp = (obj: any) => isType(obj, 'regexp')
const isFunction = (obj: any) => obj instanceof Function
const isUndefined = (obj: any) => isType(obj, 'undefined')
const isNull = (obj: any) => isType(obj, 'null')

/* 下面是一些测试用例： */
// getType(window) // 'window'
// getType(localStorage) // 'storagelocal'
// getType(sessionStorage) // 'storagesession'
// getType(Symbol()) // 'symbol'
// getType(new Date()) // 'date'
// getType(document) // 'htmldocument'
// getType(document.body) // 'htmlbodyelement'
// getType(document.createElement('div')) // 'htmldivelement'
// getType(document.createElement('script')) // 'htmlscriptelement'
// getType(document.createElement('link')) // 'htmllinkelement'
// getType(document.createElement('iframe')) // 'htmliframeelement'
// getType(document.createElement('img')) // 'htmlimageelement'

export { getType, isType, isObj, isErr, isArr, isRegExp, isFunction, isUndefined, isNull }
