import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = path.resolve('visual references')
const OUT = path.resolve('public/cinematic')

const IMAGES = [
  { file: '345aa746-f6f4-4ec6-a0ea-ecb6e34f9a16.png', out: 'montana.webp' },
  { file: '2cbc2095-227b-4ff1-8076-bba0ffb3909e.png', out: 'oso.webp' },
  { file: '6b2338e5-889a-4bb4-9f19-eb0fa1ea74f4.png', out: 'auto.webp' },
]

await mkdir(OUT, { recursive: true })

for (const { file, out } of IMAGES) {
  const dest = path.join(OUT, out)
  const info = await sharp(path.join(SRC, file))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 62 })
    .toFile(dest)
  console.log(`${out}: ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`)
}
