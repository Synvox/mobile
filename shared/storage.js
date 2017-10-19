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
