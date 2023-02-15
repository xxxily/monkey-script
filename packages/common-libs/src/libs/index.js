import './comment'
const stopFn = window.rrwebRecord({
  emit (event) {
    console.log('[rrweb-event]', event)
  }
})

window.stopRrweb = stopFn
