import { useState } from 'react'
import { createPost, updatePost } from '../api'

function PostForm({ post, onSave, onCancel }) {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [userId, setUserId] = useState(post?.userId || '')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !content) {
      setError('Title and content are required')
      return
    }
    let data
    const postData = {
      title,
      content,
      userId: userId ? parseInt(userId) : null
    }
    if (post) {
      data = await updatePost(post.id, postData)
    } else {
      data = await createPost(postData)
    }
    if (data.success) {
      setTitle('')
      setContent('')
      setUserId('')
      setError('')
      onSave()
    } else {
      setError(data.message)
    }
  }

  return (
    <div>
      <h3>{post ? 'Edit Post' : 'Create Post'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Content: </label>
          <textarea value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <div>
          <label>User ID: </label>
          <input type="number" value={userId} onChange={e => setUserId(e.target.value)} />
        </div>
        <button type="submit">Save</button>
        {post && <button type="button" onClick={onCancel}>Cancel</button>}
      </form>
    </div>
  )
}

export default PostForm
