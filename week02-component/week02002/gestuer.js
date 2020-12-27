function enableGesture(main) {
    let start = (point, context) => {
      context.startX = point.clientX
      context.startY = point.clientY
      context.startTime = Date.now()

      context.isTap = true
      context.isPan = false
      context.isPress = false
      context.pressHandler = setTimeout(() => {
        context.isPress = true
        context.isTap = false
        let e = new Event('pressstart')
        main.dispatchEvent(e)
        context.pressHandler = null
      },500)


    }
    let move = (point, context) => {
      let dx = point.clientX - context.startX,
        dy = point.clientY - context.startY
      if (dx * dx + dy * dy > 100) {
        if(context.pressHandler !== null){
          clearTimeout(context.pressHandler)
          context.pressHandler = null
          context.isPress = false
        }else if(context.isPress){
          context.isPress = false
          let e = new Event('presscancel')
          main.dispatchEvent(e)
        }
        context.isTap = false
        if (context.isPan == false) {
          if(Math.abs(dx) > Math.abs(dy)){
            context.isVertical = false
            context.isHorizontal = true
          }else{
            context.isVertical = true
            context.isHorizontal = false
          }
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
        e.isVertical = context.isVertical
        e.isHorizontal = context.isHorizontal
        main.dispatchEvent(e)
      }
    }
    let end = (point, context) => {
      if(context.pressHandler !== null){
        clearTimeout(context.pressHandler)
      }

      if (context.isPress) {
        let e = new Event('pressend')
        main.dispatchEvent(e)
      }
      if (context.isTap) {
        let e = new Event('tap')
        main.dispatchEvent(e)
      }
      let dx = point.clientX - context.startX,
        dy = point.clientY - context.startY
      let v = Math.sqrt(dx * dx + dy * dy) / (Date.now() - context.startTime) 
      if (context.isPan &&  v > 0.3) {
        let e = new Event('flick')
        e.dx = dx
        e.dy = dy
        context.isFlick = true
        main.dispatchEvent(e)
      }else{
        context.isFlick = false
      }
      if (context.isPan) {
        let dx = point.clientX - context.startX,
          dy = point.clientY - context.startY
        let e = new Event('panend')
        e.dx = dx
        e.dy = dy
        e.isFlick = context.isFlick
        e.isVertical = context.isVertical
        e.isHorizontal = context.isHorizontal
        main.dispatchEvent(e)
      }
    }
    let cancel = (point, context) => {
      if (context.isPan) {
        let e = new Event('pancancel')
        main.dispatchEvent(e)
      }
      if (context.isPress) {
        let e = new Event('presscancel')
        main.dispatchEvent(e)
      }
      if(context.pressHandler !== null){
        let e = new Event('presscancel')
        main.dispatchEvent(e)
        clearTimeout(context.pressHandler)
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
