**Todo App API**

This is a straightforward Todo API service that allows you to manage your tasks.

**API endpoints**

_tasks_: 

GET:

/api/user/todo{query} - get all tasks, query - checked=bool

/api/user/todo/{id} - get a specific task

POST:

/api/user/todo - create a new task

PUT:

/api/user/todo - update a list of tasks

/api/user/todo/{id} - update a specific task

DELETE:

/api/user/todo/{id} - delete a specific task

***
_users_:

GET:

/api/user/{id} - get a specific user

/api/user{query} - check if {query} data is already present in DB

POST:

/api/user/create - create a new user

/api/user/auth - authenticate user and get new tokens

/api/user/auth/refresh - refresh access token

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
5. Execute scripts from _models/models.db_
6. Set secret data into _.env_ file

**Usage**

1. Open the terminal and execute the command "npm start"
2. Create your user and login
3. Use the endpoints for managing your tasks

**Development**
If you want to make changes or contribute to this project, follow these steps:
1. Install the project dependencies using npm install.
2. Open the terminal and execute the command "npm start"
