export default async function handler(req: any, res: any) {
  try {
    // Check environment variables
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const hasViteDatabaseUrl = !!process.env.VITE_DATABASE_URL
    
    console.log('Environment check:', {
      hasDatabaseUrl,
      hasViteDatabaseUrl,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
    })

    return res.json({ 
      success: true, 
      message: 'Test API working',
      hasDatabaseUrl,
      hasViteDatabaseUrl,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Test API error:', error)
    return res.status(500).json({ 
      error: 'Test API failed', 
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
