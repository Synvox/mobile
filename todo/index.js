const storage = require('../shared/storage.js')
const dom = require('../shared/dom.js')
const db = storage.open('localstorage-todos')
const Todos = db.model('todos')

const createTodo = (e)=>{
  e.preventDefault()
  const text = new FormData(e.target).get('text')
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
  const {header, main, div, input, form, button} = dom
  const todos = Todos.find()
  return div(
    header('To-do'),
    main(
      div(
        todos.map(TodoView)
      ),
      form({onsubmit: createTodo},
        input({type: 'text', placeholder: 'Create a new To-do item', name: 'text'}),
        button({hidden: true})
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
