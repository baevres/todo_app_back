const errorResponseSchema = {
  '4xx': {
    type: 'object',
    required: ['message', 'reason', 'type'],
    properties: {
      message: { type: 'string' },
      reason: { type: 'string' },
      type: { type: 'string' },
    },
  },
  '5xx': {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
    },
  },
}

export default errorResponseSchema
