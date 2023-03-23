# web-record

浏览器操作录制并自动换行成端测代码的辅助脚本

## 特性

- 基于油猴插件，可在 Chrome、Firefox、Edge、Safari 等浏览器下使用
- 支持各种基于webkit内核的国产浏览器（也是因为基于油猴）
- 支持录制各种浏览器动作/事件
- 灵活的事件扩展机制，可自定义事件
- 支持事件到端测代码的转换
- 支持通过自定义代码模板生成各种端测代码
- 核心交互通过快捷键完成，高效便捷

## 安装

### 安装油猴

可以科学上网的，请优先到对应的应用商店安装`Tampermonkey`

- [Tampermonkey（chrome商店）](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Tampermonkey（edge商店）](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Tampermonkey（firefox商店）](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)

如果没法科学上网，可以到[油猴官网](https://www.tampermonkey.net/)下载对应的安装包，或者用别人下载好的

### 安装脚本

安装好油猴后，到脚本的greasyfork页面安装即可：  

[https://greasyfork.org/zh-CN/scripts/461403](https://greasyfork.org/zh-CN/scripts/461403)

## 使用

安装好脚本，通过快捷键即可开始录制，各个快捷键的功能如下

|  快捷键   | 说明    |
| --- | --- |
| F1 | 开启/关闭录制功能 |
| F2 | 开启/关闭录制功能(开启前会清空之前的录制结果) |
| F3 | 打印录制动作转换后的代码文本 |
| F4 | 打印录制动作的原始数据 |
| CTRL+C | 复制当前高亮元素的cssSelector、xPath等信息 |

注意：可通过浏览器的控制台查看录制的动作和打印出来的相关信息

## 拾取元素选择器

为了方便开发人员快速获得元素的选择器，脚本支持通过快捷键`CTRL+C`拾取当前高亮的元素的选择器。  

目前支持的选择器类型有：cssSelector、xPath、fullXPath、innerText

默认在高亮的元素中首次按下`CTRL+C`会自动将当前元素的cssSelector复制到剪贴板，之后再按下`CTRL+C`会将当前元素的xPath复制到剪贴板，再按下一次会将当前元素的fullXPath复制到剪贴板，再按下一次会将当前元素的innerText复制到剪贴板，再按下一次会将当前元素的cssSelector复制到剪贴板，以此类推。

根据以上规则，假如你期望每次都是复制xPath，那么只需要在高亮元素中快速按下`CTRL+C`两次即可。

## 功能菜单

通过点击脚本图标，可以打开功能菜单，菜单中的功能如下：

### 启用/禁用脚本

默认会在所有网页里开启脚本，如果不想在某些网页里开启脚本，可以在这里关闭

### 启用/禁用默认的录制模式

默认进入网页后，需要按下快捷键才能开始录制，如果想进入页面后就开启录制能力，可以通过该选项开启

### 编辑代码模板

端测代码是通过映射录制的动作然后通过代码模板生成的  

目前编辑代码模板只是提供了基本的输入修改入口，并没有提供好的编辑方式，所以建议通过在线编辑器或本地编辑器来进行编辑  

代码模板的基本结构如下：  

```json
{
  "click":"# 执行了单击事件 {{#if data.innerText}} 元素文本信息： {{data.innerText}}{{/if}}\ndriver.find_elements(By.XPATH, '{{data.xPath}}').click()",
  "dblclick":"# 执行了双击事件 {{#if data.innerText}} 元素文本信息： {{data.innerText}}{{/if}}\nActionChains(driver).double_click(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mousemove":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mousedown":"ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mouseup":"ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mouseenter":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mouseleave":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "mouseover":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform...ease(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "dragstart":"ActionChains(driver).click_and_hold(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "drag":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "drop":"ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "dragend":"ActionChains(driver).release(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "dragenter":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "dragleave":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "dragover":"ActionChains(driver).move_to_element(driver.find_element_by_css_selector('{{data.xPath}}')).perform()",
  "scroll":"driver.execute_script(\"window.scrollTo({{data.x}}, {{data.y}})\")",
  "actionCompose":{
    "navigation":"location.href = \"{{data.href}}\""
  }
}
```

左侧的键名对应的是事件名称，后面的键值对应的是这个事件触发后要生成的代码

例如假如我们指向定制click事件的模板：

```json
{
  "click":"driver.find_elements(By.XPATH, '{{data.xPath}}').click()",
}
```

则在用户进行点击元素操作的时候，会生成并输出如下代码：

```text
driver.find_elements(By.XPATH, 'id("head_wrapper")').click()
```

如果是连续点击，则会生成一系列的操作对应的代码  

#### 模板数据

每个事件都会有其对应的模板数据，这些模板数据有哪些字段可以通过 `F4` 打印出录制动作的原始数据来查看。  

以点击事件为例，其原始数据的数据结果基本如下：

```json
{
  "type": "click",
  "time": 1679033681158,
  "data": {
    "isTrusted": true,
    "pointerId": 1,
    "width": 1,
    "height": 1,
    "pressure": 0,
    "tiltX": 0,
    "tiltY": 0,
    "azimuthAngle": 0,
    "altitudeAngle": 1.5707963267948966,
    "tangentialPressure": 0,
    "twist": 0,
    "pointerType": "mouse",
    "isPrimary": false,
    "screenX": 685,
    "screenY": 429,
    "clientX": 685,
    "clientY": 326,
    "ctrlKey": false,
    "shiftKey": false,
    "altKey": false,
    "metaKey": false,
    "button": 0,
    "buttons": 0,
    "pageX": 685,
    "pageY": 326,
    "x": 685,
    "y": 326,
    "offsetX": 295,
    "offsetY": 18,
    "movementX": 0,
    "movementY": 0,
    "layerX": 297,
    "layerY": 20,
    "detail": 1,
    "which": 1,
    "type": "click",
    "eventPhase": 1,
    "bubbles": true,
    "cancelable": true,
    "defaultPrevented": false,
    "composed": true,
    "timeStamp": 9344.900000035763,
    "returnValue": true,
    "cancelBubble": false,
    "NONE": 0,
    "CAPTURING_PHASE": 1,
    "AT_TARGET": 2,
    "BUBBLING_PHASE": 3,
    "fullXPath": "/html[1]/body[1]/div[1]/div[2]/div[5]/div[1]/div[1]/form[1]/span[1]/input[1]",
    "xPath": "id(\"kw\")",
    "actionCompose": "mouse"
  }
}
```

上面的字段就是我们在编写代码模板时候的可用字段，这也就是为什么我们可以在代码模板里使用：`{{data.xPath}}` 来代替find_elements里面的参数的原因了。  

不同的事件对应的原始数据会有所不同，目前请以打印出录制动作的原始数据的结果为准。  

有些字段需要符合条件才会有，例如上面的`click`事件里的`innerText`，需要符合：元素的子元素数量小于等于3个，且子元素的dom节点数小于5，且innerText的字符长度小于80时才获取innerText，所以我们可以使用条件判断语句来按需输出模板：

```json
{
  "click":"# 执行了单击事件 {{#if data.innerText}} 元素文本信息： {{data.innerText}}{{/if}}\ndriver.find_elements(By.XPATH, '{{data.xPath}}').click()",
}
```

端测代码文本的生成工具使用的是：handlebarsjs  
所以编写模板的语法规则参见：[https://handlebarsjs.com/zh/guide/](https://handlebarsjs.com/zh/guide/)

#### 组合动作模板

每个事件会对应一个明确的动作类型，例如点击动作，对应的动作类型就是`click`,但同时他们也可以归入到一个更大的类别里，例如：
click、dblclick、mousemove、mousedown、mouseup、mouseenter、mouseleave、mouseover 等这些动作都属于鼠标操作，所以它们的大类都是相同的，通过`data.actionCompose` 可以知道当前动作属于哪个组合动作，例如上面的click，对应的data.actionCompose则是：`mouse`  

我们可以通过在模板的`actionCompose`里来定义组合动作的通用模板：

例如导航（navigation）这个动作，它可以是由DOMContentLoaded、pushstate、replacestate、popstate、hashchange等一系子事件来触发的，我们给这些子事件都定义响应的动作模板，例如：

```json
{
  "DOMContentLoaded": "location.href = \"{{data.href}}\"",
  "pushstate": "location.href = \"{{data.href}}\"",
  "replacestate": "location.href = \"{{data.href}}\"",
  "popstate": "location.href = \"{{data.href}}\"",
  "hashchange": "location.href = \"{{data.href}}\"",
}
```

上面的例子中我们希望每个导航动作都输出：`location.href = "{{data.href}}"` 的代码，这样是可以的，但也显得很繁琐，其实我们还可以通过定义组合动作模板来达到同样的输出：

下面的模板定义跟上面定义是完全等价的：

```json
{
  "actionCompose":{
    "navigation":"location.href = \"{{data.href}}\""
  }
}
```

navigation 这个组合动作统一输出`location.href = "{{data.href}}"`

#### 代码模板helper

代码模板helper用于实现一些并非 Handlesbars 语言本身的功能，具体参见：  
[handlebarsjs的助手代码](https://handlebarsjs.com/zh/guide/expressions.html#%E5%8A%A9%E6%89%8B%E4%BB%A3%E7%A0%81)

目前默认内置的helper有：

##### toSingleQuotes

将字符串转成单引号，用于将变量结果里的双引号转成单引号。

使用示例如下：

```json
{
  "click":"driver.find_elements(By.XPATH, '{{toSingleQuotes data.xPath}}').click()"
}
```

假如获取到的xPath是：`//div[@class="s_btn_wr"]//input[@id="su"]`，那么转换后的结果就是：`//div[@class='s_btn_wr']//input[@id='su']`

##### toDoubleQuotes

将字符串转成双引号，用于将变量结果里的单引号转成双引号。

使用示例如下：

```json
{
  "click":"driver.find_elements(By.XPATH, '{{toDoubleQuotes data.xPath}}').click()"
}
```

PS：目前默认输出的代码模板都是双引号，所以一般来说并不需要将变量结果转换成双引号

### 关闭/开启调试模式

开启调试模式后，会在控制台打印一些调试信息，目前默认是开启的

### 禁用/启用元素高亮辅助插件

元素高亮辅助插件可以帮助录制人员了解当前元素的的对应的区块空间，从而正确地对元素进行操作，目前默认是开启的
