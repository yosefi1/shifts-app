import { neon } from '@neondatabase/serverless'

export default async function handler(req: any, res: any) {
  try {
    // Check environment variables
    const envVars = {
      DB_CONNECTION_STRING: !!process.env.DB_CONNECTION_STRING,
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV
    }

    console.log('Test DB API - Environment variables:', envVars)

    // Try to connect to database
    let connectionStatus = 'Not attempted'
    let userCount = 0

    try {
      const databaseUrl = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL || process.env.POSTGRES_URL
      
      if (databaseUrl) {
        console.log('Attempting database connection...')
        const sql = neon(databaseUrl)
        
        // Test simple query
        const users = await sql`SELECT COUNT(*) as count FROM users`
        userCount = users[0]?.count || 0
        connectionStatus = 'Success'
        console.log('Database connection successful, user count:', userCount)
      } else {
        connectionStatus = 'No database URL found'
        console.log('No database URL available')
      }
    } catch (dbError) {
      connectionStatus = `Failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`
      console.error('Database connection failed:', dbError)
    }

    return res.json({ 
      success: true, 
      message: 'Test DB API working',
      environmentVariables: envVars,
      connectionStatus,
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test DB API error:', error)
    return res.status(500).json({ 
      error: 'Test DB API failed', 
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
