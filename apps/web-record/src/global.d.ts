export declare global {
  interface Window {
    /* 允许window扩展未知名称的属性 */
    [prop: string | number | symbol]: any
  }

  interface HTMLElement {
    /* 允许在dom元素里扩展未知名称的属性 */
    [prop: string | number | symbol]: any
  }
}
