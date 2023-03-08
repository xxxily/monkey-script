# web-record

浏览器操作录制辅助脚本

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

安装好油猴后，到脚本的greasyfork页面安装即可

## 使用

安装好脚本，通过快捷键即可开始录制，各个快捷键的功能如下

|  快捷键   | 说明    |
| --- | --- |
| F1 | 开启/关闭录制功能 |
| F2 | 开启/关闭录制功能(开启前会清空之前的录制结果) |
| F3 | 打印录制动作转换后的代码文本 |
| F4 | 打印录制动作的原始数据 |

注意：可通过浏览器的控制台查看录制的动作和打印出来的相关信息

## 功能菜单

通过点击脚本图标，可以打开功能菜单，菜单中的功能如下：

### 启用/禁用脚本

默认会在所有网页里开启脚本，如果不想在某些网页里开启脚本，可以在这里关闭，该选项只会针对当前域名生效

### 启用/禁用默认的录制模式

默认进入网页后，需要按下快捷键才能开始录制，如果想进入页面后就开启录制能力，可以通过该选项开启

### 编辑代码模板

端测代码是通过映射录制的动作，然后通过代码模板生成的，

编写模板的规则：待补充

### 关闭/开启调试模式

开启调试模式后，会在控制台打印一些调试信息，目前默认是开启的

### 禁用/启用元素高亮辅助插件

元素高亮辅助插件可以帮助录制人员了解当前元素的的对应的区块空间，从而正确地对元素进行操作，目前默认是开启的
