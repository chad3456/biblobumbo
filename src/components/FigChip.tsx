import type { FigurineConfig } from '../lib/types'

/** Tiny 2D badge of a figurine (no WebGL) for lists. */
export default function FigChip({ config: c, size = 34 }: { config: FigurineConfig; size?: number }) {
  const female = c.gender === 'female'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="fig-chip">
      {female ? (
        <path d="M10 39 L14 24 L26 24 L30 39 Z" fill={c.main} stroke="#111" strokeWidth="1.5" />
      ) : (
        <>
          <rect x="14" y="30" width="5" height="9" fill={c.second} stroke="#111" strokeWidth="1.2" />
          <rect x="21" y="30" width="5" height="9" fill={c.second} stroke="#111" strokeWidth="1.2" />
          <path d="M11 32 L15 22 L25 22 L29 32 Z" fill={c.main} stroke="#111" strokeWidth="1.5" />
        </>
      )}
      <rect x="14" y="17" width="12" height="8" rx="2" fill={female ? c.second : c.main} stroke="#111" strokeWidth="1.5" />
      <rect x="13" y="4" width="14" height="13" rx="4" fill={c.skin} stroke="#111" strokeWidth="1.5" />
      <circle cx="17.5" cy="10" r="1.2" fill="#111" />
      <circle cx="22.5" cy="10" r="1.2" fill="#111" />
      <path d="M17 13 Q20 15.5 23 13" stroke="#111" strokeWidth="1.2" fill="none" />
      {female ? (
        <>
          <path d="M12.5 9 Q12 2 20 2 Q28 2 27.5 9 L26 6 Q20 4 14 6 Z" fill={c.hairColor} stroke="#111" strokeWidth="1" />
          <circle cx="20" cy="7" r="0.9" fill="#d50000" />
        </>
      ) : c.maleHead === 'none' ? (
        <path d="M12.5 9 Q12 2 20 2 Q28 2 27.5 9 L26 6 Q20 4 14 6 Z" fill={c.hairColor} stroke="#111" strokeWidth="1" />
      ) : (
        <path d="M11 7 Q11 0 20 0.5 Q29 0 29 7 Z" fill={c.drape} stroke="#111" strokeWidth="1.2" />
      )}
    </svg>
  )
}
