import { useState } from 'react'
import { createUser, updateUser } from '../api'

function UserForm({ user, onSave, onCancel }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) {
      setError('Name and email are required')
      return
    }
    let data
    if (user) {
      data = await updateUser(user.id, { name, email })
    } else {
      data = await createUser({ name, email })
    }
    if (data.success) {
      setName('')
      setEmail('')
      setError('')
      onSave()
    } else {
      setError(data.message)
    }
  }

  return (
    <div>
      <h3>{user ? 'Edit User' : 'Create User'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Email: </label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit">Save</button>
        {user && <button type="button" onClick={onCancel}>Cancel</button>}
      </form>
    </div>
  )
}

export default UserForm
