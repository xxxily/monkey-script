/*!
 * @name         ajaxHook.js
 * @description  XMLHttpRequest hook
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/11/10 10:10
 * @github       https://github.com/xxxily
 */

import hookJs from './index'
import InterceptorManager from '../../libs/InterceptorManager'

hookJs.hookClass(window, 'XMLHttpRequest', (args, parentObj, methodName, originMethod, execInfo) => {
  // execInfo.result
}, 'aftet')

function ajaxHook () {}
ajaxHook.prototype.interceptors = {
  response: new InterceptorManager(),
  request: new InterceptorManager()
}

export default ajaxHook
