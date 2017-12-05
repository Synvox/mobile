// This is a generated file.
;((modules)=>{

const instances = {}
const require = (key)=>{
  if (instances[key])
    return instances[key].exports

  const module = {exports:{}}
  modules[key](module, require)
  instances[key] = module
  return module.exports
}

require('/stocks/index.js')

})({
"/stocks/index.js":(module, require)=>{
const storage = require('/shared/storage.js')
const { factory, svgFactory, assign } = require('/shared/dom.js')
const getSymbols = require('/stocks/getSymbols.js')
const getPath = require('/stocks/getPath.js')
const db = storage.open('localstorage-stocks')
const Stock = db.model('stock')

const symbols = [{
  symbol: 'AMZN',
  name: 'Amazon.com Inc'
}, {
  symbol: 'GOOG',
  name: 'Alphabet Inc'
}, {
  symbol: 'AAPL',
  name: 'Apple Inc'
}, {
  symbol: 'FDX',
  name: 'FedEx Corporation'
}, {
  symbol: 'F',
  name: 'Ford Motor'
}, {
  symbol: 'LMT',
  name: 'Lockheed Martin Corp.'
}, {
  symbol: 'MCD',
  name: 'McDonald\'s Corp.'
}, {
  symbol: 'MSFT',
  name: 'Microsoft Corp.'
}, {
  symbol: 'NFLX',
  name: 'Netflix Inc.'
}, {
  symbol: 'ORCL',
  name: 'Oracle Corp.'
}, {
  symbol: 'PYPL',
  name: 'PayPal'
}, {
  symbol: 'CRM',
  name: 'Salesforce.com'
}]

getSymbols(symbols)
  .then(data => data.forEach((s) => Stock.create(s).save()))
  .then(() => {
    state.set({
      stocks: Stock.find().reduce((obj, stock) => Object.assign(obj, { [stock.id]: stock }), {})
    })
  })

const state = (() => {
  const state = {}
  return {
    get: () => state,
    set: s => {
      Object.assign(state, s)
      rebuild()
    }
  }
})()

function render() {
  const { div, header } = factory
  const {
    currentSymbol,
    stocks,
    tabIndex
  } = state.get()

  if (!stocks || !stocks[currentSymbol])
    return div(div({class: 'spinner'}))
    
  const { deltas, price } = stocks[currentSymbol]
  const change = deltas[tabIndex]

  return div({ class: `stock ${change.class}` },
    div(stockHeader()),
    div(stockBody()),
    div(stockFooter())
  )
}

function stockHeader() {
  const { div, span, h1, a } = factory
  const {
    currentSymbol,
    stocks,
    tabIndex,
    nameAnim
  } = state.get()

  if (!stocks || !stocks[currentSymbol]) return

  const { deltas, price, name } = stocks[currentSymbol]
  const change = deltas[tabIndex]

  return div({ class: 'stock-header' },
    h1({ class: nameAnim ? 'anim' : '' }, name),
    div({ class: `closing-price ${nameAnim ? 'anim' : ''}` },
      span({ class: 'dollar' }, '$'),
      price.toFixed(2)
    ),
    div({ class: 'deltas' }, span(change.delta), span(change.percent)),
    div({ class: 'links' },
      a({ href: '#3m', onclick: () => state.set({ tabIndex: 2 }), class: tabIndex === 2 ? 'active' : '' }, '3 month'),
      a({ href: '#1m', onclick: () => state.set({ tabIndex: 1 }), class: tabIndex === 1 ? 'active' : '' }, '1 month'),
      a({ href: '#1d', onclick: () => state.set({ tabIndex: 0 }), class: tabIndex === 0 ? 'active' : '' }, '1 day')
    )
  )
}

function stockBody() {
  const { div, h1 } = factory
  const { svg, path, rect } = svgFactory

  const {
    currentSymbol,
    stocks,
    tabIndex
  } = state.get()

  if (!stocks || !stocks[currentSymbol]) return

  const sliceAmount = [2, 30, 90][tabIndex]


  return div({
    class: 'stock-body'
  }, svg({
    viewBox: '-20 -20 410 240',
    width: '100%',
    height: '100%'
  }, path({
    d: 'M0,25L370,25',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,50L370,50',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,75L370,75',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,100L370,100',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,125L370,125',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,150L370,150',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    d: 'M0,175L370,175',
    stroke: 'rgba(255,255,255,.05)',
    'stroke-width': '1px',
    fill: 'none'
  }), path({
    class: 'stock-path',
    d: getPath({
      min: stocks[currentSymbol].min,
      max: stocks[currentSymbol].max,
      data: stocks[currentSymbol].data.slice(-sliceAmount)
    }, 'price'),
    'stroke-width': '2px',
    fill: 'transparent',
    style: 'stroke: var(--stock-color)'
  }))
  )
}


let headerAnimTimeout = null
function stockFooter() {
  const { div } = factory
  const {
    currentSymbol,
    stocks,
    tabIndex
  } = state.get()

  if (!stocks || !stocks[currentSymbol]) return


  return div({
    class: 'stock-footer'
  },
    ...symbols.map(({ symbol }, index) => {
      const { deltas, price, name } = stocks[symbol]
      const change = deltas[tabIndex]

      return div({
        class: `item ${change.class} ${symbol === currentSymbol ? 'active' : ''}`,
        onclick: () => {
          state.set({
            currentSymbol: symbol,
            nameAnim: true
          })

          window.clearTimeout(headerAnimTimeout)
          headerAnimTimeout = window.setTimeout(() => {
            state.set({
              nameAnim: false
            })
          }, 1000)

        }
      }, `${symbol} (${change.percent})`)
    })
  )
}

const app = document.querySelector('.app')
const rebuild = () => assign(root, render())
const root = render()

state.set({
  tabIndex: 2,
  currentSymbol: symbols[1].symbol,
  stocks: Stock.find().reduce((obj, stock) => Object.assign(obj, { [stock.id]: stock }), {})
})

app.appendChild(root)

},
"/shared/storage.js":(module, require)=>{
const genId = (
  type,
  hash=(
    Date.now().toString(36)
    + Math.abs(
      Math.random().toString().split('').reduce((p,c)=>(p<<5)-p+c,'')
    ).toString(36).substr(0,11)).toLowerCase()
)=>`${type}→${hash}`

class Storage {
  constructor(adapter) {
    this.adapter = adapter
    this.openDBs = {}
  }
  open(dbName) {
    if (this.openDBs[dbName])
      return this.openDBs[dbName]

    const db = new Database(this.adapter, dbName)
    this.openDBs[dbName] = db

    return db
  }
}

class Database {
  constructor(adapter, name) {
    this.adapter = adapter
    this.name = name
  }
  get(type, id) {
    return this.adapter.get(`${this.name}→${type}→${id}`)
  }
  put(type, id, value) {
    this.adapter.set(`${this.name}→${type}→${id}`,
                     Object.assign({}, value, {id}))
  }
  delete(type, id) {
    this.adapter.delete(`${this.name}→${type}→${id}`)
  }
  keys(id) {
    return this.adapter.keys()
      .filter(key=>key.startsWith(`${this.name}→`))
      .map(key=>key.slice(this.name.length+1))
  }
  model(name, cast=x=>x) {
    return new Model(this, name, cast)
  }
  query(keys, filter) {

  }
}

class Model {
  constructor(database, name, cast) {
    this.database = database
    this.name = name
    this.cast = cast
  }
  create(data={}) {
    return new Instance(this, this.cast(Object.assign({},{
      id: genId(this.name)
    }, data)))
  }
  save(data) {
    const id = data.id || genId(this.name)
    this.database.put(this.name, id, data)
  }
  get(id) {
    return new Instance(this, this.cast(this.database.get(this.name, id)))
  }
  keys() {
    return this.database.keys()
      .filter(key=>key.startsWith(`${this.name}→`))
      .map(key=>key.slice(this.name.length+1))
  }
  find(filter=()=>true) {
    if (typeof filter === 'object') {
      const frame = filter
      filter = (item)=>Object.keys(frame).some(key=>frame[key] === item[key])
    }

    return this.keys()
      .map(key=>this.database.get(this.name, key))
      .filter(filter)
  }
}

class Instance {
  constructor(model, data) {
    this.model = model
    this.dataValues = data
    Object.defineProperties(this, Object.keys(data).map((key)=>({key, value: {
      get: ()=>this.get(key),
      set: (value)=>this.set(key, value),
      enumerable: true,
      configurable: false
    }})).reduce((obj, {key, value})=>Object.assign(obj, {[key]: value}), {}))
  }
  save() {
    this.model.save(this.dataValues)
  }
  get(key) {
    return this.dataValues[key]
  }
  set(key, value) {
    this.dataValues[key] = value
  }
}

const local = new Storage({
  keys: ()=>Object.keys(localStorage),
  get: key=>JSON.parse(localStorage.getItem(key)),
  set: (key, value)=>localStorage.setItem(key, JSON.stringify(value)),
  delete: key=>delete localStorage[key]
})

module.exports = local

},
"/shared/dom.js":(module, require)=>{
const EVENTS = Object.keys(Object.getOwnPropertyDescriptors(HTMLElement).prototype.value).filter(k=>k.startsWith('on'))

const createNode = (nodeName, isSVG, ...children)=>{
  const node = isSVG
    ? document.createElementNS('http://www.w3.org/2000/svg',nodeName)
    : document.createElement(nodeName)

  const attributes = typeof children[0] ===  'object' && !(children[0] instanceof Node) && !Array.isArray(children[0])
    ? children.shift()
    : null

  if (attributes) {
    for(let key in attributes) {
      const value = attributes[key]
      node[key] = value
      if (typeof value !== 'function' && value !== false)
        isSVG
        ? node.setAttributeNS(null, key, value === true ? '' : value)
        : node.setAttribute(key, value === true ? '' : value)
    }
  }

  children
    .reduce((a, b)=>a.concat(b), [])
    .filter(x=>x != null)
    .map((child)=>(
      typeof child !== 'object'
        ? document.createTextNode(child)
        : child
    ))
    .forEach(child=>node.appendChild(child))

  return node
}

const factory = new Proxy({},{
  get: (obj, prop)=>
    (...children)=>
      createNode(prop, false, ...children)
})

const svgFactory = new Proxy({},{
  get: (obj, prop)=>
    (...children)=>
      createNode(prop, true, ...children)
})

const assign = (oldNode, newNode)=>{
  if (!oldNode) return newNode
  assignAttributes(oldNode, newNode)
  assignChildren(oldNode, newNode)
}

const assignAttributes = (oldNode, newNode)=>{
  if (oldNode.nodeType === Node.TEXT_NODE) return
  const newAttributes = Array.from(newNode.attributes).map(a=>a.name)
  Array.from(oldNode.attributes)
    .map(a=>a.name)
    .filter(a=>!newAttributes.includes(a))
    .forEach(a=>oldNode.removeAttribute(a))

  newAttributes.forEach(a=>{
    if (oldNode.getAttribute(a) !== newNode.getAttribute(a)) {
      oldNode.setAttribute(a, newNode.getAttribute(a))
    }
  })

  EVENTS.forEach(name=>(
    oldNode[name] !== newNode[name]
    && (oldNode[name] = newNode[name])
  ))

  window.requestAnimationFrame(()=>{
    // @TODO research this.
    // For whatever reason, fixing input values doesn't
    // work until the next frame.
    if (oldNode.nodeName === 'INPUT') {
      const attr = {
        'checkbox': 'checked'
      }[oldNode.type] || 'value'

      if (oldNode[attr] !== newNode[attr]) {
        oldNode[attr] = newNode[attr]
      }
    }
  })
}

const assignChildren = (oldNode, newNode)=>{
  if (oldNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.textContent !== newNode.textContent)
      oldNode.textContent = newNode.textContent
    return
  }

  const length = Math.max(oldNode.childNodes.length, newNode.childNodes.length)
  let index = 0
  let offset = 0

  while(index < length) {
    const oldChild = oldNode.childNodes[index]
    const newChild = newNode.childNodes[index-offset]
    if (!oldChild && !newChild) break
    if (!newChild) {
      oldNode.removeChild(oldChild)
      index--
    } else if (!oldChild) {
      oldNode.appendChild(newChild)
      offset++
    } else if (isSameNode(oldChild, newChild)) {
      assign(oldChild, newChild)
    } else {
      let match = null
      for (let cursor = index; cursor < oldNode.childNodes.length; cursor++) {
        if (isSameNode(oldNode.childNodes[cursor], newChild)) {
          oldMatch = oldNode.childNodes[cursor]
          break
        }
      }

      if (match) {
        assign(match, newChild)
        oldNode.insertBefore(match, oldChild)
      } else if (!oldChild.id && !newChild.id) {
        assign(oldChild, newChild)
      } else {
        oldNode.insertBefore(newChild, oldChild)
        offset++
      }
    }

    index++
  }
}

const isSameNode = (a, b)=>{
  if (a.id === b.id) return true
  if (a.nodeType === Node.TEXT_NODE) return a.textContent === b.textContent
  if (a.getAttribute('key') && a.getAttribute('key') === b.getAttribute('key')) return true
  return false
}

module.exports = {
  factory,
  assign,
  svgFactory
}

},
"/stocks/getSymbols.js":(module, require)=>{
module.exports = (symbols) => Promise.all(symbols.map(({symbol}, index) =>
  fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=LCIR3TDZXZ5K8JJV`)
    .then(r => r.json())
    .then(x => x['Time Series (Daily)'])
    .then(x => {
      const data = Object.keys(x).map((time) => ({
        timestamp: '' + new Date(time),
        price: +x[time]['4. close'],
        high: +x[time]['2. high'],
        low: +x[time]['3. low'],
        open: +x[time]['1. open'],
        volume: +x[time]['5. volume']
      }))

      const max = Math.max(...data.map(d => d.price))
      const min = Math.min(...data.map(d => d.price))

      const day = calcDelta(data.slice(-2))
      const month = calcDelta(data.slice(-30))
      const month3 = calcDelta(data.slice(-90))

      return {
        id: symbol,
        name: symbols[index].name,
        data,
        price: data[data.length-1].price,
        max,
        min,
        deltas: [day, month, month3]
      }
    })
))

function calcDelta(data) {
  const delta = data[0].price - data[data.length - 1].price
  const percent = (delta / data[data.length - 1].price) * 100
  return {
    class: delta >= 0 ? 'up' : 'down',
    delta: (delta >= 0 ? '+$' : '-$')+Math.abs(delta).toFixed(2),
    percent: (percent >= 0 ? '+' : '-') + (Math.abs(percent)).toFixed(2) + '%'
  }
}

},
"/stocks/getPath.js":(module, require)=>{
module.exports = ({max, min, data}, key)=>{
  const width = 370
  const height = 180
  const padding = 10

  const reduced = data
    .map(obj=>obj[key])

  const points = reduced
    .map((price, index)=>({
      x: index / (reduced.length-1),
      y: (price - min)/(max - min)
    }))
    .map(({x, y})=>({
      x: (padding + x * (width - padding)).toFixed(2),
      y: (padding + y * (height - padding)).toFixed(2)
    }))

  return [
    `M ${points[0].x},${points[0].y}`,
    points.reduce((str, {x,y})=>`${str}L${x},${y}`,''),
  ].join('')
}

}
});