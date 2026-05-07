import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '../api'

function UserList({ onEdit }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    const data = await getUsers()
    if (data.success) setUsers(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    await deleteUser(id)
    fetchUsers()
  }

  if (loading) return <p>Loading users...</p>

  return (
    <div>
      <h2>Users</h2>
      {users.length === 0 && <p>No users found.</p>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> ({user.email})
            <button onClick={() => onEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserList
