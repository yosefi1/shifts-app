import React, { useState, useEffect } from 'react'
import { useNeonStore } from '../stores/neonStore'

const Workers: React.FC = () => {
  const { users, getAllUsers, addWorker, updateWorker, removeWorker } = useNeonStore()
  const [isAddingWorker, setIsAddingWorker] = useState(false)
  const [editingWorker, setEditingWorker] = useState<string | null>(null)
  const [newWorker, setNewWorker] = useState({
    id: '',
    name: '',
    role: 'worker' as const,
    gender: 'male' as const,
    keepShabbat: true
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    getAllUsers()
  }, [getAllUsers])

  const handleAddWorker = async () => {
    if (!newWorker.id || !newWorker.name) {
      setMessage('נא למלא את כל השדות')
      return
    }

    try {
      const success = await addWorker(newWorker)
      if (success) {
        setMessage('עובד נוסף בהצלחה!')
        setNewWorker({ id: '', name: '', role: 'worker', gender: 'male', keepShabbat: true })
        setIsAddingWorker(false)
        getAllUsers() // Refresh the list
      } else {
        setMessage('שגיאה בהוספת עובד')
      }
    } catch (error) {
      console.error('Error adding worker:', error)
      setMessage('שגיאה בהוספת עובד')
    }
  }

  const handleUpdateWorker = async (userId: string, updates: Partial<typeof newWorker>) => {
    try {
      const success = await updateWorker(userId, updates)
      if (success) {
        setMessage('עובד עודכן בהצלחה!')
        setEditingWorker(null)
        getAllUsers() // Refresh the list
      } else {
        setMessage('שגיאה בעדכון עובד')
      }
    } catch (error) {
      console.error('Error updating worker:', error)
      setMessage('שגיאה בעדכון עובד')
    }
  }

  const handleRemoveWorker = async (userId: string) => {
    if (userId === '0') {
      setMessage('לא ניתן למחוק את המנהל')
      return
    }

    if (window.confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) {
      try {
        const success = await removeWorker(userId)
        if (success) {
          setMessage('עובד הוסר בהצלחה!')
          getAllUsers() // Refresh the list
        } else {
          setMessage('שגיאה בהסרת עובד')
        }
      } catch (error) {
        console.error('Error removing worker:', error)
        setMessage('שגיאה בהסרת עובד')
      }
    }
  }

  const startEditing = (user: any) => {
    setEditingWorker(user.id)
    setNewWorker({
      id: user.id,
      name: user.name,
      role: user.role,
      gender: user.gender || 'male',
      keepShabbat: user.keepShabbat !== false
    })
  }

  const cancelEditing = () => {
    setEditingWorker(null)
    setNewWorker({ id: '', name: '', role: 'worker', gender: 'male', keepShabbat: true })
  }

  const saveEdit = () => {
    if (editingWorker) {
      handleUpdateWorker(editingWorker, newWorker)
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        ניהול עובדים
      </h1>

      {/* Message */}
      {message && (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.includes('שגיאה') ? '#f8d7da' : '#d4edda',
          color: message.includes('שגיאה') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('שגיאה') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Add Worker Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => setIsAddingWorker(true)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          הוסף עובד חדש
        </button>
      </div>

      {/* Add Worker Form */}
      {isAddingWorker && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#495057' }}>הוסף עובד חדש</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מספר אישי</label>
              <input
                type="text"
                value={newWorker.id}
                onChange={(e) => setNewWorker({ ...newWorker, id: e.target.value })}
                placeholder="מספר אישי"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>שם</label>
              <input
                type="text"
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                placeholder="שם מלא"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>תפקיד</label>
              <select
                value={newWorker.role}
                onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value as 'manager' | 'worker' })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="worker">עובד</option>
                <option value="manager">מנהל</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מגדר</label>
              <select
                value={newWorker.gender}
                onChange={(e) => setNewWorker({ ...newWorker, gender: e.target.value as 'male' | 'female' })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={newWorker.keepShabbat}
                  onChange={(e) => setNewWorker({ ...newWorker, keepShabbat: e.target.checked })}
                />
                <span>שומר שבת</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddWorker}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                הוסף
              </button>
              <button
                onClick={() => setIsAddingWorker(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workers Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>מספר אישי</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>שם</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>תפקיד</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>מגדר</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>שומר שבת</th>
              <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  {editingWorker === user.id ? (
                    <input
                      type="text"
                      value={newWorker.id}
                      onChange={(e) => setNewWorker({ ...newWorker, id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    user.id
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  {editingWorker === user.id ? (
                    <input
                      type="text"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {editingWorker === user.id ? (
                    <select
                      value={newWorker.role}
                      onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value as 'manager' | 'worker' })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="worker">עובד</option>
                      <option value="manager">מנהל</option>
                    </select>
                  ) : (
                    user.role === 'manager' ? 'מנהל' : 'עובד'
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {editingWorker === user.id ? (
                    <select
                      value={newWorker.gender}
                      onChange={(e) => setNewWorker({ ...newWorker, gender: e.target.value as 'male' | 'female' })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="male">זכר</option>
                      <option value="female">נקבה</option>
                    </select>
                  ) : (
                    user.gender === 'male' ? 'זכר' : user.gender === 'female' ? 'נקבה' : '-'
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {editingWorker === user.id ? (
                    <input
                      type="checkbox"
                      checked={newWorker.keepShabbat}
                      onChange={(e) => setNewWorker({ ...newWorker, keepShabbat: e.target.checked })}
                    />
                  ) : (
                    user.keepShabbat ? '✓' : '✗'
                  )}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {editingWorker === user.id ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={saveEdit}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        שמור
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => startEditing(user)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ffc107',
                          color: '#212529',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ערוך
                      </button>
                      {user.id !== '0' && (
                        <button
                          onClick={() => handleRemoveWorker(user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          מחק
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Workers
