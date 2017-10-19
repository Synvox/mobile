const createNode = (nodeName, ...children)=>{
  const node = document.createElement(nodeName)
  const attributes = typeof children[0] ===  'object' && !(children[0] instanceof Node) && !Array.isArray(children[0])
    ? children.shift()
    : null

  if (attributes) {
    for(let key in attributes) {
      const value = attributes[key]
      if (typeof value === 'function')
        node[key] = value
      else if (value !== false)
        node.setAttribute(key, value)
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
      createNode(prop, ...children)
})

module.exports = factory
