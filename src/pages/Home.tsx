import { Link } from 'react-router-dom'
import { ghatLitCount } from '../lib/diwali'
import { useDiwali } from '../diwaliStore'
import { useStore } from '../store'

export default function Home() {
  const figs = useStore((s) => s.mine.length)
  const diyas = useDiwali((s) => s.diyas.length)
  return (
    <div className="home">
      <section className="hero">
        <h1>Utsav Bricks <span aria-hidden>🪔</span></h1>
        <p>Celebrate India’s festivals in a LEGO-style 3D world. Build your figurine, dance garba around Maa Ambe, and light diyas on the ghats of Ayodhya.</p>
      </section>

      <div className="game-cards">
        <article className="game-card shilpa-card">
          <div className="art shilpa-art" aria-hidden>
            <div className="sh-band b0" /><div className="sh-band b1" /><div className="sh-band b2" />
            <div className="sh-beam" />
            <span className="sh-dancer">💃</span>
            <span className="badge new">NEW</span>
          </div>
          <div className="card-body">
            <h2>Shilpa: The Living Frieze</h2>
            <p>Play as <b>ancient temple wall art</b>. A carved dancer wakes wherever light touches the wall: carry diyas through a Hoysala-style mandapa, then step into the frieze and run along the elephant, horse and Ramayana bands.</p>
            <ul className="facts">
              <li>🛕 Halebidu, Hampi & Kerala murals</li>
              <li>🪔 light-and-shadow puzzles</li>
              <li>🪷 5 lotuses</li>
            </ul>
            <Link to="/shilpa" className="btn primary big">Enter the temple 🛕</Link>
          </div>
        </article>

        <article className="game-card diwali-card">
          <div className="art diwali-art" aria-hidden>
            <div className="sky-glow" />
            <div className="shikhara" />
            <div className="ghat-row r1" />
            <div className="ghat-row r2" />
            <div className="ghat-row r3" />
            <div className="river" />
            <span className="badge new">NEW</span>
          </div>
          <div className="card-body">
            <h2>Diwali in Ayodhya</h2>
            <p>Walk the glowing Saryu ghats on Deepotsav night. Light a diya with a <b>wish, promise or message</b>, read what others wished for, and send your diya to someone special.</p>
            <ul className="facts">
              <li>🪔 {ghatLitCount(diyas).toLocaleString()} diyas glowing</li>
              <li>💌 {diyas} messages</li>
              <li>🎆 fireworks & sky lanterns</li>
            </ul>
            <Link to="/diwali" className="btn primary big">Enter Ayodhya 🪔</Link>
          </div>
        </article>

        <article className="game-card brawl-card">
          <div className="art brawl-art" aria-hidden>
            <div className="brawl-floor" />
            <div className="brawl-stall" />
            <span className="brawler b1" /><span className="brawler b2" /><span className="brawler b3" />
            <span className="pow">POW!</span>
            <span className="badge new">NEW</span>
          </div>
          <div className="card-body">
            <h2>Kantin Clash</h2>
            <p>A pixel-art <b>school brawl</b> in the canteen. Pick a Brawler, Kicker, Grappler or Muay Thai fighter, chain combos, protect your classmates and survive 12 waves, solo or with a friend.</p>
            <ul className="facts">
              <li>👊 4 fighting styles</li>
              <li>🎮 1–2 players · gamepad & touch</li>
              <li>🏫 12 waves + boss</li>
            </ul>
            <Link to="/brawl" className="btn primary big">Start brawl 👊</Link>
          </div>
        </article>

        <article className="game-card garba-card">
          <div className="art garba-art" aria-hidden>
            <div className="garba-ring" />
            <div className="garba-centre">🔱</div>
            <span className="dot d1" /><span className="dot d2" /><span className="dot d3" /><span className="dot d4" /><span className="dot d5" /><span className="dot d6" />
          </div>
          <div className="card-body">
            <h2>Garba Night</h2>
            <p>Design a figurine in <b>chaniya choli or kediyu</b>, then dance be taali, dodhiyu and dandiya raas in the circle around Maa Durga while a live orchestra plays.</p>
            <ul className="facts">
              <li>💃 6 garba steps</li>
              <li>🎶 7 original songs</li>
              <li>⭐ {figs} figurine{figs === 1 ? '' : 's'} made</li>
            </ul>
            <div className="row">
              <Link to="/studio" className="btn">🧵 Figurine studio</Link>
              <Link to="/garba" className="btn primary">💃 Garba ground</Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
