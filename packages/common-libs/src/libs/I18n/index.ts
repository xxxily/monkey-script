/*!
 * @name         i18n.ts
 * @description  简单的i18n的底层实现
 * @version      0.0.1
 * @author       xxxily
 * @date         2023/03/01 16:16
 * @github       https://github.com/xxxily
 */

type Language = {
  [key: string | number | symbol]: string
}

type Config = {
  locale?: string
  languages?: Record<string, Language>
  // languages?: {
  //   [key: string]: Language
  // }
  defaultLanguage?: string
}

interface I18nInterface {
  init(config?: Config): void | boolean
  use(): void | boolean
  t(path: string): string
  language(): string
  languages(): {
    [key: string]: Language
  }
  changeLanguage(locale: string): boolean | string
  getValByPath(obj: object, path: string): any
  getClientLang(): string
}

class I18n implements I18nInterface {
  private _languages: {
    [key: string]: Language
  }
  private _locale: string
  private _defaultLanguage: string

  constructor(config: Config) {
    this._languages = {}
    this._locale = this.getClientLang()
    this._defaultLanguage = ''
    this.init(config)
  }

  init(config: Config) {
    if (!config) return

    const t = this
    t._locale = config.locale || t._locale
    /* 指定当前要是使用的语言环境，默认无需指定，会自动读取 */
    t._languages = config.languages || t._languages
    t._defaultLanguage = config.defaultLanguage || t._defaultLanguage
  }

  use() {}

  t(path: string) {
    const t = this
    let result = t.getValByPath(t._languages[t._locale] || {}, path)

    /* 版本回退 */
    if (!result && t._locale !== t._defaultLanguage) {
      result = t.getValByPath(t._languages[t._defaultLanguage] || {}, path)
    }

    return result || ''
  }

  /* 当前语言值 */
  language() {
    return this._locale
  }

  languages() {
    return this._languages
  }

  changeLanguage(locale: string) {
    if (this._languages[locale]) {
      this._locale = locale
      return locale
    } else {
      return false
    }
  }

  /**
   * 根据文本路径获取对象里面的值
   * @param obj {Object} -必选 要操作的对象
   * @param path {String} -必选 路径信息
   * @returns {*}
   */
  getValByPath(obj: object, path: string): any {
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

  /* 获取客户端当前的语言环境 */
  getClientLang() {
    return navigator.languages ? navigator.languages[0] : navigator.language
  }
}

/* 使用demo */
// const i18n = new I18n({
//   defaultLanguage: 'zh',
//   locale: 'en',
//   languages: {
//     zh: {
//       demo: '11111',
//       test: '111112'
//     },
//     en: {
//       demo: '2222222222',
//       aaa: {
//         bbb: '111111'
//       }
//     }
//   }
// })
// console.log(i18n.t('test'))

export default I18n
