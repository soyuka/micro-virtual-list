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
  preComputeHeights: true, // Will call `getRow` on every rows before the first render to find out heights
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
let config = {
  total: 100,
  height: 400,
  itemHeight: 200,
  getRow: (i) => {
    let el = document.createElement('div')
    el.innerText = 'Row: ' + i
    return el
  }
}

const virtualList = MicroVirtualList(container, config)

window.onresize = function() {
  config.height = 500
  virtualList.refresh(config)
}
```

You can also use `virtualList.destroy()` (internally executes `cancelAnimationFrame`)

## References

- https://github.com/tbranyen/hyperlist
- https://github.com/sergi/virtual-list

