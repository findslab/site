// Student Advising — 지도교수 활동 (학생 시절 동아리 활동과 구분)
import {useState} from 'react'
import {ChevronDown, Instagram} from 'lucide-react'
import {studentAdvising} from '@/data/director-common'
import logoDam from '@/assets/images/logos/dam.png'

const logos: Record<string, string> = {dam: logoDam}

export const StudentAdvisingSection = () => {
  const [open, setOpen] = useState(true)
  if (studentAdvising.length === 0) return null
  return (
    <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-20 md:p-24 fbar fbar-section"
      >
        <h3 className="text-lg md:text-xl font-bold text-gray-900">Student Advising</h3>
        <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && (
        <div className="border-t border-gray-100 p-20 md:p-24 flex flex-col gap-12">
          {studentAdvising.map((a) => (
            <div key={a.name} className="flex flex-col sm:flex-row sm:items-center gap-16 p-16 md:p-20 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
              <div className="flex items-start sm:items-center gap-16 flex-1 min-w-0">
                <div className="size-64 md:size-72 bg-gray-50 rounded-xl p-10 flex items-center justify-center shrink-0">
                  <img loading="lazy" decoding="async" src={logos[a.logo]} alt={a.name} className="w-full h-full object-contain"/>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-6 flex-wrap mb-6">
                    <span className="px-8 py-2 rounded-full bg-[#FFF9E6] border border-[#D6B14D]/30 text-[10px] md:text-[11px] font-bold text-[#9A7D1F] whitespace-nowrap">{a.role}</span>
                    <span className="text-[10px] md:text-[11px] font-semibold text-gray-500 whitespace-nowrap">{a.roleKo}</span>
                  </div>
                  <h4 className="text-[15px] md:text-[17px] font-bold text-gray-900">
                    {a.name}<span className="font-medium text-gray-500"> · {a.fullName}</span>
                  </h4>
                  <p className="text-[13px] font-semibold text-gray-600 mt-2">{a.fullNameKo}</p>
                  <p className="text-[13px] text-gray-500 mt-2">{a.noteKo}</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-10 shrink-0 pl-80 sm:pl-0">
                <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">{a.period}</span>
                {a.instagram && (
                  <a
                    href={a.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-6 px-12 py-6 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Instagram size={13}/> Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
