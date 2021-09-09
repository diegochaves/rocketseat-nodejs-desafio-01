const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUserByUsername(username) {
  return users.find((user) => user.username == username);
}

function getTodoByIdAndUsername(username, todoId) {
  return getUserByUsername(username).todos.find((todo) => todo.id == todoId)
}

function userAlreadyExists(username) {
  return !!getUserByUsername(username);
}

function checksExistsUserAccount(request, response, next) {
  const username = request.header('username');
  if (!username) {
    return response.status(404).json({error: "Usuário não encontrado!"});
  }
    request.username = username;
    next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  if (userAlreadyExists(username)) {
    return response.status(400).json({error: "Usuário Existente."});
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    };
    users.push(user);
    response.status(201).json(user);
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(getUserByUsername(request.username).todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  getUserByUsername(request.username).todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  let todo = getUserByUsername(request.username).todos.find((todo) => todo.id == id);
  if (!todo) {
    return response.status(404).json({error: 'Todo não encontrado!'});
  }
  todo = {
    ...todo,
    title,
    deadline
  };
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  let todo = getUserByUsername(request.username).todos.find((todo) => todo.id == id);
  if (!todo) {
    return response.status(404).json({error: 'Todo não encontrado!'});
  }
  todo.done = !todo.done;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todos = getUserByUsername(request.username).todos;
  const todo = todos.find((todo) => todo.id == id);
  if (!todo) {
    return response.status(404).json({error: 'Todo não encontrado!'});
  }
  todos.splice(todos.indexOf(todo), 1);
  return response.status(204).send();
});

module.exports = app;