import {memo, useState, useEffect, useRef} from 'react'
import {Link} from 'react-router-dom'
import {Home, Calendar, School, Landmark, FlaskConical, Briefcase, ChevronDown, ChevronUp, Folder, TrendingUp, SlidersHorizontal, X, Search, CheckCircle, Factory} from 'lucide-react'
import banner4 from '@/assets/images/banner/4.webp'

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

type Project = {
  titleEn: string
  titleKo: string
  period: string
  fundingAgency: string
  fundingAgencyKo?: string
  amount?: string
  type: 'government' | 'industry' | 'institution' | 'academic'
  language?: 'ko' | 'en'
  roles: {
    principalInvestigator?: string
    leadResearcher?: string | {name: string, lab: boolean}[]
    visitingResearcher?: string
    researchers?: (string | {name: string, lab: boolean})[]
  }
}

const typeConfig = {
  government: {
    icon: Landmark,
    label: 'Government',
    labelShort: 'Gov.',
    labelPlural: 'Government Projects',
    labelKo: '정부과제',
    color: 'bg-[#D6B14D]',
    bgColor: 'bg-[#FFF9E6]',
    borderColor: 'border-[#D6B14D]/30',
    textColor: 'text-[#9A7D1F]',
  },
  industry: {
    icon: School,
    label: 'Industry',
    labelShort: 'Ind.',
    labelPlural: 'Industry Projects',
    labelKo: '산업체과제',
    color: 'bg-[#AC0E0E]',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-[#AC0E0E]',
  },
  institution: {
    icon: School,
    label: 'Institutional',
    labelShort: 'Inst.',
    labelPlural: 'Institutional Projects',
    labelKo: '기관과제',
    color: 'bg-[#E8D688]',
    bgColor: 'bg-[#FFF9E6]',
    borderColor: 'border-[#E8D688]/40',
    textColor: 'text-[#B8962D]',
  },
  academic: {
    icon: Briefcase,
    label: 'Research',
    labelShort: 'Res.',
    labelPlural: 'Research Projects',
    labelKo: '연구과제',
    color: 'bg-[#E8889C]',
    bgColor: 'bg-pink-50',
    borderColor: 'border-[#E8889C]/30',
    textColor: 'text-[#E8889C]',
  },
}

// Filter Modal Component
const FilterModal = ({
  filters,
  onChange,
  onReset,
  onClose,
}: {
  filters: { type: string[]; status: string[] }
  onChange: (key: 'type' | 'status', value: string) => void
  onReset: () => void
  onClose: () => void
}) => {
  const typeOptions = ['government', 'industry', 'institution', 'academic']
  const statusOptions = ['ongoing', 'completed']

  const typeFilterColors: Record<string, { bg: string; text: string }> = {
    government: { bg: '#D6B14D', text: '#FFFFFF' },
    industry: { bg: '#AC0E0E', text: '#FFFFFF' },
    institution: { bg: '#E8D688', text: '#9A7D1F' },
    academic: { bg: '#E8889C', text: '#FFFFFF' },
  }
  const statusFilterColors: Record<string, { bg: string; text: string }> = {
    ongoing: { bg: '#D6B14D', text: '#FFFFFF' },
    completed: { bg: '#8B8B8B', text: '#FFFFFF' },
  }

  return (
    <div className="flex flex-col gap-20 p-20">
      {/* Header with X */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="size-28 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex flex-col gap-12">
        <h4 className="text-sm font-bold text-gray-500">Type</h4>
        <div className="flex flex-wrap gap-8">
          {typeOptions.map((type) => {
            const config = typeConfig[type as keyof typeof typeConfig]
            const isActive = filters.type.includes(type)
            const color = typeFilterColors[type]
            return (
              <button
                key={type}
                onClick={() => onChange('type', type)}
                className="flex items-center gap-6 px-10 md:px-12 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border"
                style={isActive && color ? {
                  backgroundColor: color.bg,
                  borderColor: color.bg,
                  color: color.text,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                } : {
                  backgroundColor: 'white',
                  borderColor: '#f0f0f0',
                  color: '#7f8894'
                }}
              >
                <config.icon size={14} />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-12">
        <h4 className="text-sm font-bold text-gray-500">Status</h4>
        <div className="flex flex-wrap gap-8">
          {statusOptions.map((status) => {
            const isActive = filters.status.includes(status)
            const color = statusFilterColors[status]
            return (
              <button
                key={status}
                onClick={() => onChange('status', status)}
                className="px-10 md:px-12 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border"
                style={isActive && color ? {
                  backgroundColor: color.bg,
                  borderColor: color.bg,
                  color: color.text,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                } : {
                  backgroundColor: 'white',
                  borderColor: '#f0f0f0',
                  color: '#7f8894'
                }}
              >
                {status === 'ongoing' ? 'Ongoing' : 'Completed'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-16 border-t border-gray-100">
        <button
          onClick={onReset}
          className="px-16 py-8 text-sm font-medium text-gray-400 hover:text-primary transition-colors"
        >
          Reset all filters
        </button>
      </div>
    </div>
  )
}

export const ProjectsTemplate = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{ type: string[]; status: string[] }>({
    type: [],
    status: [],
  })
  const contentAnimation = useScrollAnimation()

  const toggleYear = (year: string) => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setExpandedYears(prev => prev.has(year) ? new Set() : new Set([year]))
    } else {
      setExpandedYears(prev => {
        const next = new Set(prev)
        if (next.has(year)) next.delete(year)
        else next.add(year)
        return next
      })
    }
  }

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    fetch(`${baseUrl}data/projects.json`)
      .then((res) => res.json())
      .then((data: Project[]) => {
        // 2025년 6월 14일 이후 시작된 프로젝트만 표시
        const cutoffDate = new Date('2025-06-14')
        
        const filteredProjects = data.filter((p) => {
          const periodParts = p.period.split('–')
          const startDateStr = periodParts[0].trim()
          const startDate = new Date(startDateStr)
          return startDate >= cutoffDate
        })
        setProjects(filteredProjects)
        setLoading(false)
        
        if (filteredProjects.length > 0) {
          const currentYear = new Date().getFullYear()
          setExpandedYears(new Set([String(currentYear), String(currentYear - 1), String(currentYear - 2)]))
        }
      })
      .catch((err) => {
        console.error('Failed to load projects:', err)
        setLoading(false)
      })
  }, [])

  // 검색어나 필터가 있을 때 검색 결과가 있는 모든 연도 펼침
  useEffect(() => {
    if (searchQuery.trim() || filters.type.length > 0 || filters.status.length > 0) {
      const filteredProjs = projects.filter((p) => {
        if (filters.type.length > 0 && !filters.type.includes(p.type)) return false
        if (filters.status.length > 0) {
          const status = getProjectStatus(p.period)
          if (!filters.status.includes(status)) return false
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          const matchesTitle = p.titleEn.toLowerCase().includes(query) || p.titleKo.toLowerCase().includes(query)
          const matchesFunding = p.fundingAgency.toLowerCase().includes(query) || (p.fundingAgencyKo?.toLowerCase() || '').includes(query)
          const matchesPeriod = p.period.includes(query)
          if (!matchesTitle && !matchesFunding && !matchesPeriod) return false
        }
        return true
      })
      const yearsWithResults = [...new Set(filteredProjs.map(p => p.period.split('–')[0].trim().slice(0, 4)))]
      setExpandedYears(new Set(yearsWithResults))
    }
  }, [searchQuery, filters, projects])

  const handleFilterChange = (key: 'type' | 'status', value: string) => {
    setFilters((prev) => {
      const current = prev[key]
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [key]: updated }
    })
  }

  const handleFilterReset = () => {
    setFilters({ type: [], status: [] })
  }

  const getProjectStatus = (period: string): 'ongoing' | 'completed' => {
    const periodParts = period.split('–')
    const endDateStr = periodParts[1]?.trim() || periodParts[0].trim()
    const endDate = new Date(endDateStr)
    const today = new Date()
    return endDate >= today ? 'ongoing' : 'completed'
  }

  const filteredProjects = projects.filter((p) => {
    if (filters.type.length > 0 && !filters.type.includes(p.type)) return false
    if (filters.status.length > 0) {
      const status = getProjectStatus(p.period)
      if (!filters.status.includes(status)) return false
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = p.titleEn.toLowerCase().includes(query) || p.titleKo.toLowerCase().includes(query)
      const matchesFunding = p.fundingAgency.toLowerCase().includes(query) || (p.fundingAgencyKo?.toLowerCase() || '').includes(query)
      const matchesPeriod = p.period.includes(query)
      if (!matchesTitle && !matchesFunding && !matchesPeriod) return false
    }
    return true
  })

  const projectsByYear = filteredProjects.reduce((acc, project) => {
    const year = project.period.split('–')[0].trim().slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  const years = Object.keys(projectsByYear).sort((a, b) => parseInt(b) - parseInt(a))
  const currentYear = new Date().getFullYear().toString()
  const hasActiveFilters = searchQuery.trim() !== '' || filters.type.length > 0 || filters.status.length > 0
  // 필터 없을 때만 현재 연도 포함
  if (!hasActiveFilters && !years.includes(currentYear)) {
    years.unshift(currentYear)
  }

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => getProjectStatus(p.period) === 'ongoing').length,
    completed: projects.filter(p => getProjectStatus(p.period) === 'completed').length,
    government: projects.filter(p => p.type === 'government').length,
    industry: projects.filter(p => p.type === 'industry').length,
    institution: projects.filter(p => p.type === 'institution').length,
    academic: projects.filter(p => p.type === 'academic').length,
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{backgroundImage: `url(${banner4})`}}
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
              Research
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Projects
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
            <span className="text-sm text-gray-400 font-medium">Research</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Projects</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section 
        
        className="py-40 md:py-60 pb-60 md:pb-80 px-16 md:px-20"
      >
        <div className="max-w-1480 mx-auto flex flex-col gap-24 md:gap-40">
          
          {/* Overview Section */}
          <section className={`bg-white border border-gray-100 rounded-2xl overflow-hidden transition-opacity duration-500 ${loading ? 'opacity-60' : 'opacity-100'}`}>
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
                <Folder className="size-20 md:size-24 mb-6" style={{color: '#D6B14D'}} />
                <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{stats.total}</span>
                <span className="text-xs md:text-sm font-medium text-gray-600">Total</span>
              </div>
            </div>

            {/* Funding Source */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funding Source</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <Landmark className="size-16 md:size-20 mb-6" style={{color: '#D6B14D'}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#D6B14D'}}>{stats.government}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">Government</span>
                </div>
              </div>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#AC0E0E]/30 hover:shadow-lg hover:shadow-[#AC0E0E]/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#AC0E0E]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <Factory className="size-16 md:size-20 mb-6" style={{color: '#AC0E0E'}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#AC0E0E'}}>{stats.industry}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">Industry</span>
                </div>
              </div>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8D688]/50 hover:shadow-lg hover:shadow-[#E8D688]/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8D688]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <School className="size-16 md:size-20 mb-6" style={{color: '#E8D688'}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#E8D688'}}>{stats.institution}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">Institutional</span>
                </div>
              </div>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8889C]/50 hover:shadow-lg hover:shadow-[#E8889C]/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8889C]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <FlaskConical className="size-16 md:size-20 mb-6" style={{color: '#E8889C'}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#E8889C'}}>{stats.academic}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">Research</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-8">Status</p>
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-400/40 hover:shadow-lg hover:shadow-gray-400/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-400/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="size-16 md:size-20 mb-6 text-gray-600" />
                  <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 transition-all duration-300">{stats.ongoing}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">Ongoing</span>
                </div>
              </div>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-300/50 hover:shadow-lg hover:shadow-gray-300/10 transition-all duration-300">
                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-300/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="size-16 md:size-20 mb-6 text-gray-500" />
                  <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-500 transition-all duration-300">{stats.completed}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-500">Completed</span>
                </div>
              </div>
            </div>
            </div>
            )}
          </section>

          {/* Filter & Search - Matching Publications Style Exactly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 md:gap-20 relative z-30">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-8 px-12 md:px-16 py-12 md:py-16 border rounded-xl text-sm md:text-base transition-all ${
                  isFilterOpen || filters.type.length > 0 || filters.status.length > 0
                    ? 'bg-primary/5 border-primary text-primary font-medium'
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Filters
                <SlidersHorizontal className="size-16 md:size-20" />
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute top-[calc(100%+12px)] left-0 w-[calc(100vw-32px)] sm:w-[400px] max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <FilterModal
                      filters={filters}
                      onChange={handleFilterChange}
                      onReset={handleFilterReset}
                      onClose={() => setIsFilterOpen(false)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 flex items-center px-12 md:px-16 py-12 md:py-16 bg-white border border-gray-100 rounded-xl focus-within:border-primary transition-colors">
              <input
                type="text"
                placeholder="Search by title, funding agency..."
                className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredProjects.length} of {projects.length}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-8 -mt-8">
              {filters.type.map((type) => {
                const config = typeConfig[type as keyof typeof typeConfig]
                return (
                  <span
                    key={type}
                    className={`flex items-center gap-6 px-12 py-6 ${config.bgColor} ${config.textColor} text-sm font-medium rounded-full`}
                  >
                    {config.label}
                    <button onClick={() => handleFilterChange('type', type)} className="hover:opacity-70">
                      <X size={14} />
                    </button>
                  </span>
                )
              })}
              {filters.status.map((status) => (
                <span
                  key={status}
                  className={`flex items-center gap-6 px-12 py-6 text-sm font-medium rounded-full ${
                    status === 'ongoing' ? 'bg-[#FFF3CC] text-[#B8962D]' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {status === 'ongoing' ? 'Ongoing' : 'Completed'}
                  <button onClick={() => handleFilterChange('status', status)} className="hover:opacity-70">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button
                onClick={handleFilterReset}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Projects by Year */}
          <div className="flex flex-col gap-12 md:gap-20">
            {loading ? (
              <div className="flex flex-col gap-16">
                {/* Centered Spinner */}
                <div className="flex items-center justify-center py-32">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
                  </div>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Skeleton Loading - 3 year rows */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 px-20 md:px-32 py-16 md:py-24 border-b border-gray-100 last:border-b-0 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-12 md:gap-16">
                          <div className="h-7 md:h-8 w-16 md:w-20 bg-gray-200 rounded" />
                          <div className="flex gap-6">
                            <div className="h-5 w-8 bg-gray-200 rounded-full" />
                            <div className="h-5 w-8 bg-gray-200 rounded-full" />
                            <div className="h-5 w-8 bg-gray-200 rounded-full" />
                          </div>
                        </div>
                        <div className="h-5 w-5 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : years.length === 0 ? (
              <div className="text-center py-40 bg-gray-50 rounded-2xl">
                <p className="text-gray-400">No projects found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-16 md:gap-24">
                {years.map((year) => {
                  const yearProjects = projectsByYear[year] || []
                  const isCurrentYear = year === currentYear
                  const isExpanded = expandedYears.has(year)
                  
                  // 필터 있을 때 빈 연도 숨김
                  if (yearProjects.length === 0 && hasActiveFilters) return null
                  
                  // Type별 개수 계산
                  const yearStats = {
                    government: yearProjects.filter(p => p.type === 'government').length,
                    industry: yearProjects.filter(p => p.type === 'industry').length,
                    institution: yearProjects.filter(p => p.type === 'institution').length,
                    academic: yearProjects.filter(p => p.type === 'academic').length,
                  }

                  return (
                    <div key={year} className={`border rounded-2xl overflow-hidden shadow-sm ${isCurrentYear ? 'border-[#D6C360]' : 'border-gray-100'}`}>
                      <button
                        onClick={() => toggleYear(year)}
                        className={`w-full flex items-center justify-between px-20 md:px-24 py-16 md:py-20 transition-colors ${
                          isCurrentYear
                            ? 'bg-[#FFF3CC] hover:bg-[#FFEB99]'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-12 md:gap-[16px] flex-wrap">
                          <span className={`text-lg md:text-[20px] font-bold ${isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-800'}`}>{year}</span>
                          {/* White badge with counts - PC: Full name with "Project" */}
                          <span className="hidden sm:inline-flex px-10 md:px-12 py-4 md:py-5 bg-white rounded-full text-[10px] md:text-xs font-medium shadow-sm">
                            <span className="font-bold" style={{color: '#D6B14D'}}>{yearStats.government}</span>
                            <span className="text-gray-500">&nbsp;Government {yearStats.government === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#AC0E0E'}}>{yearStats.industry}</span>
                            <span className="text-gray-500">&nbsp;Industry {yearStats.industry === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#E8D688'}}>{yearStats.institution}</span>
                            <span className="text-gray-500">&nbsp;Institutional {yearStats.institution === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#E8889C'}}>{yearStats.academic}</span>
                            <span className="text-gray-500">&nbsp;Research {yearStats.academic === 1 ? 'Project' : 'Projects'}</span>
                          </span>
                          {/* Mobile: 1-line format with abbreviations */}
                          <span className="sm:hidden inline-flex px-8 py-4 bg-white rounded-full text-[9px] font-medium shadow-sm">
                            <span className="font-bold" style={{color: '#D6B14D'}}>{yearStats.government}</span>
                            <span className="text-gray-500">&nbsp;Gov.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#AC0E0E'}}>{yearStats.industry}</span>
                            <span className="text-gray-500">&nbsp;Ind.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#E8D688'}}>{yearStats.institution}</span>
                            <span className="text-gray-500">&nbsp;Inst.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold" style={{color: '#E8889C'}}>{yearStats.academic}</span>
                            <span className="text-gray-500">&nbsp;Res.</span>
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-16 h-16 md:w-[20px] md:h-[20px] text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-16 h-16 md:w-[20px] md:h-[20px] text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="flex flex-col">
                          {yearProjects.length === 0 ? (
                            <div className="p-32 md:p-40 text-center bg-white border-t border-gray-100">
                              <p className="text-sm md:text-base text-gray-500">아직 등록된 프로젝트가 없습니다.</p>
                            </div>
                          ) : yearProjects.map((project, idx) => {
                            const config = typeConfig[project.type]
                            const Icon = config?.icon || Briefcase
                            const status = getProjectStatus(project.period)
                            
                            const typeColors: Record<string, string> = {
                              government: 'bg-[#D6B14D]',
                              industry: 'bg-[#AC0E0E]',
                              institution: 'bg-[#E8D688]',
                              academic: 'bg-[#E8889C]',
                            }
                            
                            const typeTextColors: Record<string, string> = {
                              government: 'text-white',
                              industry: 'text-white',
                              institution: 'text-white',
                              academic: 'text-white',
                            }
                            
                            // Filter researchers - handle both string[] and {name, lab}[] formats, show only lab members
                            const filteredResearchers = (project.roles.researchers || [])
                              .filter((r: any) => {
                                const name = typeof r === 'string' ? r : r?.name
                                const isLab = typeof r === 'string' ? true : r?.lab !== false
                                return name && isLab && name !== project.roles.principalInvestigator
                              })
                              .map((r: any) => typeof r === 'string' ? r : r.name) as string[]
                            
                            // Handle leadResearcher - can be string or array of {name, lab}
                            const leadResearcherNames: string[] = (() => {
                              const lr = project.roles.leadResearcher
                              if (!lr) return []
                              if (typeof lr === 'string') return lr.split(', ')
                              if (Array.isArray(lr)) return lr.filter((r: any) => r.lab !== false).map((r: any) => r.name)
                              return []
                            })()
                            
                            return (
                              <div key={idx} className="relative bg-white border-t border-gray-100 hover:bg-gray-50/50 transition-all overflow-hidden">
                                {/* Mobile: Full-width top bar - solid color with Type | Role format */}
                                <div className="md:hidden flex items-center justify-between px-12 py-8 border-b border-gray-50" style={{
                                  background: project.type === 'government' ? '#D6B14D' :
                                    project.type === 'industry' ? '#AC0E0E' :
                                    project.type === 'institution' ? '#E8D688' :
                                    project.type === 'academic' ? '#E8889C' :
                                    '#6B7280'
                                }}>
                                  <div className="flex items-center gap-8">
                                    {/* Type | Role Label */}
                                    <span className={`text-[9px] font-bold tracking-wide ${
                                      project.type === 'institution' ? 'text-white' : 'text-white'
                                    }`}>
                                      {config?.label || project.type} Project
                                    </span>
                                  </div>
                                  {/* Right side: Status badge */}
                                  <span className={`px-8 py-3 rounded text-[9px] font-bold ${
                                    status === 'ongoing' ? 'bg-white/90 text-[#D6B14D]' : 'bg-white/70 text-gray-500'
                                  }`}>
                                    {status === 'ongoing' ? 'Ongoing' : 'Completed'}
                                  </span>
                                </div>
                                
                                <div className="p-16 md:p-24">
                                <div className="flex flex-row items-start gap-12 md:gap-20">
                                  {/* Left: Type Badge - 3-tier design matching Publications w-72 */}
                                  <div className="hidden md:flex flex-col items-center shrink-0 w-72">
                                    <div className="w-full rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                      {/* Top part - Icon with type-matching border and white background */}
                                      <div className={`w-full py-6 flex items-center justify-center bg-white border-b ${
                                        project.type === 'government' ? 'border-[#D6B14D]/30' :
                                        project.type === 'industry' ? 'border-[#AC0E0E]/30' :
                                        project.type === 'institution' ? 'border-[#E8D688]/50' :
                                        project.type === 'academic' ? 'border-[#E8889C]/30' : 'border-gray-200'
                                      }`}>
                                        <Icon size={16} className={`${
                                          project.type === 'government' ? 'text-[#D6B14D]' :
                                          project.type === 'industry' ? 'text-[#AC0E0E]' :
                                          project.type === 'institution' ? 'text-[#B8962D]' :
                                          project.type === 'academic' ? 'text-[#E8889C]' : 'text-gray-400'
                                        }`} />
                                      </div>
                                      {/* Middle part - colored background with type label */}
                                      <div className={`w-full py-6 text-center ${
                                        project.type === 'government' ? 'bg-[#D6B14D]' :
                                        project.type === 'industry' ? 'bg-[#AC0E0E]' :
                                        project.type === 'institution' ? 'bg-[#E8D688]' :
                                        project.type === 'academic' ? 'bg-[#E8889C]' : 'bg-gray-300'
                                      }`}>
                                        <span className={`text-[9px] font-bold tracking-wide ${
                                          project.type === 'institution' ? 'text-white' : 'text-white'
                                        }`}>
                                          {config?.label || project.type} Project
                                        </span>
                                      </div>
                                    </div>
                                    {/* Bottom part - Status badge */}
                                    <div className={`w-full mt-4 py-4 text-center rounded-md ${
                                      status === 'ongoing' ? 'bg-[#FFF9E6] border border-[#FFEB99]' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                      <span className={`text-[9px] font-bold ${
                                        status === 'ongoing' ? 'text-[#D6B14D]' : 'text-gray-400'
                                      }`}>
                                        {status === 'ongoing' ? 'Ongoing' : 'Completed'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Title + Period (Desktop: Period on right) */}
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm md:text-md font-bold text-gray-900 leading-relaxed whitespace-pre-line">{project.titleKo}</p>
                                        <p className="text-xs md:text-sm text-gray-600 mt-4 leading-relaxed whitespace-pre-line">{project.titleEn}</p>
                                      </div>
                                      {/* Period Badge - white background, right aligned */}
                                      <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">
                                        {project.period}
                                      </span>
                                    </div>
                                    
                                    {/* Funding Agency */}
                                    <div className="flex flex-wrap items-center gap-8 mt-8">
                                      <p className="text-xs md:text-sm text-gray-700 font-bold whitespace-pre-line">
                                        {project.language === 'ko' && project.fundingAgencyKo ? project.fundingAgencyKo : project.fundingAgency}
                                      </p>
                                    </div>
                                    
                                    {/* Mobile: Date below FundingAgency - same as Publications */}
                                    <p className="md:hidden text-[10px] text-gray-400 font-medium mt-4">
                                      {project.period}
                                    </p>
                                    
                                    {/* Roles - only show non-empty roles */}
                                    {(project.roles.principalInvestigator || leadResearcherNames.length > 0 || project.roles.visitingResearcher || filteredResearchers.length > 0) && (
                                      <div className="mt-12 pt-12 border-t border-gray-100">
                                        <div className="flex flex-col gap-6">
                                          {/* Principal Investigator - only show if exists */}
                                          {project.roles.principalInvestigator === '최인수' && (
                                            <div className="flex items-center gap-6">
                                              <span className="shrink-0 px-8 py-3 bg-gray-900 text-white text-[9px] md:text-[10px] font-bold rounded-md">
                                                Principal Investigator
                                              </span>
                                              <span className="shrink-0 px-8 py-3 bg-gray-100 text-gray-700 text-[9px] md:text-[10px] font-bold rounded-md">
                                                {project.roles.principalInvestigator}
                                              </span>
                                            </div>
                                          )}
                                          
                                          {/* Lead Researcher - only show lab members */}
                                          {leadResearcherNames.length > 0 && (
                                            <div className="flex items-center gap-6 flex-wrap">
                                              <span className="shrink-0 px-8 py-3 bg-gray-600 text-white text-[9px] md:text-[10px] font-bold rounded-md">
                                                Lead Researcher
                                              </span>
                                              {leadResearcherNames.map((name, ni) => (
                                                <span key={ni} className="shrink-0 px-8 py-3 bg-gray-100 text-gray-700 text-[9px] md:text-[10px] font-bold rounded-md">
                                                  {name}
                                                </span>
                                              ))}
                                            </div>
                                          )}

                                          {/* Visiting Researcher - only show if exists */}
                                          {project.roles.visitingResearcher && (
                                            <div className="flex items-center gap-6">
                                              <span className="shrink-0 px-8 py-3 bg-gray-500 text-white text-[9px] md:text-[10px] font-bold rounded-md">
                                                Visiting Researcher
                                              </span>
                                              <span className="shrink-0 px-8 py-3 bg-gray-100 text-gray-700 text-[9px] md:text-[10px] font-bold rounded-md">
                                                {project.roles.visitingResearcher}
                                              </span>
                                            </div>
                                          )}
                                          
                                          {/* Researchers - only show if non-empty filtered list */}
                                          {filteredResearchers.length > 0 && (
                                            <div className="flex items-center gap-6 flex-wrap">
                                              <span className="shrink-0 px-8 py-3 bg-gray-400 text-white text-[9px] md:text-[10px] font-bold rounded-md">
                                                Researcher
                                              </span>
                                              {filteredResearchers.map((r, ri) => (
                                                <span key={ri} className="shrink-0 px-8 py-3 bg-gray-100 text-gray-700 text-[9px] md:text-[10px] font-bold rounded-md">
                                                  {r}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(ProjectsTemplate)
