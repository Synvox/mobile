const storage = require('../shared/storage.js')
const { factory, svgFactory, assign } = require('../shared/dom.js')
const getSymbols = require('./getSymbols.js')
const getPath = require('./getPath.js')
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
