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