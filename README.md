**Todo App API**

This is a straightforward Todo API service that allows you to manage your tasks.

**Updates**

_Stage 2_:
* added Fastify server
* added TypeORM
* added validation
* updated endpoints
* updated response data
* code refactor

**API endpoints**

_tasks_: 

GET:

/api/todo{query} - get all tasks, query - checked=bool

/api/todo/{id} - get a specific task

POST:

/api/todo - create a new task

PUT:

/api/todo - update a list of tasks

/api/todo/{id} - update a specific task

DELETE:

/api/todo/{id} - delete a specific task

***
_users_:

GET:

/api/user/{id} - get a specific user

/api/user{query} - check if {query} data is already present in DB

POST:

/api/user/create - create a new user

/api/user/auth - authenticate user and get new tokens

/api/user/auth/refresh - refresh access token

/api/user/logout - delete all refresh tokens

**Features**
1. Add, edit, and delete tasks
2. Tasks filtering by status
3. User creation
4. User authorization
5. Access to the service by JWT token
6. Tasks are stored in PostgreSQL

**Installation**
1. Clone this repository to your local machine.
2. Open the project folder in your code editor.
3. Install dependecies
4. Install PostgreSQL Server
5. Create _todoDB_ database
6. Download _.env_ and _ormconfig.json_ files
7. Execute command in terminal - _npx typeorm migration:run_

**Usage**

1. Open the terminal and execute the command "npm start"
2. Create your user and login
3. Use the endpoints for managing your tasks

**Development**
If you want to make changes or contribute to this project, follow these steps:
1. Install the project dependencies using npm install.
2. Open the terminal and execute the command "npm start"
