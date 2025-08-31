import React, { useState, useEffect } from 'react'
import { useSupabaseAuthStore } from '../stores/supabaseAuthStore'
import { format, startOfWeek, addDays } from 'date-fns'
import { he } from 'date-fns/locale'

const Availability: React.FC = () => {
  const { user, addConstraint, getPreferences, addPreference, updatePreference } = useSupabaseAuthStore()
  const [constraints, setConstraints] = useState<{[key: string]: boolean}>({})
  const [reasons, setReasons] = useState<{[key: string]: string}>({})
  const [generalNotes, setGeneralNotes] = useState('')
  const [preferPosition1, setPreferPosition1] = useState('')
  const [preferPosition2, setPreferPosition2] = useState('')
  const [preferPosition3, setPreferPosition3] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Get next week dates
  const nextWeekStart = startOfWeek(addDays(new Date(), 7), { weekStartsOn: 0 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i))

  useEffect(() => {
    if (user) {
      loadExistingPreferences()
    }
  }, [user])

  const loadExistingPreferences = async () => {
    if (!user) return
    
    try {
      const preferences = await getPreferences(user.id)
      if (preferences) {
        setGeneralNotes(preferences.notes || '')
        setPreferPosition1(preferences.preferPosition1 || '')
        setPreferPosition2(preferences.preferPosition2 || '')
        setPreferPosition3(preferences.preferPosition3 || '')
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const handleConstraintChange = (date: string, timeSlot: 'first' | 'second', checked: boolean) => {
    const key = `${date}-${timeSlot}`
    setConstraints(prev => ({ ...prev, [key]: checked }))
    
    if (!checked) {
      setReasons(prev => {
        const newReasons = { ...prev }
        delete newReasons[key]
        return newReasons
      })
    }
  }

  const handleReasonChange = (date: string, timeSlot: 'first' | 'second', reason: string) => {
    const key = `${date}-${timeSlot}`
    setReasons(prev => ({ ...prev, [key]: reason }))
  }

  const handleSave = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    setMessage('')

    try {
      // Save constraints
      for (const [key, isBlocked] of Object.entries(constraints)) {
        if (isBlocked) {
          const [date, timeSlot] = key.split('-')
          const reason = reasons[key] || 'אילוץ אישי'
          
          await addConstraint({
            workerId: user.id,
            date,
            timeSlot: timeSlot as 'first' | 'second',
            reason,
            isBlocked: true
          })
        }
      }

      // Save preferences
      const existingPreferences = await getPreferences(user.id)
      
      if (existingPreferences) {
        await updatePreference(user.id, {
          notes: generalNotes,
          preferPosition1,
          preferPosition2,
          preferPosition3
        })
      } else {
        await addPreference({
          workerId: user.id,
          notes: generalNotes,
          preferPosition1,
          preferPosition2,
          preferPosition3
        })
      }

      setMessage('הנתונים נשמרו בהצלחה!')
    } catch (error) {
      setMessage('שגיאה בשמירת הנתונים')
      console.error('Save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div>טוען...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>הגשת אילוצים והעדפות</h1>
      
      {/* Constraints Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>אילוצים לשבוע הבא</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {weekDates.map((date) => (
            <div key={date.toISOString()} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <h3 style={{ 
                marginBottom: '15px', 
                textAlign: 'center',
                color: '#34495e'
              }}>
                {format(date, 'EEEE', { locale: he })}
                <br />
                <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
                  {format(date, 'dd/MM/yyyy')}
                </span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* First Shift */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id={`${date.toISOString()}-first`}
                    checked={constraints[`${date.toISOString()}-first`] || false}
                    onChange={(e) => handleConstraintChange(date.toISOString(), 'first', e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label htmlFor={`${date.toISOString()}-first`} style={{ flex: 1 }}>
                    משמרת ראשונה (08:00-12:00)
                  </label>
                  {constraints[`${date.toISOString()}-first`] && (
                    <input
                      type="text"
                      placeholder="סיבה"
                      value={reasons[`${date.toISOString()}-first`] || ''}
                      onChange={(e) => handleReasonChange(date.toISOString(), 'first', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </div>
                
                {/* Second Shift */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id={`${date.toISOString()}-second`}
                    checked={constraints[`${date.toISOString()}-first`] || false}
                    onChange={(e) => handleConstraintChange(date.toISOString(), 'second', e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label htmlFor={`${date.toISOString()}-second`} style={{ flex: 1 }}>
                    משמרת שנייה (20:00-00:00)
                  </label>
                  {constraints[`${date.toISOString()}-second`] && (
                    <input
                      type="text"
                      placeholder="סיבה"
                      value={reasons[`${date.toISOString()}-second`] || ''}
                      onChange={(e) => handleReasonChange(date.toISOString(), 'second', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>העדפות כלליות</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            הערות כלליות:
          </label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="הכנס הערות כלליות..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עמדה מועדפת ראשונה:
            </label>
            <input
              type="text"
              value={preferPosition1}
              onChange={(e) => setPreferPosition1(e.target.value)}
              placeholder="עמדה מועדפת ראשונה"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עמדה מועדפת שנייה:
            </label>
            <input
              type="text"
              value={preferPosition2}
              onChange={(e) => setPreferPosition2(e.target.value)}
              placeholder="עמדה מועדפת שנייה"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עמדה מועדפת שלישית:
            </label>
            <input
              type="text"
              value={preferPosition3}
              onChange={(e) => setPreferPosition3(e.target.value)}
              placeholder="עמדה מועדפת שלישית"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          style={{
            padding: '15px 40px',
            fontSize: '16px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting ? 'שומר...' : 'שמור אילוצים והעדפות'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: message.includes('שגיאה') ? '#f8d7da' : '#d4edda',
          color: message.includes('שגיאה') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('שגיאה') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default Availability 