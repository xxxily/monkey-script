import { UserAction } from './recorder '
import handlebars from 'handlebars'

interface TemplateMap {
  click?: string
  dblclick?: string
  mousemove?: string
  mousedown?: string
  mouseup?: string
  mouseenter?: string
  mouseleave?: string
  mouseover?: string
  mouseout?: string
  keydown?: string
  keyup?: string
  keypress?: string
  touchstart?: string
  touchmove?: string
  touchend?: string
  dragstart?: string
  drag?: string
  drop?: string
  dragend?: string
  dragenter?: string
  dragleave?: string
  dragover?: string
  scroll?: string
  [key: string | number | symbol]: string | undefined | null
}

/**
 * 基于handlebars模板引擎，将用户操作转换为代码
 * @param actions 用户操作产生的数据集
 * @param templateMap 模板映射
 * @param allowEscape 是否禁用handlebars的逃逸规则，默认为false
 * @returns {string}
 */
export default function userActionsToCode(actions: UserAction[], templateMap: TemplateMap, allowEscape: boolean = false): string {
  const codeArr: string[] = []
  const defaultEscapeExpression = handlebars.Utils.escapeExpression

  if (allowEscape) {
    handlebars.Utils.escapeExpression = (str: string) => str
  }

  actions.forEach((action) => {
    if (templateMap[action.type]) {
      const template = handlebars.compile(templateMap[action.type])
      codeArr.push(template(action))
    }
  })

  /* 转义完成恢复默认逃逸规则 */
  handlebars.Utils.escapeExpression = defaultEscapeExpression

  return codeArr.join('\n')
}

/**
 * selenium python模板映射（示例）
 */
export const seleniumPythonTemplateMap: TemplateMap = {
  click: "# 执行了单击事件\ndriver.find_elements(By.XPATH, '{{data.xpath}}').click()",
  dblclick: "# 执行了单击事件\nActionChains(driver).double_click(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mousemove: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mousedown: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mouseup: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mouseenter: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mouseleave: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mouseover: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  mouseout: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  keydown: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  keyup: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  keypress: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  touchstart: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  touchmove: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  touchend: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  dragstart: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  drag: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  drop: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  dragend: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  dragenter: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  dragleave: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  dragover: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xpath}}')).perform()",
  scroll: 'driver.execute_script("window.scrollTo({{data.x}}, {{data.y}})")',
}
