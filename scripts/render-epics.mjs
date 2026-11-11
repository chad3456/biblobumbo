// Renders every scene of the plain-JS Epic Painter to JPEG files.
// Usage: node scripts/render-epics.mjs [epic] [comma-separated scene numbers]
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright')
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'epics')
const only = process.argv[2]
const nums = process.argv[3] ? process.argv[3].split(',').map(Number) : null
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', (e) => console.error('page error:', e.message))
await page.setContent('<canvas id="c"></canvas>')
for (const f of ['engine.js', 'ramayana.js', 'mahabharata.js']) {
  try { await page.addScriptTag({ path: join(root, f) }) } catch (e) { console.error('skip', f, e.message) }
}
const epics = await page.evaluate(() => Object.fromEntries(Object.entries(Epic.scenes).map(([k, v]) => [k, v.length])))
for (const [epic, count] of Object.entries(epics)) {
  if (only && only !== 'all' && only !== epic) continue
  mkdirSync(join(root, 'img', epic), { recursive: true })
  for (let i = 0; i < count; i++) {
    if (nums && !nums.includes(i + 1)) continue
    const t = Date.now()
    const url = await page.evaluate(([e, n]) => {
      const c = document.getElementById('c')
      Epic.render(Epic.scenes[e][n], c)
      return c.toDataURL('image/jpeg', 0.82)
    }, [epic, i])
    const name = String(i + 1).padStart(2, '0') + '.jpg'
    writeFileSync(join(root, 'img', epic, name), Buffer.from(url.split(',')[1], 'base64'))
    console.log(epic, name, Date.now() - t + 'ms')
  }
}
await browser.close()
