import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import formidable, { Fields, Files } from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    multiples: false,
  })

  form.parse(req, (err: any, fields: Fields, files: Files) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message })
    }
    let file: formidable.File | undefined
    if (Array.isArray(files.file)) {
      file = files.file[0]
    } else {
      file = files.file as formidable.File | undefined
    }
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    // Return the public URL
    const fileUrl = `/uploads/${path.basename(file.filepath)}`
    res.status(200).json({ url: fileUrl })
  })
} 