import UsersModel from '../../models/usersModel/usersModel.js'

const usersModel = new UsersModel()

const usersRoute = async (req, res) => {
  const {
    getUser,
    getUsersUniqueData,
    authUser,
    refreshToken,
    createUser,
    notFound,
  } = usersModel
  const url = req.url
  switch (req.method) {
    case 'GET':
      if (/user\/\d+$/.test(url)) return await getUser(req, res)
      else if (/user(\?.*)?$/.test(url))
        return await getUsersUniqueData(req, res)
    case 'POST':
      if (/user\/create$/.test(url)) return await createUser(req, res)
      else if (/user\/auth$/.test(url)) return await authUser(req, res)
      else if (/user\/auth\/refresh$/.test(url))
        return await refreshToken(req, res)
    default:
      return notFound()
  }
}

export default usersRoute
