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
