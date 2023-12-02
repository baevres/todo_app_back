import TodoModel from '../../models/todoModel/todoModel.js'

const todoModel = new TodoModel()

const todoRoute = async (req, res) => {
  const {
    getTodo,
    getTodoAll,
    createTodo,
    updateTodo,
    deleteTodo,
    updateMultipleTodos,
    notFound,
  } = todoModel
  const url = req.url
  switch (req.method) {
    case 'GET':
      if (/todo\/\d+$/.test(url)) return await getTodo(req, res)
      else if (/todo(\?.*)?$/.test(url)) return await getTodoAll(req, res)
    case 'POST':
      if (/todo$/.test(url)) {
        return await createTodo(req, res)
      }
    case 'PUT':
      if (/todo\/\d+$/.test(url)) return await updateTodo(req, res)
      else if (/todo$/.test(url)) return await updateMultipleTodos(req, res)
    case 'DELETE':
      if (/todo\/\d+$/.test(url)) return await deleteTodo(req, res)
    default:
      return notFound()
  }
}

export default todoRoute
