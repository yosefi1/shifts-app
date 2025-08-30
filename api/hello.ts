export default async function handler(req: any, res: any) {
  return res.json({ 
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}
