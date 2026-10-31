// 디렉터 프로필 카드 본문 — 6개 디렉터 페이지 공통 (내용 단일 소스: directorInfo)
import {useState, type ReactNode} from 'react'
import {Mail, Phone, MapPin, ExternalLink, Briefcase, Building, Copy, Check} from 'lucide-react'
import ResumeModal from '@/components/common/ResumeModal'
import {useStoreModal} from '@/store/modal'
import {directorInfo, scholarConfig} from '@/data/director-common'
import directorImg from '@/assets/images/members/director.webp'

const Row = ({icon, label, children}: {icon: ReactNode; label: string; children: ReactNode}) => (
  <div className="flex items-start gap-10 group">
    <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-800 transition-colors shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  </div>
)

export const DirectorCardBody = ({footer}: {footer?: ReactNode}) => {
  const {showModal} = useStoreModal()
  const [copied, setCopied] = useState(false)
  const d = directorInfo
  const copy = () => {
    navigator.clipboard.writeText(d.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <>
      <div className="flex flex-col items-center text-center mb-20 md:mb-24">
        <div
          className="w-120 h-155 md:w-140 md:h-180 bg-gray-100 rounded-2xl overflow-hidden mb-12 md:mb-16 shadow-inner border border-gray-50 relative select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            loading="lazy"
            decoding="async"
            src={directorImg}
            alt="Prof. Insu Choi"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0" />
        </div>
        <h2 className="text-base md:text-lg font-bold text-gray-900">
          {d.name}<span className="text-sm font-medium text-gray-500">, Ph.D.</span>
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-2">{d.nameKo}</p>
      </div>

      <div className="flex flex-col gap-12 md:gap-16">
        <Row icon={<Briefcase size={14}/>} label="Position">
          <p className="text-sm font-semibold text-gray-800">{d.position}</p>
          <p className="text-xs text-gray-500">{d.lab}</p>
        </Row>
        <Row icon={<Building size={14}/>} label="Affiliation">
          <p className="text-sm font-semibold text-gray-800">{d.title}</p>
          <p className="text-xs text-gray-500">{d.organization}</p>
        </Row>
        <Row icon={<MapPin size={14}/>} label="Office">
          <p className="text-sm font-semibold text-gray-800">{d.office}</p>
          <p className="text-xs text-gray-500">{d.officeKo}</p>
        </Row>
        <Row icon={<Mail size={14}/>} label="E-mail">
          <div className="flex items-center gap-6">
            <a href={`mailto:${d.email}`} className="inline-block py-4 -my-4 select-text text-sm font-semibold text-gray-800 hover:text-gray-900 hover:underline underline-offset-2 break-all">
              {d.email}
            </a>
            <button
              onClick={copy}
              className="size-28 -my-4 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors shrink-0"
              title="Copy email"
            >
              {copied ? <Check size={10} className="text-[#9A7D1F]"/> : <Copy size={10} className="text-gray-500"/>}
            </button>
          </div>
        </Row>
        <Row icon={<Phone size={14}/>} label="Phone">
          <a href={`tel:${d.phone}`} className="inline-block py-4 -my-4 text-sm font-semibold text-gray-800 hover:text-gray-900 hover:underline underline-offset-2 transition-colors">
            {d.phone}
          </a>
        </Row>
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-8 mt-16 md:mt-20">
        <button
          onClick={() => showModal({title: '', maxWidth: '800px', children: <ResumeModal />})}
          className="flex items-center justify-center gap-4 py-10 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
        >
          Resume <ExternalLink size={12}/>
        </button>
        <a
          href={scholarConfig.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-4 py-10 bg-primary text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
          style={{color: 'white'}}
        >
          Scholar <ExternalLink size={12}/>
        </a>
      </div>
      {footer}
    </>
  )
}
