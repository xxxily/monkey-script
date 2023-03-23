function toogleBoxShadow(element) {
  element.addEventListener('mouseover', (event) => {
    const target = event.target

    // console.log('[mouseover]', target)

    // 判断是否需要添加边框
    if (target && target.style && target.style.boxShadow === 'none') {
      const newBoxShadow = 'inset 0 0 0 1px red'
      target.style.boxShadow = newBoxShadow
    }
  })

  element.addEventListener('mouseout', (event) => {
    const target = event.target

    // console.log('[mouseout]', target)

    if (target && target.style) {
      target.style.boxShadow = 'none'
    }
  })
}

toogleBoxShadow(document.documentElement)



function keyboardInfo() {
  // document.documentElement
  window.addEventListener('keydown', (event) => {
    event.preventDefault()
    event.stopPropagation()
    console.log(`[keyboardInfo] code:${event.code} key:${event.key} keyCode:${event.keyCode}`, event)
  }, true)
}
keyboardInfo()


/* 导航的变化 */
window.addEventListener('popstate', function (event) {
  console.log('[popstate]', location.href, event.state)
});


// js实现：给定指定dom元素，通过递归获取该dom元素在页面中的唯一选择器，递归过程中，如果该节点有class属性则取classList里中能匹配到的最少dom元素的一个值，如果该节点有id，则取id组合成选择器，并结束递归

function getSelector(element) {
  const selectorArr = []
  function recurseSelector(element) {
    /* 传入的element不存在，结束递归 */
    if (!element) return

    /* 遇到根节点结束递归 */
    if (element.tagName.toLowerCase() == 'html') return selectorArr.push('html'); // base case

    let selector = element.tagName.toLowerCase();

    if (element.id) {
      /* 遇到id结束递归 */
      return selectorArr.push('#' + element.id);
    } else if (element.classList.length > 0) {
      /* 寻找classList里中能匹配到的最少dom元素的一个值 */
      let className = element.classList[0]

      if (element.classList.length > 1) {
        let matchElementLength = document.querySelectorAll(`.${className}`).length

        for (let i = 1; i < element.classList.length; i++) {
          let elementsWithClass = document.querySelectorAll('.' + element.classList[i]);

          if (elementsWithClass.length < matchElementLength) {
            className = element.classList[i]
          }
        }
      }

      // selector = `${selector}.${className}`
      selector = `.${className}`

      /* 计算是否需要增加:nth-child */
      if (element.parentElement && element.parentElement.querySelectorAll(selector).length > 1) {
        let siblings = Array.from(element.parentElement.children);
        const index = siblings.findIndex(sibling => sibling === element);

        if (index > 0) {
          selector = `${selector}:nth-child(${index + 1})`
        }
      }

      /**
       * 优化输出，如果当前选择器已经是唯一，则结束递归
       * 这里也可能产生新的问题，当前来说是唯一，但等它继续加载元素的时候，就不是唯一的了
       */
      if (selectorArr.length > 0 && document.querySelectorAll(selector).length === 1) {
        return selectorArr.push(selector);
      }
    }

    selectorArr.push(selector);

    /* 进行递归 */
    recurseSelector(element.parentNode);
  }

  recurseSelector(element)

  return selectorArr.reverse().join(" ")
}


function getUniqueSelector(element) {
  // 如果该元素已经是 body 元素，则直接返回 'body' 作为唯一选择器
  if (element === document.body) {
    return 'body';
  }

  // 如果该元素有 ID，则使用 ID 作为选择器
  if (element.id) {
    return `#${element.id}`;
  }

  // 递归查找该元素的父元素，直到找到一个具有 ID 的祖先元素或者是 body 元素
  const selectorPath = [];
  let currentElement = element;
  while (currentElement !== document.body) {
    const parentElement = currentElement.parentElement;

    // 如果该元素的父元素具有 ID，则将该元素的选择器添加到 selectorPath 数组中
    if (parentElement.id) {
      selectorPath.unshift(`${currentElement.tagName.toLowerCase()}#${currentElement.id}`);
      return selectorPath.join(' > ');
    }

    // 如果该元素的父元素没有 ID，则将该元素的选择器添加到 selectorPath 数组中
    const siblings = Array.from(parentElement.children);
    const index = siblings.findIndex(sibling => sibling === currentElement);

    selectorPath.unshift(`${currentElement.tagName.toLowerCase()}:nth-child(${index + 1})`);

    currentElement = parentElement;
  }

  // 如果找到 body 元素都没有具有 ID 的祖先元素，则返回该元素的标签名作为唯一选择器
  return currentElement.tagName.toLowerCase();
}