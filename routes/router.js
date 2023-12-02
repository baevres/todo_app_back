import todoRoute from './todoRoute/todoRoute.js'
import usersRoute from './usersRoute/usersRoute.js'

const router = async (req, res) => {
  const todoUrl = '/todo'
  const userUrl = '/user'
  if (req.url.indexOf(todoUrl) > -1) {
    const data = await todoRoute(req, res)
    return data
  } else if (req.url.indexOf(userUrl) > -1) {
    const data = await usersRoute(req, res)
    return data
  }
}

export default router
