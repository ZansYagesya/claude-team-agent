const API_BASE = 'http://localhost:3001/api'

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/users`)
  return res.json()
}

export const createUser = async (userData) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  return res.json()
}

export const deleteUser = async (id) => {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' })
  return res.json()
}

export const getPosts = async () => {
  const res = await fetch(`${API_BASE}/posts`)
  return res.json()
}

export const createPost = async (postData) => {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  })
  return res.json()
}

export const deletePost = async (id) => {
  const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' })
  return res.json()
}

export const updateUser = async (id, userData) => {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  return res.json()
}

export const updatePost = async (id, postData) => {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  })
  return res.json()
}
