const raf = require('raf')

function MicroVirtualList (container, config) {
  let total
  let heights = []
  let positions = []
  let scrollHeight
  let averageHeight
  let visibleCache
  // stores the last scrollTop
  let lastRepaint
  // stores the last "from" index (rendering index start)
  let lastFrom
  let currentAnimationFrameId

  // Our shadow element to show a correct scroll bar
  const scroller = document.createElement('tr')

  initConfig(config)

  // init
  raf(function loop () {
    render()
    currentAnimationFrameId = raf(loop)
  })

  function replaceStyle (element, style) {
    for (let i in style) {
      if (element.style[i] !== style[i]) {
        element.style[i] = style[i]
      }
    }
  }

  function initConfig (config) {
    total = config.total

    const style = {
      height: config.height + 'px',
      overflow: 'auto',
      position: 'relative'
    }

    replaceStyle(container, style)

    if (heights.length !== total) {
      heights = new Array(total).fill(0)

      if (config.preComputeHeights === true) {
        heights.map((e, i) => {
          let row = config.getRow(i)

          if (row.height !== undefined) {
            return row.height
          }

          return config.itemHeight
        })
      }

      positions = new Array(total).fill(0)

      computePositions()

      // Scroll height
      scrollHeight = computeScrollHeight()

      // Visible elements
      averageHeight = scrollHeight / total
    }

    visibleCache = Math.ceil(config.height / averageHeight) * 3
  }

  function computeScrollHeight () {
    const scrollHeight = heights.reduce((a, b) => a + b, 0)
    const style = {
      opacity: 0,
      position: 'absolute',
      width: '1px',
      height: `${scrollHeight}px`
    }

    replaceStyle(scroller, style)

    return scrollHeight
  }

  function computePositions (from = 1) {
    if (from < 1) {
      from = 1
    }

    for (let i = from; i < total; i++) {
      positions[i] = heights[i - 1] + positions[i - 1]
    }
  }

  // Get the index we start from
  function getFrom () {
    const scrollTop = container.scrollTop
    let i = 0

    while (positions[i] < scrollTop) {
      i++
    }

    return i
  }

  // Render elements
  function render () {
    const scrollTop = container.scrollTop

    if (lastRepaint === scrollTop) {
      return
    }

    let from = getFrom() - 1
    from = from < 0 ? 0 : from

    if (lastFrom === from) {
      return
    }

    lastFrom = from

    let to = from + visibleCache
    to = to > total ? total : to

    const fragment = document.createDocumentFragment()
    fragment.appendChild(scroller)

    for (let i = from; i < to; i++) {
      let element = config.getRow(i)

      if (element.height) {
        if (heights[i] !== element.height) {
          heights[i] = element.height
          computePositions(i)
          computeScrollHeight()
        }

        element = element.element
      }

      const top = positions[i]

      replaceStyle(element, {position: 'absolute', 'top': `${top}px`})

      fragment.appendChild(element)
    }

    lastRepaint = scrollTop

    container.innerHTML = ''
    container.appendChild(fragment)
  }

  function destroy () {
    raf.cancel(currentAnimationFrameId)
    container.innerHTML = ''
  }

  return {
    destroy: destroy,
    refresh: function refresh (config) {
      initConfig(config)
      render()
    }
  }
}

module.exports = MicroVirtualList
