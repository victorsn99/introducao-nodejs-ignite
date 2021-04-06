const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { format, formatISO } = require('date-fns');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (username === "" | username === undefined){
    return response.status(404).json({ error: "Insira um nome de usuário." });
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Usuário inexistente." });
  } else {
    request.user = user;
    return next();
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.find(user => user.username === username);

  if (userAlreadyExist){ 
    return response.status(400).json({ error: "Este nome de usuário já está em uso. Escolha outro." });
  }

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json( user.todos );
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title, 
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Este To-Do não existe." });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Este To-Do não existe." });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return response.status(404).json({ error: "Este To-Do não existe." });
  }

  user.todos.splice(index, 1);

  return response.status(204);
});

module.exports = app;