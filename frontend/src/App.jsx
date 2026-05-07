import { useState } from 'react'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import PostList from './components/PostList'
import PostForm from './components/PostForm'
import './App.css'

function App() {
  const [editingUser, setEditingUser] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const triggerRefresh = () => setRefresh(r => r + 1)

  return (
    <div className="app">
      <h1>Fullstack App</h1>

      <section>
        <UserForm
          user={editingUser}
          onSave={() => { setEditingUser(null); triggerRefresh() }}
          onCancel={() => setEditingUser(null)}
        />
        <UserList key={`user-${refresh}`} onEdit={setEditingUser} />
      </section>

      <hr />

      <section>
        <PostForm
          post={editingPost}
          onSave={() => { setEditingPost(null); triggerRefresh() }}
          onCancel={() => setEditingPost(null)}
        />
        <PostList key={`post-${refresh}`} onEdit={setEditingPost} />
      </section>
    </div>
  )
}

export default App
