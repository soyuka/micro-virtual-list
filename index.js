const Microframe = require('microframe')
const NanoBounce = require('nanobounce')

function MicroVirtualList(container, config) {
  const total = config.total
  const frame = Microframe()
  const bounce = NanoBounce(config.bounce === undefined ? 10 : config.bounce)

  // Our shadow element to show a correct scroll bar
  const scroller = document.createElement('tr');

  // Cache heights
  const heights = new Array(total).fill(0).map((e, i) => {
    let row = config.getRow(i)

    if (row.height !== undefined) {
      return row.height
    }

    return config.itemHeight
  })

  // Compute positions
  const positions = new Array(total).fill(0)

  computePositions()

  // Scroll height
  const scrollHeight = computeScrollHeight()

  // Visible elements
  const averageHeight = scrollHeight / total
  let visibleCache

  setContainerHeight(config.height)

  // stores the last scrollTop
  let lastRepaint

  onscroll()
  container.addEventListener('scroll', onscroll)

  function setContainerHeight(height) {
    visibleCache = Math.ceil(height / averageHeight) * 3
    // Set up container, block display has to be forced on tables
    container.setAttribute('style', `width:100%;height:${height}px;overflow:auto;position:relative;padding:0;display:block;`)
  }

  function computeScrollHeight() {
    const scrollHeight = heights.reduce((a, b) => a + b, 0)

    scroller.setAttribute('style', `opacity:0;position:absolute;width:1px;height:${scrollHeight}px;`)

    return scrollHeight
  }

  function computePositions(from = 1) {
    if (from < 1) {
      from = 1
    }

    for (let i = from; i < total; i++) {
      positions[i] = heights[i - 1] + positions[i - 1]
    }
  }

  // Get the index we start from
  function getFrom() {
    const scrollTop = container.scrollTop
    let i = 0

    while (positions[i] < scrollTop) {
      i++
    }

    return i
  }

  // Render elements
  function render() {
    const scrollTop = container.scrollTop

    if (lastRepaint === scrollTop) {
      return
    }

    let from = getFrom() - 1
    from = from < 0 ? 0 : from

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

      element.setAttribute('style', `
        ${element.style.cssText || ''}
        position: absolute;
        top: ${top}px;
      `)

      fragment.appendChild(element)
    }

    lastRepaint = scrollTop

    container.innerHTML = ''
    container.appendChild(fragment)
  }

  function onscroll() {
    bounce(function() {
      frame(render)
    })
  }

  function destroy() {
    container.removeEventListener('scroll', onscroll)
  }

  return {
    destroy: destroy,
    refresh: render,
    setContainerHeight: setContainerHeight
  }
}

module.exports = MicroVirtualList
