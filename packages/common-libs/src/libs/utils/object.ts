/*!
 * @name         object.ts
 * @description  对象操作的相关方法
 * @version      0.0.2
 * @author       xxxily
 * @date         2023/03/01 16:43
 * @github       https://github.com/xxxily
 */

/**
 * 对一个对象进行深度拷贝
 * @source -必选（Object|Array）需拷贝的对象或数组
 */
function clone<T extends object | any[]>(source: T): T {
  let result: any

  if (typeof source !== 'object') {
    return source
  }

  if (Array.isArray(source)) {
    result = []
  } else if (source === null) {
    result = null
  } else {
    result = {}
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = typeof source[key] === 'object' ? clone(source[key] as T) : source[key]
    }
  }

  return result as T
}

/* 遍历对象，但不包含其原型链上的属性 */
function forIn<T extends object>(obj: T, fn: (key: keyof T, value: T[keyof T]) => void | boolean): void {
  fn = fn || function () {}
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      fn(key, obj[key])
    }
  }
}

/* 获取对象的key值，ES6+应用可使用Object.keys()代替 */
function getObjKeys<T extends object>(obj: T): Array<keyof T> {
  const keys: Array<keyof T> = []
  forIn(obj, function (key) {
    keys.push(key)
  })
  return keys
}

/**
 * 深度合并两个可枚举的对象
 * @param objA {object} -必选 对象A
 * @param objB {object} -必选 对象B
 * @param concatArr {boolean} -可选 合并数组，默认遇到数组的时候，直接以另外一个数组替换当前数组，将此设置true则，遇到数组的时候一律合并，而不是直接替换
 * @returns {*|void}
 */
function mergeObj<T extends object>(objA: T, objB: T, concatArr?: boolean): T {
  function isObj(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }
  function isArr(arr: any): boolean {
    return Object.prototype.toString.call(arr) === '[object Array]'
  }

  if (!isObj(objA) || !isObj(objB)) return objA

  function deepMerge(objA: T, objB: T): T {
    forIn(objB, function (key, subItemB) {
      const subItemA = objA[key]
      if (typeof subItemA === 'undefined') {
        objA[key] = subItemB
      } else {
        if (isObj(subItemA) && isObj(subItemB)) {
          /* 进行深层合并 */
          objA[key] = deepMerge(subItemA as T, subItemB as T) as T[keyof T]
        } else {
          if (concatArr && isArr(subItemA) && isArr(subItemB)) {
            const arrSubItemA = subItemA as any[]
            objA[key] = arrSubItemA.concat(subItemB) as T[keyof T]
          } else {
            objA[key] = subItemB
          }
        }
      }
    })

    return objA
  }

  return deepMerge(objA, objB)
}

/**
 * 多对象深度合并，合并规则基于mergeObj，但不存在concatArr选项
 * @returns {*}
 */
function merge() {
  let result = arguments[0]
  for (let i = 0; i < arguments.length; i++) {
    if (i) {
      result = mergeObj(result, arguments[i])
    }
  }
  return result
}

/**
 * 根据文本路径获取对象里面的值，如需支持数组请使用lodash的get方法
 * @param obj {Object} -必选 要操作的对象
 * @param path {String} -必选 路径信息
 * @returns {*}
 */
function getValByPath<T extends object>(obj: T, path: string): any {
  path = path || ''
  const pathArr = path.split('.')
  let result: any = obj

  /* 递归提取结果值 */
  for (let i = 0; i < pathArr.length; i++) {
    if (!result) break
    result = result[pathArr[i]]
  }

  return result
}

/**
 * 根据文本路径设置对象里面的值，如需支持数组请使用lodash的set方法
 * @param obj {Object} -必选 要操作的对象
 * @param path {String} -必选 路径信息
 * @param val {Any} -必选 如果不传该参，最终结果会被设置为undefined
 * @returns {Boolean} 返回true表示设置成功，否则设置失败
 */
function setValByPath<T extends object>(obj: T, path: string, val: any): boolean {
  if (!obj || !path || typeof path !== 'string') {
    return false
  }

  let result: any = obj
  const pathArr = path.split('.')

  for (let i = 0; i < pathArr.length; i++) {
    if (!result) break

    if (i === pathArr.length - 1) {
      result[pathArr[i]] = val
      return Number.isNaN(val) ? Number.isNaN(result[pathArr[i]]) : result[pathArr[i]] === val
    }

    result = result[pathArr[i]]
  }

  return false
}

export { clone, forIn, getObjKeys, mergeObj, merge, getValByPath, setValByPath }
