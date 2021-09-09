const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(
    (user) => user.username === username
  );

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists..." })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if (!title || !deadline) {
    return response.status(400).json({ error: "Title and deadline are mandatory!" })
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  if (!title && !deadline) {
    return response.status(404).json({ error: "Mandatory change: title or deadline!" })
  }

  const userId = user.todos.find(
    (userId) => userId.id === id
  )

  if (!userId) {
    return response.status(404).json({ error: "Todo id not found..." });
  }

  if (title) {
    userId.title = title;
  }

  if (deadline) {
    userId.deadline = new Date(deadline);
  }

  return response.json(userId);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userId = user.todos.find(
    (userId) => userId.id === id
  )

  if (!userId) {
    return response.status(404).json({ error: "Todo id not found..." });
  }

  userId.done = true;

  return response.json(userId);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const userId = user.todos.find(
    (userId) => userId.id === id
  )

  if (!userId) {
    return response.status(404).json({ error: "Todo id not found..." });
  }

  user.todos.splice(userId, 1);

  return response.status(204).json();

});

module.exports = app;