import type { ReactNode } from 'react'

type Tone = 'gold' | 'red'

type Props = {
  en: string
  ko: string
  tone?: Tone
  action?: ReactNode
}

/**
 * Quiet placeholder for an empty member/alumni group.
 * Palette only: Buttercream / Blush surface, Gold / Ruby rail.
 */
export default function EmptyNote({ en, ko, tone = 'gold', action }: Props) {
  const surface = tone === 'gold' ? 'bg-[#FFF9E6] border-[#D6B14D]/25' : 'bg-[#FFE4E9]/60 border-[#E8889C]/30'
  const rail = tone === 'gold' ? 'bg-[#D6B14D]' : 'bg-[#E8889C]'
  return (
    <div className={`relative overflow-hidden rounded-xl md:rounded-[20px] border ${surface} pl-24 pr-16 py-14 md:pl-32 md:pr-24 md:py-18`}>
      <span className={`absolute left-12 md:left-16 top-14 bottom-14 md:top-16 md:bottom-16 w-[3px] rounded-full ${rail}`} aria-hidden="true" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 sm:gap-16">
        <div className="min-w-0">
          <p className="text-[13px] md:text-[15px] font-semibold text-gray-800 leading-snug">{ko}</p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-2 tracking-wide">{en}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
