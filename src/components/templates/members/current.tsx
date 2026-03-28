import { memo, useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, BookOpen, Lightbulb, ChevronRight, ChevronDown, Home, Mail, Github, Linkedin, Globe, Copy, Check, ExternalLink, Sparkles} from 'lucide-react'
import type { MemberData } from '@/types/data'

// Members to exclude from Current Members (moved to Alumni)
const EXCLUDED_MEMBERS = [
  '박성수',
  '정유진',
  '임소영',
  '이수인',
  '신경수',
  '이태경',
  '심은',
  '하승민',
  '최진우'
]

// Scroll animation hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Email Popup Component
const EmailPopup = ({ email, onClose, degree }: { email: string; onClose: () => void; degree?: string }) => {
  const [copied, setCopied] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendButtonColor = degree === 'undergrad' 
    ? 'bg-[#FFBAC4] hover:bg-[#FFBAC4]/90' 
    : degree === 'phd' || degree === 'phd-candidate' || degree === 'phd-student'
    ? 'bg-[#D6B14D] hover:bg-[#D6B14D]/90' 
    : degree === 'ms'
    ? 'bg-[#C41E3A] hover:bg-[#C41E3A]/90'
    : degree === 'combined'
    ? 'bg-[#D6A076] hover:bg-[#D6A076]/90'
    : 'bg-gray-500 hover:bg-gray-500/90'

  return (
    <div
      ref={popupRef}
      className="absolute bottom-full left-0 mb-8 bg-white border border-gray-200 rounded-xl shadow-lg p-12 z-50 min-w-200"
    >
      <p className="text-xs text-gray-500 mb-8">Email Address</p>
      <p className="text-sm font-medium text-gray-900 mb-12 break-all">{email}</p>
      <div className="flex gap-8">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-6 px-10 py-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={`mailto:${email}`}
          className={`flex-1 flex items-center justify-center gap-6 px-10 py-6 ${sendButtonColor} rounded-lg text-xs font-medium text-white transition-colors`}
        >
          <ExternalLink size={12} />
          Send
        </a>
      </div>
    </div>
  )
}

// Image Imports
import banner2 from '@/assets/images/banner/2.webp'

const degreeLabels = {
  phd: 'Ph.D. Students',
  'phd-candidate': 'Ph.D. Candidates',
  'phd-student': 'Ph.D. Students',
  combined: 'Ph.D.-M.S. Combined Students',
  ms: 'M.S. Students',
  undergrad: 'Undergraduate Researchers',
}

const degreeColors = {
  phd: 'text-white',
  'phd-candidate': 'text-white',
  'phd-student': 'text-white',
  combined: 'text-white',
  ms: 'text-white',
  undergrad: 'text-white',
}

// Gold for PhD, Coral for combined, Ruby for MS, Blossom for undergrad
const degreeBgStyles = {
  phd: {backgroundColor: '#D6B14D'},          // Gold (박사)
  'phd-candidate': {backgroundColor: '#D6B14D'},  // Gold
  'phd-student': {backgroundColor: '#D6B14D'},    // Gold
  combined: {backgroundColor: '#D6A076'},      // Coral (석박사통합)
  ms: {backgroundColor: '#C41E3A'},            // Ruby (석사과정)
  undergrad: {backgroundColor: '#FFBAC4'},     // Blossom (랩인턴)
}

// Hover colors matching Alumni style
const degreeHoverColors = {
  phd: '#D6B14D',
  'phd-candidate': '#D6B14D',
  'phd-student': '#D6B14D',
  combined: '#D6A076',
  ms: '#C41E3A',
  undergrad: '#FFBAC4',
}

// 날짜 포맷 - 하이픈 유지 (2025-12-22 형식)
const formatPeriod = (dateStr: string): string => {
  if (!dateStr) return ''
  return dateStr
}

export const MembersCurrentTemplate = () => {
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [openEmailPopup, setOpenEmailPopup] = useState<string | null>(null)
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)
  const baseUrl = import.meta.env.BASE_URL || '/'
  const contentAnimation = useScrollAnimation()

  useEffect(() => {
    const safeJsonFetch = async (url: string) => {
      const response = await fetch(url)
      const text = await response.text()
      const cleaned = text.replace(/,(\s*[\}\]])/g, '$1')
      return JSON.parse(cleaned)
    }

    // members 폴더의 모든 파일 로드
    const memberFiles = [
      'lce1-undergrad.json',
      'jyj1-undergrad.json',
      'khw1-undergrad.json',
      'kdi1-undergrad.json',
      'lys1-undergrad.json',
      'hjs1-undergrad.json',
      'kjy1-undergrad.json',
      'se1-undergrad.json',
      'kkh1-undergrad.json',
      'kyh1-undergrad.json',
      'sjy1-undergrad.json',
      'cmh1-undergrad.json',
      'cjw1-undergrad.json',
      'jys1-undergrad.json',
      'lsj1-undergrad.json',
      'ltk1-undergrad.json',
      'pss1-undergrad.json',
      'sks1-undergrad.json',
      'lsi1-undergrad.json',
      'ydh1-undergrad.json',
      'kbo1-undergrad.json',
      'lsy1-undergrad.json'
    ]

    Promise.all(
      memberFiles.map((file) =>
        safeJsonFetch(`${baseUrl}data/members/${file}`)
          .catch(() => null)
      )
    )
      .then((results) => {
        const validMembers = results.filter((m): m is MemberData => 
          m !== null && 
          m.status === 'active' && 
          !EXCLUDED_MEMBERS.includes(m.name?.ko || '')
        )
        setMembers(validMembers)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load members data:', err)
        setLoading(false)
      })
  }, [])

  const stats = useMemo(() => {
    const phdCandidateCount = members.filter((m) => m.degree === 'phd' && m.candidacy === true).length
    const phdStudentCount = members.filter((m) => m.degree === 'phd' && m.candidacy !== true).length
    const phdCount = phdCandidateCount + phdStudentCount
    const combinedCount = members.filter((m) => m.degree === 'combined').length
    const msCount = members.filter((m) => m.degree === 'ms').length
    const undergradCount = members.filter((m) => m.degree === 'undergrad').length

    return {
      phd: { label: 'Doctoral Program', count: phdCount, icon: GraduationCap, color: '#D6B14D' },
      combined: { label: 'Integrated Master\'s–Doctoral Program', count: combinedCount, icon: Sparkles, color: '#D6A076' },
      ms: { label: 'Master\'s Program', count: msCount, icon: BookOpen, color: '#C41E3A' },
      undergrad: { label: 'Undergraduate Research Program', count: undergradCount, icon: Lightbulb, color: '#FFBAC4' },
      total: { label: 'Total', count: members.length, icon: Users, color: '#9A7D1F' },
    }
  }, [members])

  const groupedMembers = useMemo(() => {
    const grouped: { [key: string]: MemberData[] } = {
      'phd-candidate': [],
      'phd-student': [],
      combined: [],
      ms: [],
      undergrad: [],
    }
    members.forEach((m) => {
      if (m.degree === 'phd') {
        if (m.candidacy === true) {
          grouped['phd-candidate'].push(m)
        } else {
          grouped['phd-student'].push(m)
        }
      } else if (m.degree === 'combined') {
        grouped.combined.push(m)
      } else if (m.degree === 'ms') {
        grouped.ms.push(m)
      } else if (m.degree === 'undergrad') {
        grouped.undergrad.push(m)
      }
    })
    // Sort each group by Korean name (가나다순)
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.name.ko.localeCompare(b.name.ko, 'ko'))
    })
    return grouped
  }, [members])

  // 각 멤버의 degree에 맞는 hover color 반환
  const getMemberHoverColor = (degree: string) => {
    return degreeHoverColors[degree as keyof typeof degreeHoverColors] || '#C41E3A'
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Banner - 통일된 스타일 */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{ backgroundImage: `url(${banner2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-[#D6A076]/30" />
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(214, 177, 77, 0.08)'}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D6B14D]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-1/4 right-[15%] w-32 h-32 rounded-full bg-[#D6B14D]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse delay-1000" />

        <div className="relative h-full flex flex-col items-center justify-center px-20">
          <div className="flex items-center gap-8 mb-16 md:mb-20">
            <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-[#D6B14D]/80" />
            <span className="text-[#D6C360]/90 text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase">
              Members
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Current Members
          </h1>
          
          {/* Divider - < . > style */}
          <div className="flex items-center justify-center gap-8 md:gap-12">
            <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-[#D6C360]/50 to-[#D6C360]" />
            <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
            <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent via-[#D6C360]/50 to-[#D6C360]" />
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-1480 mx-auto w-full px-16 md:px-20">
        <div className="py-20 md:py-32 border-b border-gray-100">
          <div className="flex items-center gap-8 md:gap-12 flex-wrap">
            <Link to="/" className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110">
              <Home size={16} />
            </Link>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-gray-400 font-medium">Members</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Current Members</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 py-40 md:py-60 pb-60 md:pb-80"
      >
        {/* Overview Section */}
        <section className={`bg-white border border-gray-100 rounded-2xl overflow-hidden mb-40 md:mb-60 transition-opacity duration-500 ${loading ? 'opacity-60' : 'opacity-100'}`}>
          <button onClick={() => setStatsExpanded(!statsExpanded)} className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
              <span className="w-8 h-8 rounded-full bg-primary" />
              Overview
            </h3>
            <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${statsExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {statsExpanded && (
          <div className="flex flex-col gap-16 md:gap-24 p-20 md:p-24 border-t border-gray-100">
          {/* Total - Full Width */}
          <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
            <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center justify-center">
              <stats.total.icon className="size-20 md:size-24 mb-6" style={{color: stats.total.color}} />
              <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: stats.total.color}}>{stats.total.count}</span>
              <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total</span>
            </div>
          </div>

          {/* Other Stats - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            {[stats.phd, stats.combined, stats.ms, stats.undergrad].map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white border rounded-2xl p-10 md:p-20 transition-all duration-300 min-h-[100px] md:min-h-0 hover:shadow-lg"
                style={{ borderColor: '#f3f4f6', '--stat-color': stat.color } as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = stat.color + '50'; e.currentTarget.style.boxShadow = `0 10px 15px -3px ${stat.color}15` }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="absolute top-0 left-16 right-16 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{background: `linear-gradient(to right, ${stat.color}99, transparent)`}} />
                <div className="flex flex-col items-center h-full justify-start pt-8">
                  <stat.icon className="size-16 md:size-20 mb-6" style={{color: stat.color}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: stat.color}}>{stat.count}</span>
                  <span className="text-[10px] md:text-xs font-medium text-gray-500 text-center leading-tight">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
          )}
        </section>

        {/* Members List */}
        {loading ? (
          <div className="flex flex-col gap-32 md:gap-[40px]">
            {/* Centered Spinner */}
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
              </div>
            </div>
            {/* Skeleton Loading - Member cards */}
            {[1, 2].map((section) => (
              <div key={section}>
                <div className="h-6 md:h-7 w-32 bg-gray-200 rounded mb-16 md:mb-[20px] animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-[20px]">
                  {[1, 2, 3].map((card) => (
                    <div key={card} className="bg-white border border-gray-100 rounded-xl md:rounded-[20px] p-20 md:p-[24px] animate-pulse">
                      <div className="flex items-start gap-16">
                        <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-8">
                          <div className="h-5 w-24 bg-gray-200 rounded" />
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-3 w-full bg-gray-100 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-32 md:gap-[40px]">
            {(['phd-candidate', 'phd-student', 'combined', 'ms', 'undergrad'] as const).map((groupKey) => {
              const degreeMembers = groupedMembers[groupKey]
              const baseKey = groupKey.startsWith('phd') ? 'phd' : groupKey
              const sectionColor = degreeHoverColors[groupKey as keyof typeof degreeHoverColors]
              const bgStyle = degreeBgStyles[groupKey as keyof typeof degreeBgStyles]

              // Show placeholder for empty sections (except undergrad)
              if (degreeMembers.length === 0) {
                if (groupKey === 'undergrad') return null
                
                return (
                  <div key={groupKey}>
                    <h3 className="text-lg md:text-[22px] font-semibold text-gray-800 mb-16 md:mb-[20px]">
                      {degreeLabels[groupKey as keyof typeof degreeLabels]}
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-dashed border-gray-200 rounded-xl md:rounded-[20px] p-24 md:p-[40px]">
                    </div>
                  </div>
                )
              }

              return (
                <div key={groupKey}>
                  <h3 className="text-lg md:text-[22px] font-semibold text-gray-800 mb-16 md:mb-[20px]">
                    {degreeLabels[groupKey as keyof typeof degreeLabels]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-[20px]">
                    {degreeMembers.map((member) => {
                      const hoverColor = getMemberHoverColor(member.degree)
                      const isHovered = hoveredMember === member.id
                      
                      return (
                        <div
                          key={member.id}
                          className="bg-white border rounded-xl md:rounded-[20px] p-16 md:p-[24px] shadow-sm transition-all duration-300 group"
                          style={{ 
                            borderColor: isHovered ? hoverColor : '#f3f4f6',
                            boxShadow: isHovered ? `0 10px 15px -3px ${hoverColor}15, 0 4px 6px -4px ${hoverColor}10` : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                          }}
                          onMouseEnter={() => setHoveredMember(member.id)}
                          onMouseLeave={() => setHoveredMember(null)}
                        >
                          <div className="flex items-start gap-12 md:gap-[16px]">
                            <div 
                              className="w-[56px] h-[72px] md:w-[70px] md:h-[90px] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative select-none" 
                              style={{background: 'linear-gradient(135deg, rgba(232,135,155,0.15) 0%, rgba(255,183,197,0.2) 100%)'}}
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              {member.avatar ? (
                                <img
                                  src={member.avatar.replace('/assets/img/', `${baseUrl}images/`).replace('/website/', `${baseUrl}`)}
                                  alt={member.name.ko}
                                  className="w-full h-full object-cover object-top pointer-events-none"
                                  draggable={false}
                                  onContextMenu={(e) => e.preventDefault()}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              <span className={`text-[28px] md:text-[40px] ${member.avatar ? 'hidden' : ''}`}>👤</span>
                              {/* Transparent overlay to prevent image interaction */}
                              {member.avatar && <div className="absolute inset-0" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-6 md:gap-[8px] mb-4 md:mb-[4px]">
                                <h4 
                                  className="text-base md:text-[18px] font-semibold transition-colors"
                                  style={{ color: isHovered ? hoverColor : '#1f2937' }}
                                >
                                  {member.name.ko}
                                </h4>
                                <span 
                                  className={`px-6 md:px-[8px] py-[2px] rounded-full text-[10px] md:text-xs font-bold ${degreeColors[groupKey]}`}
                                  style={degreeBgStyles[groupKey]}
                                >
                                  {member.role.en}
                                </span>
                              </div>
                              {/* Period - plain text on mobile, badge on desktop */}
                              <p className="md:hidden text-xs text-gray-500 mt-4">
                                {formatPeriod(member.period.start)} – {member.period.end ? formatPeriod(member.period.end) : member.period.expected_graduation ? formatPeriod(member.period.expected_graduation) : 'Present'}
                              </p>
                              <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap mt-4">
                                {formatPeriod(member.period.start)} – {member.period.end ? formatPeriod(member.period.end) : member.period.expected_graduation ? formatPeriod(member.period.expected_graduation) : 'Present'}
                              </span>
                            </div>
                          </div>

                          {member.research.interests.length > 0 && (
                            <div className="mt-12 md:mt-[16px]">
                              <p className="text-[10px] md:text-[12px] text-gray-500 mb-6 md:mb-[8px]">Research Interests</p>
                              <div className="flex flex-wrap gap-4 md:gap-[6px]">
                                {member.research.interests.slice(0, 4).map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="px-8 md:px-[10px] py-[3px] md:py-[4px] bg-gray-100 rounded-full text-[10px] md:text-xs text-gray-600"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-12 md:mt-[16px] pt-12 md:pt-[16px] border-t border-gray-100 flex items-center gap-8 md:gap-[12px]">
                            {member.contact.email && (
                              <div className="relative flex items-center justify-center">
                                <button
                                  onClick={() => setOpenEmailPopup(openEmailPopup === member.id ? null : member.id)}
                                  className={`p-6 rounded-lg bg-gray-100 transition-colors ${
                                    member.degree === 'phd' ? 'hover:bg-[#D6B14D]/10 hover:text-[#D6B14D]' :
                                    member.degree === 'combined' ? 'hover:bg-[#D6A076]/10 hover:text-[#D6A076]' :
                                    member.degree === 'ms' ? 'hover:bg-[#C41E3A]/10 hover:text-[#C41E3A]' :
                                    member.degree === 'undergrad' ? 'hover:bg-[#FFBAC4]/10 hover:text-[#FFBAC4]' :
                                    'hover:bg-primary/10 hover:text-primary'
                                  }`}
                                  title="Email"
                                >
                                  <Mail size={14} />
                                </button>
                                {openEmailPopup === member.id && (
                                  <EmailPopup
                                    email={member.contact.email}
                                    onClose={() => setOpenEmailPopup(null)}
                                    degree={member.degree}
                                  />
                                )}
                              </div>
                            )}
                            {member.social?.github && (
                              <a
                                href={member.social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-gray-400 transition-colors ${
                                  member.degree === 'phd' ? 'hover:text-[#D6B14D]' :
                                  member.degree === 'combined' ? 'hover:text-[#D6A076]' :
                                  member.degree === 'ms' ? 'hover:text-[#C41E3A]' :
                                  member.degree === 'undergrad' ? 'hover:text-[#FFBAC4]' :
                                  'hover:text-primary'
                                }`}
                                title="GitHub"
                              >
                                <Github size={16} />
                              </a>
                            )}
                            {member.social?.linkedin && (
                              <a
                                href={member.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-gray-400 transition-colors ${
                                  member.degree === 'phd' ? 'hover:text-[#D6B14D]' :
                                  member.degree === 'combined' ? 'hover:text-[#D6A076]' :
                                  member.degree === 'ms' ? 'hover:text-[#C41E3A]' :
                                  member.degree === 'undergrad' ? 'hover:text-[#FFBAC4]' :
                                  'hover:text-primary'
                                }`}
                                title="LinkedIn"
                              >
                                <Linkedin size={16} />
                              </a>
                            )}
                            {member.social?.personal_website && (
                              <a
                                href={member.social.personal_website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-gray-400 transition-colors ${
                                  member.degree === 'phd' ? 'hover:text-[#D6B14D]' :
                                  member.degree === 'combined' ? 'hover:text-[#D6A076]' :
                                  member.degree === 'ms' ? 'hover:text-[#C41E3A]' :
                                  member.degree === 'undergrad' ? 'hover:text-[#FFBAC4]' :
                                  'hover:text-primary'
                                }`}
                                title="Personal Website"
                              >
                                <Globe size={16} />
                              </a>
                            )}
                            <Link
                              to={`/members/detail/${member.id}`}
                              className={`ml-auto flex items-center gap-4 text-xs md:text-[13px] font-medium transition-colors ${
                                member.degree === 'phd' ? 'hover:text-[#D6B14D]' :
                                member.degree === 'combined' ? 'hover:text-[#D6A076]' :
                                member.degree === 'ms' ? 'hover:text-[#C41E3A]' :
                                member.degree === 'undergrad' ? 'hover:text-[#FFBAC4]' :
                                'hover:text-primary'
                              }`}
                            >
                              View Profile
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(MembersCurrentTemplate)
