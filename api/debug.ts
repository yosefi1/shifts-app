export default async function handler(req: any, res: any) {
  try {
    // Get all environment variables
    const allEnvVars = process.env
    const databaseRelatedVars = Object.keys(allEnvVars).filter(key => 
      key.includes('DATABASE') || 
      key.includes('POSTGRES') || 
      key.includes('PG') ||
      key.includes('NEON')
    )
    
    const databaseValues = databaseRelatedVars.reduce((acc, key) => {
      acc[key] = allEnvVars[key] ? 'SET' : 'NOT_SET'
      return acc
    }, {} as Record<string, string>)

    console.log('Debug API - All env vars:', Object.keys(allEnvVars))
    console.log('Debug API - Database related vars:', databaseValues)

    return res.json({ 
      success: true, 
      message: 'Debug API working',
      totalEnvVars: Object.keys(allEnvVars).length,
      databaseRelatedVars: databaseValues,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasViteDatabaseUrl: !!process.env.VITE_DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      // Show first few characters of DATABASE_URL if it exists
      databaseUrlPreview: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 20) + '...' : 
        'NOT_SET'
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return res.status(500).json({ 
      error: 'Debug API failed', 
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
