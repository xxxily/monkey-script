import ready from './ready'
import attrObserver from './attrObserver'
import hackAttachShadow from './hackAttachShadow'
import hackEventListener from './hackEventListener'
import { getType, isType, isObj, isErr, isArr, isRegExp, isFunction, isUndefined, isNull } from './typeof'
import { clone, forIn, getObjKeys, mergeObj, merge, getValByPath, setValByPath } from './object'
import { quickSort } from './number'
import { hideDom, eachParentNode, getContainer, loadCSSText, isEditableTarget } from './dom'
import { fakeUA, userAgentMap } from './fakeUA'
import { fakeVisible, fakeHidden } from './fakeVisibilityState'
import { isInIframe, isInCrossOriginFrame } from './iframe'
import { throttle } from './throttle'
import { parseURL, stringifyParams, stringifyToUrl } from './url'
import copyText from './copyText'
import { loadFile, loadScript, loadCss, loadIframe } from './loadFile'

export {
  ready,
  attrObserver,
  hackAttachShadow,
  hackEventListener,
  getType,
  isType,
  isObj,
  isErr,
  isArr,
  isRegExp,
  isFunction,
  isUndefined,
  isNull,
  clone,
  forIn,
  getObjKeys,
  mergeObj,
  merge,
  getValByPath,
  setValByPath,
  quickSort,
  hideDom,
  loadCSSText,
  isEditableTarget,
  eachParentNode,
  getContainer,
  fakeUA,
  userAgentMap,
  fakeVisible,
  fakeHidden,
  isInIframe,
  isInCrossOriginFrame,
  throttle,
  copyText,
  parseURL,
  stringifyParams,
  stringifyToUrl,
  loadFile,
  loadScript,
  loadCss,
  loadIframe,
}
