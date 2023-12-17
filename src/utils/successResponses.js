const successResponse = (reply, status, headers, data = {}) => {
  const content = {
    content: data,
  }
  return reply.status(status).headers(headers).send(content)
}

export default successResponse
