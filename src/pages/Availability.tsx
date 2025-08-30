import React, { useState, useEffect } from 'react'
import { useNeonStore } from '../stores/neonStore'
import { format, startOfWeek, addDays } from 'date-fns'
import { he } from 'date-fns/locale'

const Availability: React.FC = () => {
  const { currentUser, addConstraint, getPreferences, addPreference, updatePreference } = useNeonStore()
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
    if (currentUser) {
      loadExistingPreferences()
    }
  }, [currentUser])

  const loadExistingPreferences = async () => {
    if (!currentUser) return
    
    try {
      const preferences = await getPreferences(currentUser.id)
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
    if (!currentUser) return
    
    setIsSubmitting(true)
    setMessage('')

    try {
      // Save constraints
      for (const [key, isBlocked] of Object.entries(constraints)) {
        if (isBlocked) {
          const [date, timeSlot] = key.split('-')
          const reason = reasons[key] || 'אילוץ אישי'
          
          await addConstraint({
            workerId: currentUser.id,
            date,
            timeSlot: timeSlot as 'first' | 'second',
            reason,
            isBlocked: true
          })
        }
      }

      // Save preferences
      const existingPreferences = await getPreferences(currentUser.id)
      
      if (existingPreferences) {
        await updatePreference(currentUser.id, {
          notes: generalNotes,
          preferPosition1,
          preferPosition2,
          preferPosition3
        })
      } else {
        await addPreference({
          workerId: currentUser.id,
          notes: generalNotes,
          preferPosition1,
          preferPosition2,
          preferPosition3
        })
      }

      setMessage('הזמינות וההעדפות נשמרו בהצלחה!')
      
      // Clear form after successful save
      setTimeout(() => {
        setConstraints({})
        setReasons({})
        setGeneralNotes('')
        setPreferPosition1('')
        setPreferPosition2('')
        setPreferPosition3('')
        setMessage('')
      }, 2000)

    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage('שגיאה בשמירת ההעדפות')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDayName = (date: Date) => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    return dayNames[date.getDay()]
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        זמינות והעדפות - שבוע הבא
      </h1>

      {/* Week Schedule */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>סימון אילוצים</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr 1fr', 
          gap: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            fontWeight: 'bold',
            borderRight: '1px solid #ddd'
          }}>
            יום
          </div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            fontWeight: 'bold',
            textAlign: 'center',
            borderRight: '1px solid #ddd'
          }}>
            20:00-00:00
          </div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            08:00-12:00
          </div>

          {/* Days */}
          {weekDates.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const isSunday = date.getDay() === 0
            const isLastSunday = isSunday && index === 6
            
            return (
              <React.Fragment key={dateStr}>
                {/* Day name */}
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa',
                  borderRight: '1px solid #ddd',
                  borderTop: '1px solid #ddd'
                }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {getDayName(date)}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {format(date, 'dd/MM', { locale: he })}
                  </div>
                </div>

                {/* First shift (20:00-00:00) - hidden on first Sunday */}
                <div style={{ 
                  padding: '15px',
                  borderRight: '1px solid #ddd',
                  borderTop: '1px solid #ddd',
                  display: isSunday && index === 0 ? 'none' : 'block'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={constraints[`${dateStr}-first`] || false}
                      onChange={(e) => handleConstraintChange(dateStr, 'first', e.target.checked)}
                    />
                    <span>אילוץ</span>
                  </label>
                  {constraints[`${dateStr}-first`] && (
                    <input
                      type="text"
                      placeholder="סיבה לאילוץ"
                      value={reasons[`${dateStr}-first`] || ''}
                      onChange={(e) => handleReasonChange(dateStr, 'first', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </div>

                {/* Second shift (08:00-12:00) - hidden on last Sunday */}
                <div style={{ 
                  padding: '15px',
                  borderTop: '1px solid #ddd',
                  display: isLastSunday ? 'none' : 'block'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={constraints[`${dateStr}-second`] || false}
                      onChange={(e) => handleConstraintChange(dateStr, 'second', e.target.checked)}
                    />
                    <span>אילוץ</span>
                  </label>
                  {constraints[`${dateStr}-second`] && (
                    <input
                      type="text"
                      placeholder="סיבה לאילוץ"
                      value={reasons[`${dateStr}-second`] || ''}
                      onChange={(e) => handleReasonChange(dateStr, 'second', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* General Notes */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>הערות כלליות</h2>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="הערות כלליות על הזמינות שלך..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Position Preferences */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>העדפות עמדות (עדיפות יורדת)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עדיפות ראשונה
            </label>
            <input
              type="text"
              value={preferPosition1}
              onChange={(e) => setPreferPosition1(e.target.value)}
              placeholder="עמדה א'"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עדיפות שנייה
            </label>
            <input
              type="text"
              value={preferPosition2}
              onChange={(e) => setPreferPosition2(e.target.value)}
              placeholder="עמדה ב'"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              עדיפות שלישית
            </label>
            <input
              type="text"
              value={preferPosition3}
              onChange={(e) => setPreferPosition3(e.target.value)}
              placeholder="עמדה ג'"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting ? 'שומר...' : 'שמור זמינות והעדפות'}
        </button>
      </div>

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
    </div>
  )
}

export default Availability 