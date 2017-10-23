const EVENTS = Object.keys(Object.getOwnPropertyDescriptors(HTMLElement).prototype.value).filter(k=>k.startsWith('on'))

const createNode = (nodeName, ...children)=>{
  const node = document.createElement(nodeName)
  const attributes = typeof children[0] ===  'object' && !(children[0] instanceof Node) && !Array.isArray(children[0])
    ? children.shift()
    : null

  if (attributes) {
    for(let key in attributes) {
      const value = attributes[key]
      node[key] = value
      if (typeof value !== 'function' && value !== false)
        node.setAttribute(key, value === true ? '' : value)
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
  if (a.getAttribute('key') && a.getAttribute('key') === b.getAttribute('key')) return true
  if (a.type === Node.TEXT_NODE) return a.textContent === b.textContent
  return false
}

module.exports = {factory, assign}
