// Mock the api module before importing components
jest.mock('../frontend/src/api', () => ({
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getPosts: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn()
}));

// Mock react-dom/client to avoid DOM rendering issues
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn(), unmount: jest.fn() }))
}));

// Set up DOM environment
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  jest.clearAllMocks();
});

// Import React Testing Library utilities
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { getUsers, createUser, updateUser, deleteUser, getPosts, createPost, updatePost, deletePost } = require('../frontend/src/api');

// Import components (need to use require due to babel transform)
const UserList = require('../frontend/src/components/UserList').default;
const UserForm = require('../frontend/src/components/UserForm').default;
const PostList = require('../frontend/src/components/PostList').default;
const PostForm = require('../frontend/src/components/PostForm').default;

describe('Frontend Component Tests - UserList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading text initially', () => {
    getUsers.mockResolvedValue({ success: true, data: [] });
    render(UserList({ onEdit: jest.fn() }));
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should render users after loading', async () => {
    getUsers.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    });
    render(UserList({ onEdit: jest.fn() }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show "No users found" when list is empty', async () => {
    getUsers.mockResolvedValue({ success: true, data: [] });
    render(UserList({ onEdit: jest.fn() }));
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  it('should call onEdit when Edit button is clicked', async () => {
    const onEditMock = jest.fn();
    getUsers.mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'John Doe', email: 'john@example.com' }]
    });
    render(UserList({ onEdit: onEditMock }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Edit'));
    expect(onEditMock).toHaveBeenCalledWith({ id: 1, name: 'John Doe', email: 'john@example.com' });
  });

  it('should call deleteUser and refresh when Delete is clicked', async () => {
    getUsers.mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'John Doe', email: 'john@example.com' }]
    });
    deleteUser.mockResolvedValue({ success: true, message: 'User deleted' });
    const getUsersMock = getUsers.mockResolvedValue.bind(getUsers);
    render(UserList({ onEdit: jest.fn() }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete'));
    expect(deleteUser).toHaveBeenCalledWith(1);
  });
});

describe('Frontend Component Tests - UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create user form', () => {
    render(UserForm({ user: null, onSave: jest.fn(), onCancel: jest.fn() }));
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
  });

  it('should render edit user form with pre-filled data', () => {
    const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
    render(UserForm({ user, onSave: jest.fn(), onCancel: jest.fn() }));
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:').value).toBe('John Doe');
    expect(screen.getByLabelText('Email:').value).toBe('john@example.com');
  });

  it('should show error when submitting without name or email', async () => {
    createUser.mockResolvedValue({ success: false, message: 'Name and email are required' });
    render(UserForm({ user: null, onSave: jest.fn(), onCancel: jest.fn() }));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Name and email are required')).toBeInTheDocument();
    });
  });

  it('should call createUser and onSave when form is submitted', async () => {
    const onSaveMock = jest.fn();
    createUser.mockResolvedValue({ success: true, data: { id: 3, name: 'Bob', email: 'bob@example.com' } });
    render(UserForm({ user: null, onSave: onSaveMock, onCancel: jest.fn() }));

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'bob@example.com' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({ name: 'Bob', email: 'bob@example.com' });
    });
    expect(onSaveMock).toHaveBeenCalled();
  });

  it('should call updateUser when editing', async () => {
    const onSaveMock = jest.fn();
    const user = { id: 1, name: 'John', email: 'john@example.com' };
    updateUser.mockResolvedValue({ success: true, data: user });
    render(UserForm({ user, onSave: onSaveMock, onCancel: jest.fn() }));

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'John Updated' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(1, { name: 'John Updated', email: 'john@example.com' });
    });
  });

  it('should show Cancel button when editing and call onCancel', () => {
    const onCancelMock = jest.fn();
    const user = { id: 1, name: 'John', email: 'john@example.com' };
    render(UserForm({ user, onSave: jest.fn(), onCancel: onCancelMock }));
    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(onCancelMock).toHaveBeenCalled();
  });
});

describe('Frontend Component Tests - PostList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading text initially', () => {
    getPosts.mockResolvedValue({ success: true, data: [] });
    render(PostList({ onEdit: jest.fn() }));
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('should render posts after loading', async () => {
    getPosts.mockResolvedValue({
      success: true,
      data: [
        { id: 1, title: 'First Post', content: 'Hello', userId: 1 },
        { id: 2, title: 'Second Post', content: 'World', userId: 2 }
      ]
    });
    render(PostList({ onEdit: jest.fn() }));
    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
    });
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  it('should show "No posts found" when list is empty', async () => {
    getPosts.mockResolvedValue({ success: true, data: [] });
    render(PostList({ onEdit: jest.fn() }));
    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });
  });
});

describe('Frontend Component Tests - PostForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create post form', () => {
    render(PostForm({ post: null, onSave: jest.fn(), onCancel: jest.fn() }));
    expect(screen.getByText('Create Post')).toBeInTheDocument();
    expect(screen.getByLabelText('Title:')).toBeInTheDocument();
    expect(screen.getByLabelText('Content:')).toBeInTheDocument();
  });

  it('should show error when submitting without title or content', async () => {
    render(PostForm({ post: null, onSave: jest.fn(), onCancel: jest.fn() }));
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(screen.getByText('Title and content are required')).toBeInTheDocument();
    });
  });

  it('should call createPost and onSave when form is submitted', async () => {
    const onSaveMock = jest.fn();
    createPost.mockResolvedValue({ success: true, data: { id: 3, title: 'New Post', content: 'Content' } });
    render(PostForm({ post: null, onSave: onSaveMock, onCancel: jest.fn() }));

    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByLabelText('Content:'), { target: { value: 'Content' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith({ title: 'New Post', content: 'Content', userId: null });
    });
    expect(onSaveMock).toHaveBeenCalled();
  });
});
