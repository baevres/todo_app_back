import errorResponseSchema from './errorResponseSchema.js'

const responseSchema = {
  response: {
    '2xx': {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'array',
        },
      },
    },
    ...errorResponseSchema,
  },
}

const headersSchema = {
  headers: {
    type: 'object',
    required: ['Authorization'],
    properties: {
      Authorization: { type: 'string' },
    },
  },
}

const getTodosSchema = {
  querystring: {
    type: 'object',
    properties: {
      checked: { type: 'boolean' },
    },
  },
  ...headersSchema,
  ...responseSchema,
}

const getTodoByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer' },
    },
  },
  ...headersSchema,
  ...responseSchema,
}

const createTodoSchema = {
  body: {
    type: 'object',
    required: ['title', 'checked'],
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        if: {
          properties: { title: { const: 1 } },
        },
        then: {
          pattern: process.env.NOT_EMPTY_PATTERN,
        },
      },
      checked: { type: 'boolean' },
    },
  },
  ...headersSchema,
  ...responseSchema,
}

const editManyTodosSchema = {
  body: {
    type: 'array',
    properties: {
      items: {
        type: 'object',
        required: ['id', 'checked'],
        properties: {
          id: { type: 'integer' },
          checked: { type: 'boolean' },
        },
      },
    },
  },
  ...headersSchema,
  ...responseSchema,
}

const editOrDeleteTodoSchema = {
  body: {
    type: 'object',
    required: ['id', 'title', 'checked'],
    properties: {
      id: { type: 'integer' },
      title: {
        type: 'string',
        minLength: 1,
        if: {
          properties: { title: { const: 1 } },
        },
        then: {
          pattern: process.env.NOT_EMPTY_PATTERN,
        },
      },
      checked: { type: 'boolean' },
    },
  },
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer' },
    },
  },
  ...headersSchema,
  ...responseSchema,
}

export {
  getTodosSchema,
  getTodoByIdSchema,
  createTodoSchema,
  editManyTodosSchema,
  editOrDeleteTodoSchema,
}
