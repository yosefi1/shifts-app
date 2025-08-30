import { neon } from '@neondatabase/serverless'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found in environment variables')
      return res.status(500).json({ error: 'Database configuration missing' })
    }

    const sql = neon(process.env.DATABASE_URL)
    const { action, data } = req.body

    console.log('API call:', action, data) // Debug log

    switch (action) {
      case 'login':
        const { userId } = data
        const user = await sql`SELECT * FROM users WHERE id = ${userId}`
        console.log('Login result:', user) // Debug log
        return res.json({ success: true, data: user[0] || null })

      case 'getAllUsers':
        const users = await sql`SELECT * FROM users ORDER BY id`
        console.log('Users result:', users.length) // Debug log
        return res.json({ success: true, data: users })

      case 'addWorker':
        const { id, name, role, gender, keepShabbat } = data
        await sql`
          INSERT INTO users (id, name, role, gender, keepShabbat, created_at) 
          VALUES (${id}, ${name}, ${role}, ${gender}, ${keepShabbat}, NOW())
        `
        return res.json({ success: true })

      case 'updateWorker':
        const { userId: updateUserId, updates } = data
        // Simple update for now
        if (updates.name) {
          await sql`UPDATE users SET name = ${updates.name} WHERE id = ${updateUserId}`
        }
        if (updates.role) {
          await sql`UPDATE users SET role = ${updates.role} WHERE id = ${updateUserId}`
        }
        if (updates.gender !== undefined) {
          await sql`UPDATE users SET gender = ${updates.gender} WHERE id = ${updateUserId}`
        }
        if (updates.keepShabbat !== undefined) {
          await sql`UPDATE users SET keepShabbat = ${updates.keepShabbat} WHERE id = ${updateUserId}`
        }
        return res.json({ success: true })

      case 'removeWorker':
        const { userId: removeUserId } = data
        await sql`DELETE FROM users WHERE id = ${removeUserId}`
        return res.json({ success: true })

      case 'getConstraints':
        const { workerId } = data
        let constraints
        if (workerId) {
          constraints = await sql`SELECT * FROM constraints WHERE workerId = ${workerId} ORDER BY date`
        } else {
          constraints = await sql`SELECT * FROM constraints ORDER BY date`
        }
        return res.json({ success: true, data: constraints })

      case 'addConstraint':
        const { workerId: constraintWorkerId, date, timeSlot, reason, isBlocked } = data
        await sql`
          INSERT INTO constraints (workerId, date, timeSlot, reason, isBlocked, created_at) 
          VALUES (${constraintWorkerId}, ${date}, ${timeSlot}, ${reason}, ${isBlocked}, NOW())
        `
        return res.json({ success: true })

      case 'updateConstraint':
        const { constraintId, constraintUpdates } = data
        await sql`
          UPDATE constraints 
          SET reason = ${constraintUpdates.reason || ''}, isBlocked = ${constraintUpdates.isBlocked ?? true}
          WHERE id = ${constraintId}
        `
        return res.json({ success: true })

      case 'removeConstraint':
        const { constraintId: removeConstraintId } = data
        await sql`DELETE FROM constraints WHERE id = ${removeConstraintId}`
        return res.json({ success: true })

      case 'getPreferences':
        const { workerId: prefWorkerId } = data
        const preferences = await sql`SELECT * FROM preferences WHERE workerId = ${prefWorkerId} LIMIT 1`
        return res.json({ success: true, data: preferences[0] || null })

      case 'addPreference':
        const { workerId: prefAddWorkerId, notes, preferPosition1, preferPosition2, preferPosition3 } = data
        await sql`
          INSERT INTO preferences (workerId, notes, preferPosition1, preferPosition2, preferPosition3, created_at, updated_at) 
          VALUES (${prefAddWorkerId}, ${notes}, ${preferPosition1}, ${preferPosition2}, ${preferPosition3}, NOW(), NOW())
        `
        return res.json({ success: true })

      case 'updatePreference':
        const { workerId: prefUpdateWorkerId, prefUpdates } = data
        await sql`
          UPDATE preferences 
          SET notes = ${prefUpdates.notes || ''}, 
              preferPosition1 = ${prefUpdates.preferPosition1 || ''}, 
              preferPosition2 = ${prefUpdates.preferPosition2 || ''}, 
              preferPosition3 = ${prefUpdates.preferPosition3 || ''}, 
              updated_at = NOW()
          WHERE workerId = ${prefUpdateWorkerId}
        `
        return res.json({ success: true })

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
