const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Create a test version of the app
function createTestApp() {
  const app = express();
  app.use(bodyParser.json());

  // In-memory data stores (fresh copy for each test)
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
  app.get('/api/users', (req, res) => {
    res.json({ success: true, data: users });
  });

  app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  });

  app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const newUser = { id: nextUserId++, name, email };
    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
  });

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
  app.get('/api/posts', (req, res) => {
    res.json({ success: true, data: posts });
  });

  app.get('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  });

  app.post('/api/posts', (req, res) => {
    const { title, content, userId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const newPost = { id: nextPostId++, title, content, userId: userId || null };
    posts.push(newPost);
    res.status(201).json({ success: true, data: newPost });
  });

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

  app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    posts.splice(index, 1);
    res.json({ success: true, message: 'Post deleted successfully' });
  });

  return app;
}

describe('Backend API Tests - Users', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // GET /api/users
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('John Doe');
    });
  });

  // GET /api/users/:id
  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      const res = await request(app).get('/api/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.name).toBe('John Doe');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });

  // POST /api/users
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Bob Wilson', email: 'bob@example.com' });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Bob Wilson');
      expect(res.body.data.email).toBe('bob@example.com');
      expect(res.body.data.id).toBe(3);
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // PUT /api/users/:id
  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .send({ name: 'John Updated' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Updated');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/api/users/999')
        .send({ name: 'Nobody' });
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // DELETE /api/users/:id
  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const res = await request(app).delete('/api/users/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).delete('/api/users/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('Backend API Tests - Posts', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // GET /api/posts
  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].title).toBe('First Post');
    });
  });

  // GET /api/posts/:id
  describe('GET /api/posts/:id', () => {
    it('should return a post by ID', async () => {
      const res = await request(app).get('/api/posts/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.title).toBe('First Post');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/api/posts/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // POST /api/posts
  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: 'New Post', content: 'New Content', userId: 1 });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Post');
      expect(res.body.data.content).toBe('New Content');
      expect(res.body.data.id).toBe(3);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Some content' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if content is missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: 'Some title' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // PUT /api/posts/:id
  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      const res = await request(app)
        .put('/api/posts/1')
        .send({ title: 'Updated Title' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .put('/api/posts/999')
        .send({ title: 'Nothing' });
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // DELETE /api/posts/:id
  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const res = await request(app).delete('/api/posts/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Post deleted successfully');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).delete('/api/posts/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
