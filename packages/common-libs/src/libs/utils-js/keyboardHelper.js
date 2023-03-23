/**
 * 全局键位状态监听，其他地方可以通过引用该方法来获取键位状态，而不需要再次绑定事件
 * 主要适用于其他事件里需要包含键位状态的情况，比如鼠标事件+键位状态触发某些操作的场景
 */

const keyboardHelper = (() => {
  const keysPressedTimer = {};
  const keysPressedTimeout = 200
  const keysPressed = {};

  let hasInit = false;

  return () => {
    if (hasInit) {
      return keysPressed;
    }

    window.addEventListener('keydown', (event) => {
      const { keyCode, code } = event;

      keysPressed[keyCode] = true;
      keysPressed[code] = true;

      clearTimeout(keysPressedTimer[code]);
      keysPressedTimer[code] = setTimeout(() => {
        delete keysPressed[keyCode];
        delete keysPressed[code];
      }, keysPressedTimeout);
    }, true);

    window.addEventListener('keyup', (event) => {
      const { keyCode, code } = event;

      console.log(keysPressed);

      clearTimeout(keysPressedTimer[code]);
      delete keysPressed[keyCode];
      delete keysPressed[code];
    }, true);

    hasInit = true;
    return keysPressed
  };
})();

/* 使用示例：按住ctrl键位时，鼠标移动到哪个元素就打印哪个元素的信息 */
// const keysPressed = keyboardHelper();
// document.addEventListener('mouseover', (event) => {
//   if (keysPressed['ControlLeft'] || keysPressed['ControlRight']) {
//     console.log('[keyboardHelper demo]', event);
//   }
// });

export default keyboardHelper