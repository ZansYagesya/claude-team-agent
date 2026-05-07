const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// In-memory data stores
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

let posts = [
  { id: 1, title: 'First Post', content: 'Hello World', userId: 1 },
  { id: 2, title: 'Second Post', content: 'Getting started', userId: 2 }
];

let nextUserId = 3;
let nextPostId = 3;

// User routes

// GET /api/users - Get all users
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

// POST /api/users - Create new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }
  const newUser = { id: nextUserId++, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  res.json({ success: true, data: user });
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  users.splice(index, 1);
  res.json({ success: true, message: 'User deleted successfully' });
});

// Post routes

// GET /api/posts - Get all posts
app.get('/api/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

// GET /api/posts/:id - Get post by ID
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  res.json({ success: true, data: post });
});

// POST /api/posts - Create new post
app.post('/api/posts', (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  const newPost = { id: nextPostId++, title, content, userId: userId || null };
  posts.push(newPost);
  res.status(201).json({ success: true, data: newPost });
});

// PUT /api/posts/:id - Update post
app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const { title, content, userId } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (userId !== undefined) post.userId = userId;
  res.json({ success: true, data: post });
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  posts.splice(index, 1);
  res.json({ success: true, message: 'Post deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
