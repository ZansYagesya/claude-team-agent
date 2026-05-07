import { useEffect, useState } from 'react'
import { getPosts, deletePost } from '../api'

function PostList({ onEdit }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    const data = await getPosts()
    if (data.success) setPosts(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (id) => {
    await deletePost(id)
    fetchPosts()
  }

  if (loading) return <p>Loading posts...</p>

  return (
    <div>
      <h2>Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <strong>{post.title}</strong>
            <p>{post.content}</p>
            <em>By user ID: {post.userId || 'None'}</em>
            <button onClick={() => onEdit(post)}>Edit</button>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PostList
