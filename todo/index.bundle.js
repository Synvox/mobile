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
const dom = require('/shared/dom.js')
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
  const {header, main, div, input, form} = dom
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
  const {input, label, form} = dom
  return form({class: 'todo'},label(
    input({type:'checkbox', required: true, checked: finished, onclick:toggleTodo(id)}),
    text
  ))
}

const app = document.querySelector('.app')

const rebuild = ()=>{
  while(app.firstChild)
    app.removeChild(app.firstChild)
  app.appendChild(render())
}

rebuild()

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

}
});