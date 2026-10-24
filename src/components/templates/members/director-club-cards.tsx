// 디렉터 Activities 페이지의 단체 카드 + 상세 창 (On-Campus / Off-Campus 공통)
import {ChevronRight, Instagram, Globe} from 'lucide-react'
import {useStoreModal} from '@/store/modal'

export type ClubRole = {role: string; period: string}
export type Club = {
  name: string
  logo: string
  fullName?: string
  fullNameKo?: string
  generation?: string
  membership: ClubRole[]
  leadership: ClubRole[]
  url?: string
  instagram?: string
  hidden?: boolean
}

const isLink = (u?: string) => !!u && u !== '#'

export const ClubCards = ({items}: {items: Club[]}) => {
  const {showModal} = useStoreModal()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-20 md:p-24 border-t border-gray-100">
      {items.filter(a => !a.hidden).map((act) => (
        <button
          key={act.name}
          onClick={() => showModal({
            maxWidth: '400px',
            children: (
              <div className="text-center">
                <div className="size-80 bg-gray-50 rounded-xl p-12 flex items-center justify-center mx-auto mb-16">
                  <img loading="lazy" decoding="async" src={act.logo} alt={act.name} className="w-full h-full object-contain"/>
                </div>

                <h3 className="text-base font-bold text-primary mb-6">{act.name}</h3>
                {act.fullName && <p className="text-xs text-gray-500 mb-2">{act.fullName}</p>}
                {act.fullNameKo && <p className="text-xs text-gray-500 font-bold mb-6">{act.fullNameKo}</p>}
                {act.generation && <p className="text-gray-600 font-bold text-xs mb-16">{act.generation}</p>}

                {act.membership.length > 0 && (
                  <div className="border-t border-gray-100 pt-16 space-y-6">
                    {act.membership.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between px-12 py-10 bg-gray-50 rounded-lg">
                        <span className="text-xs font-bold text-gray-700">{r.role}</span>
                        <span className="text-[10px] md:text-[11px] text-gray-500">{r.period}</span>
                      </div>
                    ))}
                  </div>
                )}

                {act.leadership.length > 0 && (
                  <div className="mt-16 pt-16 border-t border-gray-100">
                    <h4 className="text-[10px] md:text-[11px] font-bold text-primary uppercase tracking-widest mb-10">Leadership</h4>
                    <div className="space-y-6">
                      {act.leadership.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between px-12 py-10 bg-primary/5 rounded-lg border border-primary/10">
                          <span className="text-xs font-bold text-primary">{r.role}</span>
                          <span className="text-[10px] md:text-[11px] text-gray-500">{r.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(isLink(act.url) || act.instagram) && (
                  <div className="mt-16 pt-16 border-t border-gray-100 flex items-center justify-center gap-8">
                    {isLink(act.url) && (
                      <a
                        href={act.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-8 px-16 py-10 bg-[#D6B14D] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        <Globe size={14} />
                        Website
                      </a>
                    )}
                    {act.instagram && (
                      <a
                        href={act.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-8 px-16 py-10 bg-[#D6B14D] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        <Instagram size={14} />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          className="flex items-center gap-16 bg-white border border-gray-100 rounded-xl p-20 hover:shadow-lg hover:border-gray-300 transition-all group text-left"
        >
          <div className="size-56 bg-gray-50 rounded-xl p-8 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
            <img loading="lazy" decoding="async" src={act.logo} alt={act.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"/>
          </div>
          <div className="flex-1 min-w-0 break-words">
            <h4 className="text-sm font-bold text-primary">{act.name}</h4>
            {act.fullName && <p className="text-xs text-gray-500 mt-2 truncate">{act.fullName}</p>}
            {act.fullNameKo && <p className="text-xs text-gray-500 font-semibold truncate">{act.fullNameKo}</p>}
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 transition-colors shrink-0"/>
        </button>
      ))}
    </div>
  )
}
