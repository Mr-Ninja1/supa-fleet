import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientDist = path.resolve(__dirname, '../../client/dist')
const target = path.resolve(__dirname, '../client-dist')

if (!fs.existsSync(clientDist)) {
  console.error('Client build not found at', clientDist)
  process.exit(1)
}

fs.rmSync(target, { recursive: true, force: true })
fs.mkdirSync(target, { recursive: true })
fs.cpSync(clientDist, target, { recursive: true })

console.log('Copied client build to', target)
