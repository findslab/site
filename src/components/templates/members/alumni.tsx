import React, {memo, useState, useEffect, useRef, useMemo} from 'react'
import {Link} from 'react-router-dom'
import {Home, GraduationCap, Building2, ChevronDown, ChevronUp, FileText, ExternalLink, BookOpen, Lightbulb, Users, ArrowUpDown, ArrowUp, ArrowDown} from 'lucide-react'
import banner2 from '@/assets/images/banner/2.webp'

// Get initials from English name (Korean style: "First-Name Last" → "LFN")
const getInitialsFromEnglishName = (nameEn?: string): string => {
  if (!nameEn) return ''
  const parts = nameEn.trim().split(' ')
  if (parts.length < 2) return ''
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  const firstNameParts = firstName.split('-')
  const initials = lastName[0].toUpperCase() + firstNameParts.map(p => p[0]?.toUpperCase() || '').join('')
  return initials
}

// Simple Alumni Avatar - just icon, no hover effect
const AlumniAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'size-36' : 'size-36 md:size-40'
  
  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0`}
      style={{background: 'linear-gradient(135deg, rgba(255,186,196,0.2) 0%, rgba(196,30,58,0.15) 100%)'}}
    >
      <Lightbulb size={16} style={{color: '#FFBAC4'}}/>
    </div>
  )
}

// Alumni Photo component for expanded section - 3.5:4.5 ratio (PC only)
const AlumniPhoto = ({ nameEn, baseUrl }: { nameEn?: string, baseUrl: string }) => {
  const [imgError, setImgError] = useState(false)
  const initials = getInitialsFromEnglishName(nameEn)
  const imgPath = initials ? `${baseUrl}images/members/${initials}-1.webp` : ''
  
  if (!initials || imgError) return null
  
  return (
    <div 
      className="hidden md:block w-[70px] h-[90px] rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 relative select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <img 
        src={imgPath} 
        alt=""
        className="w-full h-full object-cover object-top pointer-events-none"
        draggable={false}
        onError={() => setImgError(true)}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Transparent overlay to prevent image interaction */}
      <div className="absolute inset-0" />
    </div>
  )
}

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

type Education = {
  degree: string
  school: string
  dept: string
  year: string
}

type Thesis = {
  title: string
  url?: string
}

type AlumniMember = {
  name: string
  nameKo?: string
  nameEn?: string
  degrees: string[]
  cohort?: string
  cohortName?: string
  currentPosition?: string
  currentPositionEn?: string
  periods: Record<string, string>
  education: Education[]
  thesis?: Record<string, Thesis>
  projects?: (string | { ko: string; en: string })[]
  company?: string
}

type AlumniData = {
  graduateAlumni: AlumniMember[]
  undergradAlumni: AlumniMember[]
  sinceDate: string
}

const degreeLabels: Record<string, string> = {
  phd: 'Ph.D.',
  ms: 'M.S.',
  bs: 'B.S.',
  ur: 'Undergraduate Researcher',
}

const degreeOrder: Record<string, number> = {
  phd: 1,
  ms: 2,
  bs: 3,
  ur: 4,
}

export const MembersAlumniTemplate = () => {
  const [data, setData] = useState<AlumniData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [phdExpanded, setPhdExpanded] = useState(true)
  const [msExpanded, setMsExpanded] = useState(true)
  const [undergradExpanded, setUndergradExpanded] = useState(true)
  const [expandedAlumni, setExpandedAlumni] = useState<Set<string>>(new Set())
  const [undergradSortKey, setUndergradSortKey] = useState<'name' | 'cohort' | 'period' | 'preMajor' | 'postPosition'>('cohort')
  const [undergradSortDir, setUndergradSortDir] = useState<'asc' | 'desc'>('asc')
  const contentAnimation = useScrollAnimation()
  const baseUrl = import.meta.env.BASE_URL || '/'

  const handleUndergradSort = (key: 'name' | 'cohort' | 'period' | 'preMajor' | 'postPosition') => {
    if (undergradSortKey === key) {
      setUndergradSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setUndergradSortKey(key)
      setUndergradSortDir('asc')
    }
  }

  const toggleAlumniExpand = (name: string) => {
    setExpandedAlumni(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  useEffect(() => {
    fetch(`${baseUrl}data/alumni.json`)
      .then((res) => res.json())
      .then((json: AlumniData) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load alumni data:', err)
        setLoading(false)
      })
  }, [])

  // Sort graduate alumni by highest degree and graduation year
  const sortedGraduateAlumni = data?.graduateAlumni
    ? [...data.graduateAlumni].sort((a, b) => {
        const aMaxDegree = Math.min(...a.degrees.map(d => degreeOrder[d] || 99))
        const bMaxDegree = Math.min(...b.degrees.map(d => degreeOrder[d] || 99))
        if (aMaxDegree !== bMaxDegree) return aMaxDegree - bMaxDegree
        
        const aYear = Math.max(...a.education.map(e => parseInt(e.year) || 0))
        const bYear = Math.max(...b.education.map(e => parseInt(e.year) || 0))
        return bYear - aYear
      })
    : []

  // Separate Ph.D. and M.S. alumni
  const phdAlumni = sortedGraduateAlumni.filter(a => a.degrees.includes('phd'))
  const msAlumni = sortedGraduateAlumni.filter(a => a.degrees.includes('ms') && !a.degrees.includes('phd'))

  // Sort undergrad alumni by selected column
  const sortedUndergradAlumni = useMemo(() => {
    if (!data?.undergradAlumni) return []
    return [...data.undergradAlumni].sort((a, b) => {
      let comparison = 0
      switch (undergradSortKey) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'cohort':
          const aCohort = parseInt(a.cohort?.replace(/[^0-9]/g, '') || '0')
          const bCohort = parseInt(b.cohort?.replace(/[^0-9]/g, '') || '0')
          comparison = aCohort - bCohort
          break
        case 'period':
          const aPeriod = a.periods?.ur?.split(' ~ ')[0] || ''
          const bPeriod = b.periods?.ur?.split(' ~ ')[0] || ''
          comparison = aPeriod.localeCompare(bPeriod)
          break
        case 'preMajor':
          const aPreMajor = a.education?.[0]?.school || ''
          const bPreMajor = b.education?.[0]?.school || ''
          comparison = aPreMajor.localeCompare(bPreMajor)
          break
        case 'postPosition':
          const aPost = a.currentPosition || ''
          const bPost = b.currentPosition || ''
          comparison = aPost.localeCompare(bPost)
          break
      }
      return undergradSortDir === 'asc' ? comparison : -comparison
    })
  }, [data?.undergradAlumni, undergradSortKey, undergradSortDir])

  const totalCount = (data?.graduateAlumni?.length || 0) + (data?.undergradAlumni?.length || 0)
  const phdCount = sortedGraduateAlumni.filter(a => a.degrees.includes('phd')).length
  const msCount = sortedGraduateAlumni.filter(a => a.degrees.includes('ms') && !a.degrees.includes('phd')).length
  const undergradCount = data?.undergradAlumni?.length || 0

  // Helper for singular/plural
  const pluralize = (count: number, singular: string, plural: string) => 
    count === 1 ? singular : plural

  // Get primary affiliation - 학교(더볼드) 학과(볼드) 형식 (학부과정 표시 안함)
  const getAffiliation = (alumni: AlumniMember) => {
    const edu = alumni.education[0]
    if (!edu) return <span className="text-gray-400">-</span>
    
    return (
      <span className="text-sm">
        <span className="font-bold text-gray-900">{edu.school}</span>
        {' '}
        <span className="font-semibold text-gray-700">{edu.dept}</span>
      </span>
    )
  }

  // Render currentPosition - 학교(더볼드) 학과(볼드) 학위(일반)
  const renderCurrentPosition = (position: string | undefined) => {
    if (!position) return <span className="text-gray-400">-</span>
    
    // Check if it contains newline (multi-line format like "석사과정\n산업경영공학부\n고려대학교")
    if (position.includes('\n')) {
      const parts = position.split('\n')
      // 순서: 학위과정 / 학과 / 학교
      const degree = parts[0] || ''
      const dept = parts[1] || ''
      const school = parts[2] || ''
      return (
        <span className="text-sm">
          <span className="font-bold text-gray-900">{school}</span>
          {' '}
          <span className="font-semibold text-gray-700">{dept}</span>
          {' '}
          <span className="text-gray-600">{degree}</span>
        </span>
      )
    }
    
    // Simple position (재학생)
    return <span className="text-gray-600 text-sm">{position}</span>
  }

  // Check if alumni has position change (Pre != Post)
  const hasPositionChange = (alumni: AlumniMember): boolean => {
    if (!alumni.currentPosition) return false
    if (alumni.currentPosition === '재학생') return false
    return true
  }

  // Get graduation date only (for Ph.D./M.S.)
  const getGraduationDate = (alumni: AlumniMember, degreeType: string) => {
    const period = alumni.periods[degreeType]
    if (!period) return '-'
    // "2019.09 – 2025.02" -> "2025.02"
    const parts = period.split('–').map(s => s.trim())
    if (parts.length >= 2) {
      return parts[1] // 졸업 시점만
    }
    return period
  }

  // Get graduation period (for undergrad - full period)
  const getPeriod = (alumni: AlumniMember) => {
    const highestDegree = alumni.degrees.sort((a, b) => (degreeOrder[a] || 99) - (degreeOrder[b] || 99))[0]
    return alumni.periods[highestDegree] || Object.values(alumni.periods)[0] || '-'
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{backgroundImage: `url(${banner2})`}}
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
            Alumni
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
              <Home size={16}/>
            </Link>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-gray-400 font-medium">Members</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Alumni</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 py-40 md:py-60 pb-60 md:pb-100"
      >
        {loading ? (
          <div className="space-y-48">
            {/* Centered Spinner */}
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
              </div>
            </div>
            {/* Skeleton Statistics */}
            <div className="flex flex-col gap-16 md:gap-24 animate-pulse">
              <div className="flex items-center gap-12">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="h-6 w-24 bg-gray-200 rounded" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-16 md:p-20 h-[80px]" />
              <div className="grid grid-cols-3 gap-6 md:gap-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl p-10 md:p-20 h-[100px]" />
                ))}
              </div>
            </div>
            {/* Skeleton Member Section */}
            <div className="flex flex-col gap-16 md:gap-24 animate-pulse">
              <div className="flex items-center gap-12">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="bg-gray-50 border border-gray-100 rounded-xl p-20">
                    <div className="flex items-start gap-16">
                      <div className="w-[60px] h-[60px] rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-8">
                        <div className="h-5 w-24 bg-gray-200 rounded" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !data || totalCount === 0 ? (
          <div className="text-center py-60">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-16"/>
            <p className="text-lg font-semibold text-gray-600 mb-8">No Alumni Yet</p>
            <p className="text-gray-400">Alumni information will be displayed here once available.</p>
          </div>
        ) : (
          <div className="space-y-48">
            {/* Stats Summary */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button onClick={() => setStatsExpanded(!statsExpanded)} className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                  <span className="w-8 h-8 rounded-full bg-primary" />
                  Overview
                </h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${statsExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {statsExpanded && (
              <div className="flex flex-col gap-16 md:gap-24 p-20 md:p-24 border-t border-gray-100">
              {/* Total - Full width, centered */}
              <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center justify-center">
                  <Users className="size-20 md:size-24 mb-6" style={{color: '#D6B14D'}} />
                  <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{totalCount}</span>
                  <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total Alumni</span>
                </div>
              </div>
              
              {/* 3 Categories - 3 columns on desktop, stacked on mobile */}
              <div className="grid grid-cols-3 gap-6 md:gap-12">
                <div className="group relative bg-white border border-gray-100 rounded-2xl p-10 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                  <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col items-center h-full justify-start pt-8">
                    <GraduationCap className="size-16 md:size-20 mb-6" style={{color: '#D6B14D'}} />
                    <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#D6B14D'}}>{phdCount}</span>
                    <span className="text-[10px] md:text-xs font-medium text-gray-500 text-center leading-tight">Ph.D. Graduates</span>
                  </div>
                </div>
                <div className="group relative bg-white border border-gray-100 rounded-2xl p-10 md:p-20 hover:border-[#C41E3A]/40 hover:shadow-lg hover:shadow-[#C41E3A]/10 transition-all duration-300">
                  <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#C41E3A]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col items-center h-full justify-start pt-8">
                    <BookOpen className="size-16 md:size-20 mb-6" style={{color: '#C41E3A'}} />
                    <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#C41E3A'}}>{msCount}</span>
                    <span className="text-[10px] md:text-xs font-medium text-gray-500 text-center leading-tight">M.S. Graduates</span>
                  </div>
                </div>
                <div className="group relative bg-white border border-gray-100 rounded-2xl p-10 md:p-20 hover:border-[#FFBAC4]/50 hover:shadow-lg hover:shadow-[#FFBAC4]/10 transition-all duration-300">
                  <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#FFBAC4]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col items-center h-full justify-start pt-8">
                    <Lightbulb className="size-16 md:size-20 mb-6" style={{color: '#FFBAC4'}} />
                    <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#FFBAC4'}}>{undergradCount}</span>
                    <span className="text-[10px] md:text-xs font-medium text-gray-500 text-center leading-tight">Former Undergraduate Researchers</span>
                  </div>
                </div>
              </div>
              </div>
              )}
            </section>

            {/* Ph.D. Section */}
            {phdAlumni.length > 0 ? (
              <div className="flex flex-col gap-16 md:gap-24">
                <button
                  onClick={() => setPhdExpanded(!phdExpanded)}
                  className="flex items-center justify-between w-full group"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                    <span className="w-8 h-8 rounded-full" style={{backgroundColor: '#D6B14D'}} />
                    Ph.D. Graduates
                  </h2>
                  <div className="size-32 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    {phdExpanded ? (
                      <ChevronUp size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    )}
                  </div>
                </button>
                
                {phdExpanded && (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full min-w-[700px] table-fixed">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[18%]">Name</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[10%]">Degree</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[32%]">Affiliation</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[16%]">Graduated</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[24%]">Post-Graduation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phdAlumni.map((alumni, idx) => {
                            const isExpanded = expandedAlumni.has(alumni.name)
                            const hasThesis = alumni.thesis && alumni.thesis.phd
                            const alumniNumber = phdAlumni.length - idx
                            
                            return (
                              <React.Fragment key={idx}>
                                <tr 
                                  className={`border-b border-gray-100 hover:bg-[#D6B14D]/5 transition-colors group ${hasThesis ? 'cursor-pointer' : ''}`}
                                  onClick={() => hasThesis && toggleAlumniExpand(alumni.name)}
                                >
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <div className="flex items-center gap-10 md:gap-12">
                                      <div 
                                        className="size-36 md:size-40 rounded-full flex items-center justify-center shrink-0"
                                        style={{background: 'linear-gradient(135deg, rgba(214, 176, 76,0.15) 0%, rgba(214, 176, 76,0.08) 100%)'}}
                                      >
                                        <span className="text-xs md:text-sm font-bold" style={{color: '#D6B14D'}}>{alumniNumber}</span>
                                      </div>
                                      <div className="flex items-center gap-8">
                                        <p className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#D6B14D] transition-colors">
                                          {alumni.nameKo || alumni.name}
                                        </p>
                                        {hasThesis && (
                                          <ChevronDown 
                                            size={14} 
                                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <span className="px-8 md:px-10 py-3 md:py-4 text-[10px] md:text-xs font-bold rounded-full"
                                      style={{backgroundColor: 'rgba(214, 176, 76,0.1)', color: '#D6B14D'}}>
                                      Ph.D.
                                    </span>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16 text-xs md:text-sm text-gray-600">
                                    {getAffiliation(alumni)}
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <span className="inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap">
                                      {getGraduationDate(alumni, 'phd')}
                                    </span>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    {alumni.company ? (
                                      <div className="flex items-center gap-6 text-xs md:text-sm text-gray-600">
                                        <Building2 size={14} style={{color: '#D6B14D'}}/>
                                        <span>{alumni.company}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                                {isExpanded && hasThesis && (
                                  <tr className="bg-gray-50/50">
                                    <td colSpan={5} className="py-16 px-16">
                                      <div className="space-y-12 ml-48">
                                        {Object.entries(alumni.thesis!)
                                          .filter(([deg]) => deg === 'phd')
                                          .map(([deg, thesis]) => (
                                            <div key={deg} className="flex items-start gap-12 p-12 rounded-xl bg-white border border-gray-100">
                                              <FileText size={16} className="shrink-0 mt-2" style={{color: '#D6B14D'}}/>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[10px] md:text-xs font-bold mb-4" style={{color: '#D6B14D'}}>
                                                  Ph.D. Dissertation
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                                                  {thesis.title}
                                                </p>
                                                {thesis.url && (
                                                  <a
                                                    href={thesis.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-4 text-xs text-primary hover:underline mt-8"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <ExternalLink size={12}/>
                                                    View Dissertation
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-8">
                      {phdAlumni.map((alumni, idx) => {
                        const isExpanded = expandedAlumni.has(alumni.name)
                        const hasThesis = alumni.thesis && alumni.thesis.phd
                        const alumniNumber = phdAlumni.length - idx
                        
                        return (
                          <div 
                            key={idx}
                            className={`rounded-xl border border-gray-100 bg-white overflow-hidden ${hasThesis ? 'cursor-pointer' : ''}`}
                            onClick={() => hasThesis && toggleAlumniExpand(alumni.name)}
                          >
                            <div className="px-14 py-12 flex items-center gap-10 bg-gradient-to-r from-amber-50/50 to-white">
                              <div className="size-36 rounded-full flex items-center justify-center shrink-0" style={{background: 'linear-gradient(135deg, rgba(214, 176, 76,0.2) 0%, rgba(214, 176, 76,0.1) 100%)'}}>
                                <span className="text-sm font-bold" style={{color: '#D6B14D'}}>{alumniNumber}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-6">
                                  <p className="text-sm font-bold text-gray-900">{alumni.nameKo || alumni.name}</p>
                                  <span className="px-6 py-1 text-[9px] font-bold rounded-full" style={{backgroundColor: 'rgba(214, 176, 76,0.1)', color: '#D6B14D'}}>
                                    Ph.D.
                                  </span>
                                  {hasThesis && (
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`}/>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{getGraduationDate(alumni, 'phd')}</p>
                              </div>
                            </div>

                            {isExpanded && hasThesis && (
                              <div className="px-14 py-12 border-t border-gray-50">
                                {Object.entries(alumni.thesis!)
                                  .filter(([deg]) => deg === 'phd')
                                  .map(([deg, thesis]) => (
                                    <div key={deg} className="flex items-start gap-8 p-10 rounded-lg bg-gray-50 border border-gray-100">
                                      <FileText size={14} className="shrink-0 mt-1" style={{color: '#D6B14D'}}/>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold mb-4" style={{color: '#D6B14D'}}>Ph.D. Dissertation</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{thesis.title}</p>
                                        {thesis.url && (
                                          <a href={thesis.url} target="_blank" rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-4 text-xs text-primary hover:underline mt-8"
                                            onClick={(e) => e.stopPropagation()}>
                                            <ExternalLink size={12}/> View
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-16 md:gap-24">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                  <span className="w-8 h-8 rounded-full" style={{backgroundColor: '#D6B14D'}} />
                  Ph.D. Graduates
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-white border border-dashed border-gray-200 rounded-2xl p-24 md:p-40">
                </div>
              </div>
            )}

            {/* M.S. Section */}
            {msAlumni.length > 0 ? (
              <div className="flex flex-col gap-16 md:gap-24">
                <button
                  onClick={() => setMsExpanded(!msExpanded)}
                  className="flex items-center justify-between w-full group"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                    <span className="w-8 h-8 rounded-full" style={{backgroundColor: '#C41E3A'}} />
                    M.S. Graduates
                  </h2>
                  <div className="size-32 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    {msExpanded ? (
                      <ChevronUp size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    )}
                  </div>
                </button>
                
                {msExpanded && (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full min-w-[700px] table-fixed">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[18%]">Name</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[10%]">Degree</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[32%]">Affiliation</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[16%]">Graduated</th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[24%]">Post-Graduation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msAlumni.map((alumni, idx) => {
                            const isExpanded = expandedAlumni.has(alumni.name)
                            const hasThesis = alumni.thesis && alumni.thesis.ms
                            const alumniNumber = msAlumni.length - idx
                            
                            return (
                              <React.Fragment key={idx}>
                                <tr 
                                  className={`border-b border-gray-100 hover:bg-[#C41E3A]/5 transition-colors group ${hasThesis ? 'cursor-pointer' : ''}`}
                                  onClick={() => hasThesis && toggleAlumniExpand(alumni.name)}
                                >
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <div className="flex items-center gap-10 md:gap-12">
                                      <div 
                                        className="size-36 md:size-40 rounded-full flex items-center justify-center shrink-0"
                                        style={{background: 'linear-gradient(135deg, rgba(232,135,155,0.2) 0%, rgba(232,135,155,0.1) 100%)'}}
                                      >
                                        <span className="text-xs md:text-sm font-bold" style={{color: '#C41E3A'}}>{alumniNumber}</span>
                                      </div>
                                      <div className="flex items-center gap-8">
                                        <p className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#C41E3A] transition-colors">
                                          {alumni.nameKo || alumni.name}
                                        </p>
                                        {hasThesis && (
                                          <ChevronDown 
                                            size={14} 
                                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <span className="px-8 md:px-10 py-3 md:py-4 text-[10px] md:text-xs font-bold rounded-full"
                                      style={{backgroundColor: 'rgba(196,30,58,0.15)', color: '#C41E3A'}}>
                                      M.S.
                                    </span>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16 text-xs md:text-sm text-gray-600">
                                    {getAffiliation(alumni)}
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <span className="inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap">
                                      {getGraduationDate(alumni, 'ms')}
                                    </span>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    {alumni.company ? (
                                      <div className="flex items-center gap-6 text-xs md:text-sm text-gray-600">
                                        <Building2 size={14} style={{color: '#C41E3A'}}/>
                                        <span>{alumni.company}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                                {isExpanded && hasThesis && (
                                  <tr className="bg-gray-50/50">
                                    <td colSpan={5} className="py-16 px-16">
                                      <div className="space-y-12 ml-48">
                                        {Object.entries(alumni.thesis!)
                                          .filter(([deg]) => deg === 'ms')
                                          .map(([deg, thesis]) => (
                                            <div key={deg} className="flex items-start gap-12 p-12 rounded-xl bg-white border border-gray-100">
                                              <FileText size={16} className="shrink-0 mt-2" style={{color: '#C41E3A'}}/>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[10px] md:text-xs font-bold mb-4" style={{color: '#C41E3A'}}>
                                                  M.S. Thesis
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                                                  {thesis.title}
                                                </p>
                                                {thesis.url && (
                                                  <a
                                                    href={thesis.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-4 text-xs text-primary hover:underline mt-8"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <ExternalLink size={12}/>
                                                    View Thesis
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-8">
                      {msAlumni.map((alumni, idx) => {
                        const isExpanded = expandedAlumni.has(alumni.name)
                        const hasThesis = alumni.thesis && alumni.thesis.ms
                        const alumniNumber = msAlumni.length - idx
                        
                        return (
                          <div 
                            key={idx}
                            className={`rounded-xl border border-gray-100 bg-white overflow-hidden ${hasThesis ? 'cursor-pointer' : ''}`}
                            onClick={() => hasThesis && toggleAlumniExpand(alumni.name)}
                          >
                            <div className="px-14 py-12 flex items-center gap-10 bg-gradient-to-r from-pink-50/50 to-white">
                              <div className="size-36 rounded-full flex items-center justify-center shrink-0" style={{background: 'linear-gradient(135deg, rgba(232,135,155,0.25) 0%, rgba(232,135,155,0.12) 100%)'}}>
                                <span className="text-sm font-bold" style={{color: '#C41E3A'}}>{alumniNumber}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-6">
                                  <p className="text-sm font-bold text-gray-900">{alumni.nameKo || alumni.name}</p>
                                  <span className="px-6 py-1 text-[9px] font-bold rounded-full" style={{backgroundColor: 'rgba(196,30,58,0.15)', color: '#C41E3A'}}>
                                    M.S.
                                  </span>
                                  {hasThesis && (
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`}/>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{getGraduationDate(alumni, 'ms')}</p>
                              </div>
                            </div>

                            {isExpanded && hasThesis && (
                              <div className="px-14 py-12 border-t border-gray-50">
                                {Object.entries(alumni.thesis!)
                                  .filter(([deg]) => deg === 'ms')
                                  .map(([deg, thesis]) => (
                                    <div key={deg} className="flex items-start gap-8 p-10 rounded-lg bg-gray-50 border border-gray-100">
                                      <FileText size={14} className="shrink-0 mt-1" style={{color: '#C41E3A'}}/>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold mb-4" style={{color: '#C41E3A'}}>M.S. Thesis</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">{thesis.title}</p>
                                        {thesis.url && (
                                          <a href={thesis.url} target="_blank" rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-4 text-xs text-primary hover:underline mt-8"
                                            onClick={(e) => e.stopPropagation()}>
                                            <ExternalLink size={12}/> View
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-16 md:gap-24">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                  <span className="w-8 h-8 rounded-full" style={{backgroundColor: '#C41E3A'}} />
                  M.S. Graduates
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-white border border-dashed border-gray-200 rounded-2xl p-24 md:p-40">
                </div>
              </div>
            )}

            {/* Undergraduate Research Students Section - Collapsible */}
            {sortedUndergradAlumni.length > 0 && (
              <div className="flex flex-col gap-16 md:gap-24">
                <button
                  onClick={() => setUndergradExpanded(!undergradExpanded)}
                  className="flex items-center justify-between w-full group"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-12">
                    <span className="w-8 h-8 rounded-full" style={{backgroundColor: '#FFBAC4'}} />
                    Former Undergraduate Researchers
                  </h2>
                  <div className="size-32 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    {undergradExpanded ? (
                      <ChevronUp size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-[#D6B14D]" />
                    )}
                  </div>
                </button>

                {undergradExpanded && (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full min-w-[800px] table-fixed">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[16%] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleUndergradSort('name')}>
                              <div className="flex items-center gap-4">
                                Name
                                {undergradSortKey === 'name' ? (undergradSortDir === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="text-gray-400" />}
                              </div>
                            </th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[8%] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleUndergradSort('cohort')}>
                              <div className="flex items-center gap-4">
                                Cohort
                                {undergradSortKey === 'cohort' ? (undergradSortDir === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="text-gray-400" />}
                              </div>
                            </th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[16%] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleUndergradSort('period')}>
                              <div className="flex items-center gap-4">
                                Period
                                {undergradSortKey === 'period' ? (undergradSortDir === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="text-gray-400" />}
                              </div>
                            </th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[30%] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleUndergradSort('preMajor')}>
                              <div className="flex items-center gap-4">
                                Affiliation (Pre-Internship)
                                {undergradSortKey === 'preMajor' ? (undergradSortDir === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="text-gray-400" />}
                              </div>
                            </th>
                            <th className="py-12 px-16 text-left text-sm font-bold text-gray-900 w-[30%] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleUndergradSort('postPosition')}>
                              <div className="flex items-center gap-4">
                                Affiliation (Post-Internship)
                                {undergradSortKey === 'postPosition' ? (undergradSortDir === 'asc' ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="text-gray-400" />}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedUndergradAlumni.map((alumni, idx) => {
                            const isExpanded = expandedAlumni.has(alumni.name)
                            const hasProjects = alumni.projects && alumni.projects.length > 0
                            const hasChange = hasPositionChange(alumni)
                            
                            return (
                              <React.Fragment key={idx}>
                                <tr 
                                  className={`border-b border-gray-100 hover:bg-[#FFBAC4]/10 transition-colors group ${hasProjects ? 'cursor-pointer' : ''}`}
                                  onClick={() => hasProjects && toggleAlumniExpand(alumni.name)}
                                >
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <div className="flex items-center gap-10 md:gap-12">
                                      <AlumniAvatar />
                                      <div className="flex items-center gap-8">
                                        <p className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#FFBAC4] transition-colors">{alumni.name}</p>
                                        {hasProjects && (
                                          <ChevronDown 
                                            size={14} 
                                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <div className="group/tooltip relative inline-block">
                                      <span className="px-10 md:px-12 py-4 md:py-5 text-[10px] md:text-xs font-bold rounded-full inline-block w-fit cursor-default transition-all duration-200 group-hover/tooltip:shadow-md" style={{backgroundColor: 'rgba(255,183,197,0.15)', color: '#C41E3A'}}>
                                        {alumni.cohort || '-'}
                                      </span>
                                      {alumni.cohortName && (
                                        <div className="absolute left-0 top-full mt-6 px-12 py-6 bg-gray-900 text-white text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10 shadow-lg">
                                          {alumni.cohortName.match(/\(([^)]+)\)/)?.[1] || alumni.cohortName}
                                          <div className="absolute left-4 bottom-full w-0 h-0 border-l-5 border-r-5 border-b-5 border-transparent border-b-gray-900" />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    <span className="inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap">
                                      {alumni.periods?.ur || '-'}
                                    </span>
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    {getAffiliation(alumni)}
                                  </td>
                                  <td className="py-12 md:py-16 px-12 md:px-16">
                                    {hasChange ? renderCurrentPosition(alumni.currentPosition) : getAffiliation(alumni)}
                                  </td>
                                </tr>
                                {isExpanded && hasProjects && (
                                  <tr className="bg-gray-50/50">
                                    <td colSpan={5} className="py-16 px-16">
                                      <div className="ml-48 flex items-start gap-16 p-16 rounded-xl bg-white border border-gray-100">
                                        {/* Photo - 3.5:4.5 ratio */}
                                        <AlumniPhoto nameEn={alumni.nameEn} baseUrl={baseUrl} />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-8 mb-10">
                                            <FileText size={14} className="shrink-0" style={{color: '#FFBAC4'}}/>
                                            <p className="text-xs font-bold" style={{color: '#C41E3A'}}>
                                              Research Projects
                                            </p>
                                          </div>
                                          <ul className="space-y-4">
                                            {[...alumni.projects!].sort((a, b) => {
                                              const nameA = typeof a === 'object' ? a.en : a
                                              const nameB = typeof b === 'object' ? b.en : b
                                              return nameA.localeCompare(nameB)
                                            }).map((project, pIdx) => {
                                              const isObject = typeof project === 'object'
                                              return (
                                                <li key={pIdx} className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed flex items-start gap-6">
                                                  <span className="text-[#FFBAC4] mt-1">•</span>
                                                  <span>{isObject ? project.en : project}</span>
                                                </li>
                                              )
                                            })}
                                          </ul>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-8">
                      {sortedUndergradAlumni.map((alumni, idx) => {
                        const isExpanded = expandedAlumni.has(alumni.name)
                        const hasProjects = alumni.projects && alumni.projects.length > 0
                        
                        return (
                          <div 
                            key={idx}
                            className={`rounded-xl border border-gray-100 bg-white overflow-hidden group ${hasProjects ? 'cursor-pointer' : ''}`}
                            onClick={() => hasProjects && toggleAlumniExpand(alumni.name)}
                          >
                            {/* Card Header */}
                            <div className="px-14 py-12 flex items-center gap-10 bg-gradient-to-r from-pink-50/50 to-white">
                              <AlumniAvatar size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-6">
                                  <p className="text-sm font-bold text-gray-900">{alumni.name}</p>
                                  <span className="px-6 py-1 text-[9px] font-bold rounded-full" style={{backgroundColor: 'rgba(255,183,197,0.15)', color: '#C41E3A'}}>
                                    {alumni.cohort || '-'}
                                  </span>
                                  {hasProjects && (
                                    <ChevronDown 
                                      size={14} 
                                      className={`text-gray-400 transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{alumni.periods?.ur || '-'}</p>
                              </div>
                            </div>

                            {/* Project Section */}
                            {isExpanded && hasProjects && (
                              <div className="px-14 py-12 border-t border-gray-50">
                                <div className="flex items-start gap-12 p-12 rounded-lg bg-gray-50 border border-gray-100">
                                  {/* Photo - 3.5:4.5 ratio */}
                                  <AlumniPhoto nameEn={alumni.nameEn} baseUrl={baseUrl} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-6 mb-8">
                                      <FileText size={12} className="shrink-0" style={{color: '#FFBAC4'}}/>
                                      <p className="text-[10px] font-bold" style={{color: '#C41E3A'}}>Research Projects</p>
                                    </div>
                                    <ul className="space-y-3">
                                      {[...alumni.projects!].sort((a, b) => {
                                        const nameA = typeof a === 'object' ? a.en : a
                                        const nameB = typeof b === 'object' ? b.en : b
                                        return nameA.localeCompare(nameB)
                                      }).map((project, pIdx) => {
                                        const isObject = typeof project === 'object'
                                        return (
                                          <li key={pIdx} className="text-xs text-gray-700 leading-relaxed flex items-start gap-4">
                                            <span className="text-[#FFBAC4] mt-0.5">•</span>
                                            <span>{isObject ? project.en : project}</span>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(MembersAlumniTemplate)
