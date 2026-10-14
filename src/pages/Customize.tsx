import { useState } from 'react'
import { BRICK_COLORS, SHOP, SKIN_TONES, isLocked, levelFromXp, randomAvatar, type ShopItem } from '../lib/game'
import type { Accessory, FaceStyle, HairStyle, MinifigConfig, TorsoPrint } from '../lib/types'
import { useMe, useStore } from '../store'
import { Card } from '../components/ui'
import Minifig, { type MinifigMode } from '../three/Minifig'
import Stage from '../three/Stage'

const HAIR: HairStyle[] = ['bowl', 'spiky', 'long', 'bun', 'cap', 'beanie', 'crown', 'bald']
const FACES: FaceStyle[] = ['smile', 'grin', 'smirk', 'sleepy', 'wink', 'shook']
const PRINTS: TorsoPrint[] = ['plain', 'stripe', 'heart', 'book', 'star', 'bolt']
const ACCESSORIES: Accessory[] = ['none', 'book', 'glasses', 'coffee', 'headphones', 'cape']
const HAIR_COLORS = ['#1b1b1b', '#6d4c41', '#ffb703', '#e3000b', '#ff7a00', '#7b2cbf', '#ff5fa2', '#00b4d8', '#00a650', '#f4f4f4']

type Slot = ShopItem['slot']

export default function Customize() {
  const me = useMe()!
  const updateAvatar = useStore((s) => s.updateAvatar)
  const updateProfile = useStore((s) => s.updateProfile)
  const buyItem = useStore((s) => s.buyItem)
  const pushToast = useStore((s) => s.pushToast)
  const [draft, setDraft] = useState<MinifigConfig>(me.avatar)
  const [mode, setMode] = useState<MinifigMode>('idle')
  const [name, setName] = useState(me.displayName)
  const [bio, setBio] = useState(me.bio)
  const level = levelFromXp(me.xp)

  const set = <K extends keyof MinifigConfig>(k: K, v: MinifigConfig[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const lockedItems = (['hair', 'face', 'print', 'accessory'] as Slot[])
    .map((slot) => isLocked(slot, String(draft[slot]), me.unlocked))
    .filter((x): x is ShopItem => !!x)
  const dirty = JSON.stringify(draft) !== JSON.stringify(me.avatar)

  const buy = (item: ShopItem) => {
    const err = buyItem(item.id)
    if (err) pushToast(err, 'error')
  }

  const Options = <T extends string>({ slot, values, k }: { slot?: Slot; values: T[]; k: keyof MinifigConfig }) => (
    <div className="opt-grid">
      {values.map((v) => {
        const lock = slot ? isLocked(slot, v, me.unlocked) : null
        return (
          <button key={v} className={`opt ${draft[k] === v ? 'on' : ''} ${lock ? 'locked' : ''}`} onClick={() => set(k, v as MinifigConfig[typeof k])}>
            {v}
            {lock && <small>🔒 {lock.cost}</small>}
          </button>
        )
      })}
    </div>
  )

  const Swatches = ({ k, colors }: { k: keyof MinifigConfig; colors: string[] }) => (
    <div className="swatches">
      {colors.map((c) => (
        <button key={c} className={`swatch ${draft[k] === c ? 'on' : ''}`} style={{ background: c }} onClick={() => set(k, c as MinifigConfig[typeof k])} aria-label={c} />
      ))}
    </div>
  )

  return (
    <div className="page customize">
      <Card className="fig-stage">
        <div className="stage-head">
          <h2>fit check 🪞</h2>
          <p>drag to spin · scroll to zoom</p>
        </div>
        <Stage camera={[0, 2.6, 6.5]} target={[0, 1.9, 0]} height={480} plate={8} plateColor="#0055bf">
          <Minifig config={draft} mode={mode} />
        </Stage>
        <div className="pose-row">
          {(['idle', 'wave', 'dance', 'read', 'celebrate', 'walk'] as MinifigMode[]).map((m) => (
            <button key={m} className={`chip ${m === mode ? 'on' : ''}`} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
        <div className="save-row">
          <button className="btn" onClick={() => setDraft(randomAvatar())}>🎲 randomise</button>
          <button className="btn ghost" disabled={!dirty} onClick={() => setDraft(me.avatar)}>reset</button>
          <button
            className="btn primary"
            disabled={!dirty || lockedItems.length > 0}
            onClick={() => updateAvatar(draft)}
            title={lockedItems.length ? 'unlock the 🔒 items first' : ''}
          >
            save fit ✅
          </button>
        </div>
        {lockedItems.length > 0 && (
          <div className="locked-note">
            <p>you’re previewing locked drip 👀</p>
            {lockedItems.map((i) => (
              <button key={i.id} className="btn small primary" onClick={() => buy(i)} disabled={!!i.minLevel && level < i.minLevel}>
                unlock {i.label} · {i.cost} 🟡{i.minLevel && level < i.minLevel ? ` (Lv ${i.minLevel})` : ''}
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="side-col">
        <Card>
          <h3>skin</h3>
          <Swatches k="skin" colors={SKIN_TONES} />
          <h3>hair</h3>
          <Options slot="hair" values={HAIR} k="hair" />
          <Swatches k="hairColor" colors={HAIR_COLORS} />
          <h3>face</h3>
          <Options slot="face" values={FACES} k="face" />
          <h3>torso</h3>
          <Swatches k="torso" colors={BRICK_COLORS} />
          <Options slot="print" values={PRINTS} k="print" />
          <h3>legs</h3>
          <Swatches k="legs" colors={BRICK_COLORS} />
          <h3>accessory</h3>
          <Options slot="accessory" values={ACCESSORIES} k="accessory" />
        </Card>

        <Card color="#ffd500">
          <h3>stud shop 🛍️ <small>you have {me.studs} 🟡</small></h3>
          <ul className="shop">
            {SHOP.map((i) => {
              const owned = me.unlocked.includes(i.id)
              const tooLow = !!i.minLevel && level < i.minLevel
              return (
                <li key={i.id}>
                  <span>{i.label}</span>
                  {owned ? <span className="tag">owned</span> : (
                    <button className="btn small" disabled={tooLow || me.studs < i.cost} onClick={() => buy(i)}>
                      {tooLow ? `Lv ${i.minLevel}` : `${i.cost} 🟡`}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>

        <Card color="#00a650">
          <h3>profile</h3>
          <label>
            display name
            <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            bio
            <textarea value={bio} maxLength={140} rows={2} onChange={(e) => setBio(e.target.value)} />
          </label>
          <button className="btn primary small" onClick={() => { updateProfile({ displayName: name, bio }); pushToast('profile updated 💅') }}>save profile</button>
        </Card>
      </div>
    </div>
  )
}
