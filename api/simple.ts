export default async function handler(req: any, res: any) {
  try {
    return res.json({ 
      success: true, 
      message: 'Simple API working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    })
  } catch (error) {
    console.error('Simple API error:', error)
    return res.status(500).json({ 
      error: 'Simple API failed', 
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
