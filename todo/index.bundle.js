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

require('/todo/index.js')

})({
"/todo/index.js":(module, require)=>{
const storage = require('/shared/storage.js')
const {factory, assign} = require('/shared/dom.js')
const db = storage.open('localstorage-todos')
const Todos = db.model('todos')

const createTodo = (e)=>{
  e.preventDefault()
  const text = e.target.querySelector('input[type="text"]').value
  const todo = Todos.create({finished: false, text})
  todo.save()
  rebuild()
}

const toggleTodo = (id)=>(e)=>{
  e.preventDefault()
  const todo = Todos.get(id)
  todo.finished = !todo.finished
  todo.save()
  rebuild()
}

const render = ()=>{
  const {header, main, div, input, form} = factory
  const todos = Todos.find()
  return div(
    header('To-do'),
    main(
      div(
        todos.map(TodoView)
      ),
      form({onsubmit: createTodo},
        input({type: 'text', placeholder: 'Create a new To-do item', name: 'text'}),
        input({type: 'submit', style:'display: none'})
      )
    )
  )
}

const TodoView = ({id, finished, text})=>{
  const {input, label, form} = factory
  return form({class: 'todo', key: id},label(
    input({type:'checkbox', required: true, checked: finished, onclick:toggleTodo(id)}),
    text
  ))
}

const app = document.querySelector('.app')
const root = render()
app.appendChild(root)

const rebuild = ()=>assign(root, render())

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

}
});