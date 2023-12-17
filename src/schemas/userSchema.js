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

const getUserByQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      login: { type: 'string' },
      email: { type: 'string' },
    },
  },
  ...responseSchema,
}

const getUserById = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer' },
    },
  },
  ...responseSchema,
}

const createUserSchema = {
  body: {
    type: 'object',
    required: [
      'name',
      'age',
      'link',
      'gender',
      'phone',
      'login',
      'email',
      'password',
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        if: {
          properties: { name: { const: 1 } },
        },
        then: {
          pattern: process.env.NOT_EMPTY_PATTERN,
        },
      },
      age: {
        type: 'integer',
        minimum: 18,
        maximum: 60,
      },
      link: {
        type: 'string',
        pattern: process.env.LINK_PATTERN,
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
      },
      phone: {
        type: 'string',
        pattern: process.env.PHONE_PATTERN,
      },
      login: {
        type: 'string',
        minLength: 1,
        pattern: process.env.NOT_HAVE_WHITESPACES_PATTERN,
      },
      email: {
        type: 'string',
        pattern: process.env.EMAIL_PATTERN,
      },
      password: {
        type: 'string',
        pattern: process.env.PASSWORD_PATTERN,
        minLength: 8,
      },
    },
  },
  ...responseSchema,
}

const authSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        pattern: '[a-z0-9]+@[a-z]+\\.[a-z]{2,3}',
      },
      password: {
        type: 'string',
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])(?!.*\\s)',
        minLength: 8,
      },
    },
  },
  response: {
    ...responseSchema.response,
    200: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'accessToken', 'refreshToken'],
            properties: {
              id: { type: 'integer' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
  },
}

const refreshSchema = {
  response: {
    ...responseSchema.response,
    200: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'array',
          items: {
            type: 'object',
            required: ['accessToken', 'refreshToken'],
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
  },
}

const logoutSchema = {
  response: {
    ...responseSchema.response,
    200: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
}

export {
  getUserByQuerySchema,
  getUserById,
  createUserSchema,
  authSchema,
  refreshSchema,
  logoutSchema,
}
