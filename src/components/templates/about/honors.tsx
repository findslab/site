import { memo, useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Award, Trophy, Medal, Home, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import type { HonorsData, HonorItem } from '@/types/data'

// Image Imports
import banner1 from '@/assets/images/banner/1.webp'

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

// Format date from "Dec 5" to "MM-DD" format, or handle date ranges
const formatDate = (dateStr: string, year?: string): string => {
  // Check if it's a date range format like "2018-02-26 – 2020-02-28"
  if (dateStr.includes('–') && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateStr.split('–').map(s => s.trim())
    const startYear = parts[0].substring(0, 4)
    const endYear = parts[1].substring(0, 4)
    const startMonth = parts[0].substring(5, 7)
    const endMonth = parts[1].substring(5, 7)
    if (startYear === endYear) {
      return `${startMonth} – ${endMonth}`
    }
    return `${startYear}-${startMonth} – ${endYear}-${endMonth}`
  }
  
  const monthMap: Record<string, string> = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  }
  const parts = dateStr.split(' ')
  if (parts.length === 2) {
    const month = monthMap[parts[0]] || '00'
    const day = parts[1].padStart(2, '0')
    return `${month}-${day}`
  }
  return dateStr
}

export const AboutHonorsTemplate = () => {
  const [honorsData, setHonorsData] = useState<HonorsData>({})
  const [selectedTypes, setSelectedTypes] = useState<('honor' | 'award')[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const contentAnimation = useScrollAnimation()

  const filterOptions: { key: 'honor' | 'award'; label: string; color: { bg: string; text: string } }[] = [
    { key: 'honor', label: 'Honors', color: { bg: '#D6B14D', text: '#FFFFFF' } },
    { key: 'award', label: 'Awards', color: { bg: '#AC0E0E', text: '#FFFFFF' } },
  ]

  const handleFilterToggle = (type: 'honor' | 'award') => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

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
    const safeJsonFetch = async (url: string) => {
      const response = await fetch(url)
      const text = await response.text()
      const cleaned = text.replace(/,(\s*[\}\]])/g, '$1')
      return JSON.parse(cleaned)
    }

    safeJsonFetch(`${baseUrl}data/honors.json`)
      .then((data: HonorsData) => {
        // 2025년 6월 14일 이후 데이터만 필터링
        const cutoffDate = new Date('2025-06-14')
        const filteredData: HonorsData = {}
        
        const monthMap: Record<string, number> = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        }
        
        Object.entries(data).forEach(([year, items]) => {
          const yearNum = parseInt(year)
          if (yearNum > 2025) {
            filteredData[year] = items
          } else if (yearNum === 2025) {
            const filtered = items.filter(item => {
              const [monthStr, dayStr] = item.date.split(' ')
              const month = monthMap[monthStr]
              const day = parseInt(dayStr)
              const itemDate = new Date(2025, month, day)
              return itemDate >= cutoffDate
            })
            if (filtered.length > 0) {
              filteredData[year] = filtered
            }
          }
        })
        
        setHonorsData(filteredData)
        // 최근 3개년을 기본으로 펼침
        const currentYear = new Date().getFullYear()
        setExpandedYears(new Set([String(currentYear), String(currentYear - 1), String(currentYear - 2)]))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load honors data:', err)
        setLoading(false)
      })
  }, [])

  const stats = useMemo(() => {
    let honors = 0
    let awards = 0
    Object.values(honorsData).forEach((items) => {
      items.forEach((item) => {
        if (item.type === 'honor') honors++
        else if (item.type === 'award') awards++
      })
    })
    const total = honors + awards
    return {
      total: { label: 'Total', subLabel: '', count: total, icon: Award, color: '#9A7D1F' },
      items: [
        { label: honors === 1 ? 'Honor' : 'Honors', subLabel: 'Honorary Recognition', count: honors, icon: Medal, color: '#D6B14D' },
        { label: awards === 1 ? 'Award' : 'Awards', subLabel: 'Competition Awards', count: awards, icon: Trophy, color: '#AC0E0E' },
      ]
    }
  }, [honorsData])

  const sortedYears = useMemo(() => {
    const years = Object.keys(honorsData)
    // 필터 없을 때만 현재 연도 포함
    const hasFilters = selectedTypes.length > 0 || searchTerm.trim() !== ''
    const currentYear = new Date().getFullYear().toString()
    if (!hasFilters && !years.includes(currentYear)) {
      years.push(currentYear)
    }
    return years.sort((a, b) => Number(b) - Number(a))
  }, [honorsData, selectedTypes, searchTerm])

  const getFilteredItems = (items: HonorItem[]) => {
    let filtered = items || []
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item) => selectedTypes.includes(item.type))
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((item) => 
        item.title.toLowerCase().includes(term) ||
        (item.organization && item.organization.toLowerCase().includes(term)) ||
        (item.event && item.event.toLowerCase().includes(term))
      )
    }
    return filtered
  }

  const getYearCount = (year: string) => {
    return getFilteredItems(honorsData[year] || []).length
  }

  // Total count for display
  const totalItems = Object.values(honorsData).flat().length
  const filteredTotalItems = sortedYears.reduce((acc, year) => acc + getFilteredItems(honorsData[year] || []).length, 0)
  const hasActiveFilters = selectedTypes.length > 0 || searchTerm.trim() !== ''

  // Get year stats for display like Publications
  const getYearStats = (year: string) => {
    const items = honorsData[year] || []
    const honors = items.filter(item => item.type === 'honor').length
    const awards = items.filter(item => item.type === 'award').length
    return { honors, awards }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Banner - Introduction과 동일한 스타일 */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{ backgroundImage: `url(${banner1})` }}
        />
        
        {/* Luxurious Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-[#D6A076]/30" />
        <div className="absolute inset-0" style={{backgroundColor: 'rgba(214, 177, 77, 0.08)'}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D6B14D]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Floating Accent */}
        <div className="absolute top-1/4 right-[15%] w-32 h-32 rounded-full bg-[#D6B14D]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-20">
          <div className="flex items-center gap-8 mb-16 md:mb-20">
            <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-[#D6B14D]/80" />
            <span className="text-[#D6C360]/90 text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase">
              About FINDS
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Honors & Awards
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
            <span className="text-sm text-gray-400 font-medium">About FINDS</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Honors & Awards</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 py-40 md:py-60 pb-60 md:pb-[80px]"
      >
        {/* Overview Section */}
        <section className={`bg-white border border-gray-100 rounded-2xl overflow-hidden mb-24 md:mb-[40px] transition-opacity duration-500 ${loading ? 'opacity-60' : 'opacity-100'}`}>
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
              <stats.total.icon className="size-20 md:size-24 mb-6" style={{color: stats.total.color, opacity: 0.7}} />
              <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: stats.total.color}}>{stats.total.count}</span>
              <span className="text-xs md:text-sm font-medium text-gray-600">{stats.total.label}</span>
            </div>
          </div>

          {/* Honors & Awards - 2 columns */}
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            {stats.items.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 transition-all duration-300"
                style={{
                  ['--hover-color' as string]: stat.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${stat.color}40`
                  e.currentTarget.style.boxShadow = `0 10px 15px -3px ${stat.color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div className="absolute top-0 left-16 right-16 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{background: `linear-gradient(to right, ${stat.color}99, transparent)`}} />
                <div className="flex flex-col items-center text-center pt-8">
                  <stat.icon className="size-16 md:size-20 mb-6" style={{color: stat.color, opacity: 0.7}} />
                  <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: stat.color}}>{stat.count}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
          )}
        </section>

        {/* Filter & Search - Unified Design */}
        <div className="mb-20 md:mb-[30px]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 md:gap-20 relative z-30">
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-8 px-12 md:px-16 py-12 md:py-16 border rounded-xl text-sm md:text-base transition-all ${
                  isFilterOpen || selectedTypes.length > 0 ? 'bg-primary/5 border-primary text-primary font-medium' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}>
                Filters <SlidersHorizontal className="size-16 md:size-20" />
              </button>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute top-[calc(100%+12px)] left-0 w-[calc(100vw-32px)] sm:w-[400px] max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-20 p-20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Filters</h3>
                        <button onClick={() => setIsFilterOpen(false)} className="size-28 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div className="flex flex-col gap-12">
                        <h4 className="text-sm font-bold text-gray-500">Type</h4>
                        <div className="flex flex-wrap gap-8">
                          {filterOptions.map((opt) => {
                            const isActive = selectedTypes.includes(opt.key)
                            return (
                              <button key={opt.key} onClick={() => handleFilterToggle(opt.key)}
                                className="px-12 md:px-16 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border"
                                style={isActive ? { backgroundColor: opt.color.bg, borderColor: opt.color.bg, color: opt.color.text, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: 'white', borderColor: '#f0f0f0', color: '#7f8894' }}
                              >{opt.label}</button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-end pt-16 border-t border-gray-100">
                        <button onClick={() => setSelectedTypes([])} className="px-16 py-8 text-sm font-medium text-gray-400 hover:text-primary transition-colors">Reset all filters</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 flex items-center px-12 md:px-16 py-12 md:py-16 bg-white border border-gray-100 rounded-xl focus-within:border-primary transition-colors">
              <input type="text" placeholder="Search by title, organization..." className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredTotalItems} of {totalItems}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-8 mt-12">
              {selectedTypes.map((type) => {
                const opt = filterOptions.find(o => o.key === type)
                return opt ? (
                  <button key={type} onClick={() => handleFilterToggle(type)} className="flex items-center gap-4 px-10 py-4 rounded-full text-xs font-medium border transition-all hover:opacity-70" style={{ backgroundColor: `${opt.color.bg}15`, borderColor: `${opt.color.bg}30`, color: opt.color.bg }}>
                    {opt.label} <span className="text-[10px]">✕</span>
                  </button>
                ) : null
              })}
              <button onClick={() => { setSelectedTypes([]); setSearchTerm('') }} className="text-xs text-gray-400 hover:text-primary transition-colors ml-4">Clear all</button>
            </div>
          )}
        </div>

        {/* List by Year */}
        {loading ? (
          <div className="flex flex-col gap-12 md:gap-[16px]">
            {/* Centered Spinner */}
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
              </div>
            </div>
            {/* Skeleton Loading - 3 year cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-100 rounded-xl md:rounded-[20px] overflow-hidden shadow-sm animate-pulse">
                <div className="bg-gray-50 px-16 md:px-[24px] py-16 md:py-[20px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-12 md:gap-[16px]">
                      <div className="h-6 md:h-7 w-14 md:w-16 bg-gray-200 rounded" />
                      <div className="flex gap-4">
                        <div className="h-5 w-10 bg-gray-200 rounded-full" />
                        <div className="h-5 w-10 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                    <div className="h-5 w-5 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedYears.length > 0 ? (
          <div className="flex flex-col gap-12 md:gap-[16px]">
            {sortedYears.map((year) => {
              const filteredItems = getFilteredItems(honorsData[year])
              const yearCount = getYearCount(year)
              const currentYear = new Date().getFullYear()
              const isCurrentYear = Number(year) === currentYear
              const hasFiltersActive = selectedTypes.length > 0 || searchTerm.trim() !== ''

              // 필터 없을 때: 현재 연도는 빈 상태도 표시. 필터 있을 때: 빈 연도 숨김
              if (yearCount === 0 && (hasFiltersActive || !isCurrentYear)) return null

              return (
                <div key={year} className={`border rounded-xl md:rounded-[20px] overflow-hidden shadow-sm ${isCurrentYear ? 'border-[#D6C360]' : 'border-gray-100'}`}>
                  <button
                    onClick={() => toggleYear(year)}
                    className={`w-full flex items-center justify-between px-16 md:px-[24px] py-16 md:py-[20px] transition-colors ${
                      isCurrentYear 
                        ? 'bg-[#FFF3CC] hover:bg-[#FFEB99]' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-12 md:gap-[16px] flex-wrap">
                      <span className={`text-lg md:text-[20px] font-bold ${isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-800'}`}>{year}</span>
                      {/* White badge with counts - always show both */}
                      <span className="px-10 md:px-12 py-4 md:py-5 bg-white rounded-full text-[10px] md:text-xs font-medium shadow-sm">
                        {(() => {
                          const yearStats = getYearStats(year)
                          return (
                            <>
                              <span className="font-bold" style={{color: '#D6B14D'}}>{yearStats.honors}</span>
                              <span className="text-gray-500"> {yearStats.honors === 1 ? 'Honor' : 'Honors'}</span>
                              <span className="text-gray-300"> · </span>
                              <span className="font-bold" style={{color: '#AC0E0E'}}>{yearStats.awards}</span>
                              <span className="text-gray-500"> {yearStats.awards === 1 ? 'Award' : 'Awards'}</span>
                            </>
                          )
                        })()}
                      </span>
                    </div>
                    {expandedYears.has(year) ? (
                      <ChevronUp className="w-16 h-16 md:w-[20px] md:h-[20px] text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-16 h-16 md:w-[20px] md:h-[20px] text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedYears.has(year) && (
                    <div className="flex flex-col">
                      {(!filteredItems || filteredItems.length === 0) ? (
                        <div className="p-24 md:p-32 text-center bg-white border-t border-gray-100">
                          <p className="text-sm md:text-base text-gray-500">아직 등록된 데이터가 없습니다.</p>
                        </div>
                      ) : filteredItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start gap-12 md:gap-[16px] p-16 md:p-[24px] bg-white border-t border-gray-100"
                        >
                          <div
                            className={`w-36 h-36 md:w-[44px] md:h-[44px] rounded-lg md:rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                              item.type === 'honor' ? 'bg-[#FFF3CC]' : 'bg-[#FFBAC4]/20'
                            }`}
                          >
                            {item.type === 'honor' ? (
                              <Medal className="w-18 h-18 md:w-[22px] md:h-[22px] text-[#D6B14D]" />
                            ) : (
                              <Trophy className="w-18 h-18 md:w-[22px] md:h-[22px] text-[#AC0E0E]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Title with date badge at top-right on PC */}
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-12 mb-4 md:mb-[4px]">
                              <h4 className="text-sm md:text-md font-semibold text-gray-800 flex-1">
                                {item.title}
                              </h4>
                              {/* Date badge - top right on PC, same style as Publications */}
                              <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-500 shrink-0 shadow-sm">
                                {item.date.includes('–') && item.date.match(/^\d{4}/) ? formatDate(item.date) : `${year}-${formatDate(item.date)}`}
                              </span>
                            </div>
                            <p className="text-xs md:text-[14px] text-gray-600 mb-4 md:mb-[4px]">{item.event}</p>
                            {/* Organization */}
                            <p className="text-xs md:text-[13px] text-gray-500 font-bold mb-4">{item.organization}</p>
                            {/* Mobile: Date below organization */}
                            <p className="md:hidden text-[10px] text-gray-400 font-medium mb-4">
                              {item.date.includes('–') && item.date.match(/^\d{4}/) ? formatDate(item.date) : `${year}-${formatDate(item.date)}`}
                            </p>
                            {item.winners && item.winners.length > 0 && (
                              <div className="flex flex-wrap items-center gap-6 md:gap-[8px] mt-8 md:mt-[8px]">
                                {item.winners.map((winner, idx) => (
                                  <span
                                    key={idx}
                                    className="px-8 md:px-[10px] py-3 md:py-[4px] bg-gray-100 rounded-full text-[10px] md:text-[12px] text-gray-700 font-semibold"
                                  >
                                    {winner.name}
                                  </span>
                                ))}
                              </div>
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
        ) : (
          <div className="bg-gray-50 rounded-xl md:rounded-[20px] p-40 md:p-[60px] text-center">
            <div className="w-60 h-60 md:w-[80px] md:h-[80px] bg-white rounded-full flex items-center justify-center mx-auto mb-16 md:mb-[20px]">
              <Award className="w-28 h-28 md:w-[40px] md:h-[40px] text-gray-300" />
            </div>
            <p className="text-sm md:text-md text-gray-500">아직 등록된 수상 내역이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(AboutHonorsTemplate)
