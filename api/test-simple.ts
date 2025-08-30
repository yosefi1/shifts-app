export default async function handler(req: any, res: any) {
  try {
    // Just log what we can see
    const allEnvVars = Object.keys(process.env)
    const databaseVars = allEnvVars.filter(key => 
      key.includes('DATABASE') || 
      key.includes('POSTGRES') || 
      key.includes('PG') ||
      key.includes('NEON')
    )
    
    // Show first 10 environment variables
    const firstTen = allEnvVars.slice(0, 10).reduce((acc, key) => {
      acc[key] = process.env[key] ? 'SET' : 'NOT_SET'
      return acc
    }, {} as Record<string, string>)

    return res.json({
      success: true,
      message: "Simple test working",
      totalEnvVars: allEnvVars.length,
      databaseVars: databaseVars,
      firstTen: firstTen,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
