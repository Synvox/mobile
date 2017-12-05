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
    // `M ${0},${height+100}`,
    `M ${points[0].x},${points[0].y}`,
    points.reduce((str, {x,y})=>`${str}L${x},${y}`,''),
    // `L ${width+10},${points[points.length-1].y}`,
    // `L ${width+10},${height+100}`
  ].join('')
}
