import { Game, VIEW_H, VIEW_W, type Input, type Phase } from './engine'
import './game.css'

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!
const ctx = canvas.getContext('2d')!
const overlay = document.querySelector<HTMLDivElement>('#overlay')!
const game = new Game()

/* ---------- crisp canvas at any size ---------- */
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = VIEW_W * dpr
  canvas.height = VIEW_H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
resize()
window.addEventListener('resize', resize)

/* ---------- input: keyboard + touch ---------- */
const input: Input = { left: false, right: false, jump: false, run: false }
const KEYS: Record<string, keyof Input> = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump',
  ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run',
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && (game.phase === 'title' || game.phase === 'over' || game.phase === 'won')) { begin(); return }
  if (e.code === 'KeyM') { toggleMute(); return }
  const k = KEYS[e.code]
  if (k) { input[k] = true; e.preventDefault() }
})
window.addEventListener('keyup', (e) => {
  const k = KEYS[e.code]
  if (k) input[k] = false
})
window.addEventListener('blur', () => { input.left = input.right = input.jump = input.run = false })

document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((btn) => {
  const k = btn.dataset.key as keyof Input
  const on = (e: Event) => { e.preventDefault(); input[k] = true; btn.classList.add('down') }
  const off = (e: Event) => { e.preventDefault(); input[k] = false; btn.classList.remove('down') }
  btn.addEventListener('pointerdown', on)
  btn.addEventListener('pointerup', off)
  btn.addEventListener('pointerleave', off)
  btn.addEventListener('pointercancel', off)
})

/* ---------- tiny chiptune sfx (WebAudio, no files) ---------- */
let audio: AudioContext | null = null
let muted = false
const muteBtn = document.querySelector<HTMLButtonElement>('#mute')!
function toggleMute() {
  muted = !muted
  muteBtn.textContent = muted ? '🔇' : '🔊'
}
muteBtn.addEventListener('click', toggleMute)

const SFX: Record<string, [number, number, number, OscillatorType][]> = {
  jump: [[520, 820, 0.12, 'square']],
  vote: [[988, 988, 0.06, 'square'], [1319, 1319, 0.12, 'square']],
  stomp: [[300, 120, 0.12, 'triangle']],
  bump: [[160, 110, 0.08, 'square']],
  boost: [[400, 900, 0.25, 'triangle']],
  hit: [[600, 200, 0.25, 'sawtooth']],
  die: [[500, 80, 0.7, 'sawtooth']],
  win: [[523, 523, 0.15, 'square'], [659, 659, 0.15, 'square'], [784, 784, 0.15, 'square'], [1047, 1047, 0.4, 'square']],
}
game.sound = (name) => {
  if (muted) return
  audio ??= new AudioContext()
  let at = audio.currentTime
  for (const [f0, f1, dur, type] of SFX[name]) {
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.type = type
    o.frequency.setValueAtTime(f0, at)
    o.frequency.exponentialRampToValueAtTime(f1, at + dur)
    g.gain.setValueAtTime(0.06, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g).connect(audio.destination)
    o.start(at)
    o.stop(at + dur)
    at += dur
  }
}

/* ---------- screens ---------- */
const BEST_KEY = 'namo-bricks-best'
function best(): number {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}

function show(html: string) {
  overlay.innerHTML = html
  overlay.hidden = false
  overlay.querySelector<HTMLButtonElement>('[data-start]')?.addEventListener('click', begin)
}

function begin() {
  overlay.hidden = true
  game.start()
}

game.onChange = (phase: Phase) => {
  const s = game.stats
  if (phase === 'over') {
    show(`
      <div class="panel">
        <h1>COALITION TIME 😅</h1>
        <p>You ran out of lives. The opposition celebrates… for now.</p>
        <p class="score">🗳️ ${s.votes} votes · 🏗️ ${s.projects} projects · ★ ${s.score}</p>
        <button class="go" data-start>try again ↻</button>
      </div>`)
  } else if (phase === 'won') {
    setTimeout(() => {
      const seats = game.seatsWon()
      const prev = best()
      if (s.score > prev) try { localStorage.setItem(BEST_KEY, String(s.score)) } catch { /* ignore */ }
      show(`
        <div class="panel win">
          <h1>ELECTION WON! 🎉</h1>
          <div class="seats"><b>${seats}</b><span>/ 543 seats</span></div>
          <p>${seats >= 400 ? 'historic landslide, record-breaking mandate 🔥' : seats >= 272 ? 'clear majority — government formed ✅' : 'scraped through with allies 🤝'}</p>
          <p class="score">🗳️ ${s.votes} votes · 🏗️ ${s.projects} projects · 👋 ${s.stomps} opponents outplayed · ★ ${s.score}${s.score > prev ? ' · NEW BEST!' : ''}</p>
          <button class="go" data-start>play again ↻</button>
        </div>`)
    }, 3500)
  }
}

show(`
  <div class="panel">
    <div class="brick-logo"><span></span>NaMo Bricks</div>
    <h1>THE ELECTION RUN</h1>
    <p>Run, jump and campaign your way to the finish flag.</p>
    <ul class="legend">
      <li><b>🗳️ Ballot boxes</b> = votes</li>
      <li><b>? blocks</b> = development projects (and the odd Vikas Boost 🚄)</li>
      <li><b>🚧 Protests</b> block the road — jump over them</li>
      <li><b>RaGa &amp; Kejri</b> roam the trail — jump on them to outplay them, touch them from the side and you lose the debate</li>
    </ul>
    <p class="keys">← → move · Space/↑ jump (hold = higher) · Shift run · M mute</p>
    <button class="go" data-start>START CAMPAIGN ▶</button>
    <p class="fine">Best: ${best()} · A fan-made parody game. Not affiliated with or endorsed by any person or party.</p>
  </div>`)

/* ---------- main loop ---------- */
let last = performance.now()
function frame(now: number) {
  const dt = Math.min(1 / 30, (now - last) / 1000)
  last = now
  game.update(dt, input)
  game.render(ctx)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
