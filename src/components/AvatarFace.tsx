import type { MinifigConfig } from '../lib/types'

/** Lightweight 2D minifig head for lists/feeds (no WebGL needed). */
export default function AvatarFace({ cfg, size = 44 }: { cfg: MinifigConfig; size?: number }) {
  const hair = cfg.hairColor
  const hairShape = () => {
    switch (cfg.hair) {
      case 'bald':
        return null
      case 'crown':
        return <path d="M14 20 L18 8 L25 16 L32 6 L39 16 L46 8 L50 20 Z" fill="#ffc300" stroke="#111" strokeWidth="2" />
      case 'beanie':
        return (
          <g>
            <path d="M12 26 Q12 6 32 6 Q52 6 52 26 Z" fill={hair} stroke="#111" strokeWidth="2" />
            <rect x="10" y="22" width="44" height="7" rx="3" fill={hair} stroke="#111" strokeWidth="2" />
            <circle cx="32" cy="5" r="4" fill="#f4f4f4" stroke="#111" strokeWidth="2" />
          </g>
        )
      case 'cap':
        return (
          <g>
            <path d="M12 25 Q12 7 32 7 Q52 7 52 25 Z" fill={hair} stroke="#111" strokeWidth="2" />
            <path d="M30 23 L58 23 Q58 28 50 28 L30 28 Z" fill={hair} stroke="#111" strokeWidth="2" />
          </g>
        )
      case 'spiky':
        return <path d="M11 28 L12 14 L18 18 L22 6 L28 15 L33 3 L38 15 L44 6 L46 18 L52 14 L53 28 Q32 18 11 28 Z" fill={hair} stroke="#111" strokeWidth="2" />
      case 'long':
        return <path d="M10 56 L10 22 Q10 6 32 6 Q54 6 54 22 L54 56 L46 56 L46 24 Q32 18 18 24 L18 56 Z" fill={hair} stroke="#111" strokeWidth="2" />
      case 'bun':
        return (
          <g>
            <circle cx="32" cy="7" r="7" fill={hair} stroke="#111" strokeWidth="2" />
            <path d="M11 30 Q10 9 32 9 Q54 9 53 30 Q32 18 11 30 Z" fill={hair} stroke="#111" strokeWidth="2" />
          </g>
        )
      default:
        return <path d="M11 30 Q10 8 32 8 Q54 8 53 30 Q32 20 11 30 Z" fill={hair} stroke="#111" strokeWidth="2" />
    }
  }
  const mouth = () => {
    switch (cfg.face) {
      case 'grin':
        return <path d="M23 40 Q32 52 41 40 Z" fill="#111" />
      case 'smirk':
        return <path d="M25 44 Q34 47 40 40" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      case 'shook':
        return <ellipse cx="32" cy="44" rx="3.5" ry="5" fill="#111" />
      case 'sleepy':
        return <line x1="28" y1="44" x2="36" y2="44" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      default:
        return <path d="M24 41 Q32 49 40 41" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="avatar-face" aria-hidden>
      <rect x="24" y="4" width="16" height="8" rx="2" fill={cfg.skin} stroke="#111" strokeWidth="2" />
      {cfg.hair === 'long' && hairShape()}
      <rect x="12" y="10" width="40" height="46" rx="10" fill={cfg.skin} stroke="#111" strokeWidth="2.5" />
      {cfg.face === 'sleepy' ? (
        <g stroke="#111" strokeWidth="2.5" strokeLinecap="round">
          <line x1="21" y1="32" x2="27" y2="32" />
          <line x1="37" y1="32" x2="43" y2="32" />
        </g>
      ) : (
        <g fill="#111">
          <ellipse cx="24" cy="31" rx="2.6" ry={cfg.face === 'shook' ? 4.2 : 3.3} />
          {cfg.face === 'wink' ? (
            <path d="M37 31 Q40 28 43 31" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <ellipse cx="40" cy="31" rx="2.6" ry={cfg.face === 'shook' ? 4.2 : 3.3} />
          )}
        </g>
      )}
      {mouth()}
      {cfg.accessory === 'glasses' && (
        <g stroke="#111" strokeWidth="2" fill="none">
          <circle cx="24" cy="31" r="6" />
          <circle cx="40" cy="31" r="6" />
          <line x1="30" y1="31" x2="34" y2="31" />
        </g>
      )}
      {cfg.hair !== 'long' && hairShape()}
      {cfg.accessory === 'headphones' && (
        <g>
          <path d="M8 30 Q8 2 32 2 Q56 2 56 30" stroke="#111" strokeWidth="3" fill="none" />
          <rect x="4" y="26" width="9" height="14" rx="3" fill="#ff5fa2" stroke="#111" strokeWidth="2" />
          <rect x="51" y="26" width="9" height="14" rx="3" fill="#ff5fa2" stroke="#111" strokeWidth="2" />
        </g>
      )}
    </svg>
  )
}
