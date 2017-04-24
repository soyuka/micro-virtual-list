Micro Virtual List
==================

Virtual lists with customizable heights on each elements.

Usually on virtual list libraries you have to specify a fixed height. This module allows you to specify a height per row.

## Installation

```
npm install micro-virtual-list --save
```

## Usage

### Simple

```javascript
const container = document.getElementById('my-list')
MicroVirtualList(container, {
  height: 700, // desired container height
  total: 10000, // total number of rows
  itemHeight: 70, // a row height
  bounce: 10, // default bounce timeout for scroll event, usefull for free wheel mouse for example
  getRow: (i) => {
    const el = document.createElement('div')
    el.innerText = 'Row: ' + i
    return el
  }
})
```

### Dynamic heights

```javascript
const container = document.getElementById('foo')
const total = 10000
const itemHeight = 70 // must be the Max height for better results (Math.max.apply(null, heightsArray))

// random heights
const heights = new Array(total).fill(0).map((e) => Math.floor(Math.random() * (20 - 70) + 70))

MicroVirtualList(container, {
  total: total,
  itemHeight: itemHeight,
  height: 400,
  getRow: (i) => {
    const el = document.createElement('tbody')
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    td.innerText = 'Row: ' + i + ' ( '+heights[i]+'px )'

    tr.appendChild(td)
    el.appendChild(tr)

    return {element: el, height: heights[i]}
  }
})
```

### Public methods

```javascript
const virtualList = MicroVirtualList(container, {total: 100, height: 400, itemHeight: 200, getRow: (i) => {
  let el = document.createElement('div')
  el.innerText = 'Row: ' + i
  return el
}})


window.onresize = function() {
  virtualList.setContainerHeight(600)
  virtualList.refresh()
}
```

You can also use `virtualList.destroy()` (internally executes `cancelAnimationFrame`)

## References

- https://github.com/tbranyen/hyperlist
- https://github.com/sergi/virtual-list

