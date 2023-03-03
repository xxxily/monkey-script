import { UserAction, UserActionType } from './recorder '
import handlebars from 'handlebars'

type TemplateMap = Record<UserActionType, string | undefined | null>

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
 * handlebars模板语法：https://handlebarsjs.com/zh/guide/
 */
export const seleniumPythonTemplateMap: TemplateMap = {
  click: "# 执行了单击事件 {{#if data.innerText}} 元素文本信息： {{data.innerText}}{{/if}}\ndriver.find_elements(By.XPATH, '{{data.xPath}}').click()",
  dblclick:
    "# 执行了双击事件 {{#if data.innerText}} 元素文本信息： {{data.innerText}}{{/if}}\nActionChains(driver).double_click(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mousemove: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mousedown: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mouseup: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mouseenter: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mouseleave: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mouseover: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  mouseout: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  keydown: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  keyup: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  keypress: 'ActionChains(driver).send_keys(Keys.{{data.code}}).perform()',
  touchstart: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  touchmove: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  touchend: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  dragstart: "ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  drag: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  drop: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  dragend: "ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  dragenter: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  dragleave: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  dragover: "ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  scroll: 'driver.execute_script("window.scrollTo({{data.x}}, {{data.y}})")',
}
