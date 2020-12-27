function enableGesture(main) {
    let start = (point, context) => {
      context.startX = point.clientX
      context.startY = point.clientY
      context.isTap = true
      context.isPan = false
    }
    let move = (point, context) => {
      let dx = point.clientX - context.startX,
        dy = point.clientY - context.startY
      if (dx * dx + dy * dy > 100) {
        context.isTap = false
        if (context.isPan == false) {
          let e = new Event('panstart')
          e.startX = context.startX
          e.startY = context.startY
          main.dispatchEvent(e)
          context.isPan = true
        }
      }
      if (context.isPan) {
        let e = new Event('pan')
        e.dx = dx
        e.dy = dy
        main.dispatchEvent(e)
      }
    }
    let end = (point, context) => {
      if (context.isTap) {
        let e = new Event('tap')
        main.dispatchEvent(e)
      }
      if (context.isPan) {
        let dx = point.clientX - context.startX,
          dy = point.clientY - context.startY
        let e = new Event('panend')
        e.dx = dx
        e.dy = dy
        main.dispatchEvent(e)
      }
    }
    let cancel = (point, context) => {
      if (context.isPan) {
        let e = new Event('pancancel')
        main.dispatchEvent(e)
      }
    }
    let contexts = Object.create(null)
    let mouseSymbol = Symbol('mouse') // 鼠标没有 indentifier 用 Symbol 处理

    let mousedown = event => {
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseend)
      contexts[mouseSymbol] = Object.create(null)
      start(event, contexts[mouseSymbol])
    }
    let mousemove = event => {
      move(event, contexts[mouseSymbol])
    }
    let mouseend = event => {
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseend)
      end(event, contexts[mouseSymbol])
      delete contexts[mouseSymbol]
    }
    main.addEventListener('mousedown', mousedown)

    let touchstart = event => {
      for (let touch of event.changedTouches) {
        contexts[touch.indentifier] = Object.create(null)
        start(touch, contexts[touch.indentifier])
      }
    }
    let touchmove = event => {
      for (let touch of event.changedTouches) {
        move(touch, contexts[touch.indentifier])
      }
    }
    let touchend = event => {
      for (let touch of event.changedTouches) {
        end(touch, contexts[touch.indentifier])
        delete contexts[touch.indentifier]
      }
    }
    let touchcancel = event => {
      for (let touch of event.changedTouches) {
        // console.log('touchcancel', touch.clientX, touch.clientY)
      }
    }
    main.addEventListener('touchstart', touchstart)
    main.addEventListener('touchmove', touchmove)
    main.addEventListener('touchend', touchend)
    main.addEventListener('touchcancel', touchcancel)
  }
