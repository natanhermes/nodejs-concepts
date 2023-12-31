const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.some(user => user.username === username)

  if (!userAlreadyExists) {
    return response.status(400).json({ error: 'User not found!' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const usernameAlreadyExists = users.some(user => user.username === username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' })
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const user = users.find(user => user.username === username);

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === todoId)

  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).json(todo);
  }

  return response.status(404).json({ error: 'Todo not found!' });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === todoId)

  if (todo) {
    todo.done = true;

    return response.status(200).json(todo);
  }

  return response.status(404).json({ error: 'Todo not found!' });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const user = users.find(user => user.username === username);

  const index = user.todos.findIndex(todo => todo.id === todoId);

  if (index !== -1) {
    user.todos.splice(index, 1);
    return response.status(204).send();
  }

  return response.status(404).json({ error: 'Todo not found!' });
});


module.exports = app;