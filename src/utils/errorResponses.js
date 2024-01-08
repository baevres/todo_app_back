const badRequest = (reply, headers, err) => {
  return reply.status(400).headers(headers).send({
    message: 'Invalid data',
    reason: 'Bad request',
    error: err,
    type: 'error',
  })
}

const unauthorized = (reply, headers, message) => {
  return reply.status(401).headers(headers).send({
    message,
    reason: 'Unauthorized',
    type: 'error',
  })
}

const notFound = (reply, headers, message) => {
  return reply.status(404).headers(headers).send({
    message,
    reason: 'Not found',
    type: 'error',
  })
}

const serverError = (reply, headers, error) => {
  return reply.status(500).headers(headers).send({
    message: 'Internal Server Error',
    reason: 'ServerError',
    type: 'error',
    error,
  })
}

export { badRequest, unauthorized, notFound, serverError }
