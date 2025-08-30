import { db } from './firebase'
import { doc, setDoc } from 'firebase/firestore'

const initialUsers = [
  { id: '0', name: 'מנהל', role: 'manager' as const },
  { id: '8863762', name: 'בן קורל', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '8279948', name: 'טל אדרי', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9033163', name: 'ליאב אביסידריס', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '8880935', name: 'ליאל שקד', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '8679277', name: 'מאור יצחק קפון', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9192400', name: 'מור לחמני', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9181564', name: 'נויה חזן', role: 'worker' as const, gender: 'female' as const, keepShabbat: false },
  { id: '8379870', name: 'סילנאט טזרה', role: 'worker' as const, gender: 'female' as const, keepShabbat: false },
  { id: '8783268', name: 'סתיו גינה', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9113482', name: 'עהד הזימה', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9113593', name: 'עומרי סעד', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '8801813', name: 'קטרין בטקיס', role: 'worker' as const, gender: 'female' as const, keepShabbat: false },
  { id: '8573304', name: 'רונן רזיאב', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '5827572', name: 'רפאל ניסן', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9147342', name: 'רפאלה רזניקוב', role: 'worker' as const, gender: 'female' as const, keepShabbat: false },
  { id: '8798653', name: 'שירן מוסרי', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '9067567', name: 'שרון סולימני', role: 'worker' as const, gender: 'male' as const, keepShabbat: true },
  { id: '8083576', name: 'יקיר אלדד', role: 'worker' as const, gender: 'male' as const, keepShabbat: true }
]

export const initializeFirebaseData = async () => {
  try {
    console.log('Initializing Firebase with users...')
    
    for (const user of initialUsers) {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        created_at: new Date().toISOString()
      })
    }
    
    console.log('Firebase initialized successfully!')
  } catch (error) {
    console.error('Error initializing Firebase:', error)
  }
}
