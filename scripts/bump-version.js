import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const versionFile = join(rootDir, 'src', 'version.ts')

const content = readFileSync(versionFile, 'utf-8')
const versionMatch = content.match(/export const VERSION = ['"](.+?)['"]/)

if (!versionMatch) {
  console.error('Could not find VERSION constant in version.ts')
  process.exit(1)
}

const currentVersion = versionMatch[1]
const [major, minor, patch] = currentVersion.split('.').map(Number)
const newVersion = `${major}.${minor}.${patch + 1}`

const newContent = content.replace(
  /export const VERSION = ['"].+?['"]/,
  `export const VERSION = '${newVersion}'`
)

writeFileSync(versionFile, newContent, 'utf-8')
console.log(`Version bumped: ${currentVersion} -> ${newVersion}`)

try {
  execSync(`git add ${versionFile}`, { cwd: rootDir, stdio: 'inherit' })
} catch (error) {
  console.warn('Could not stage version.ts file. Please stage it manually.')
}

