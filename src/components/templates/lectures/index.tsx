import { memo, useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Home, Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useStoreModal } from '@/store/modal'
import clsx from 'clsx'

// Image Imports
import banner3 from '@/assets/images/banner/3.webp'
import logoKaist from '@/assets/images/logos/kaist.png'
import logoKyunghee from '@/assets/images/logos/kyunghee.png'
import logoGcu from '@/assets/images/logos/gcu.png'
import logoDwu from '@/assets/images/logos/dwu.png'
import logoKangnam from '@/assets/images/logos/kangnam.png'
import logoKorea from '@/assets/images/logos/korea.png'

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

// School logo mapping
const schoolLogos: Record<string, string> = {
  'KAIST': logoKaist,
  'Kyung Hee University': logoKyunghee,
  'Gachon University': logoGcu,
  'Dongduk Women\'s University': logoDwu,
  'Kangnam University': logoKangnam,
  'Korea University': logoKorea,
}

// Types
type Course = {
  en: string
  ko: string
}

type Lecture = {
  role: string
  periods: string[]
  school: string
  courses: Course[]
}

// 필터 모달 컴포넌트
const FilterModal = ({
  filters,
  options,
  onChange,
  onReset,
  onClose,
}: {
  filters: {
    role: string[]
    school: string[]
    year: string[]
  }
  options: {
    roles: string[]
    schools: string[]
    years: string[]
  }
  onChange: (key: keyof typeof filters, value: string) => void
  onReset: () => void
  onClose: () => void
}) => {
  const sections = [
    { key: 'role' as const, label: 'Role', items: options.roles },
    { key: 'school' as const, label: 'University', items: options.schools },
    { key: 'year' as const, label: 'Year', items: options.years },
  ]

  return (
    <div className="flex flex-col gap-20 p-20">
      {/* Header with X button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="size-28 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {sections.map((section) => (
        <div key={section.key} className="flex flex-col gap-12">
          <h4 className="text-sm font-bold text-gray-500">{section.label}</h4>
          <div className="flex flex-wrap gap-8">
            {section.items.map((item) => {
              const isActive = filters[section.key].includes(item)
              return (
                <button
                  key={item}
                  onClick={() => {
                    onChange(section.key, item)
                  }}
                  className={clsx(
                    'px-12 md:px-16 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border',
                    isActive
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-[#7f8894] border-[#f0f0f0] hover:border-[#D6B14D]/30 hover:bg-gray-50'
                  )}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex justify-end pt-16 border-t border-gray-100">
        <button onClick={onReset} className="px-16 py-8 text-sm font-medium text-gray-400 hover:text-primary transition-colors">
          Reset all filters
        </button>
      </div>
    </div>
  )
}

// 학기를 날짜로 변환
const seasonToDate = (period: string): Date => {
  const basePeriod = period.replace(/-\d+$/, '')
  const [year, season] = basePeriod.split(' ')
  const month = season === 'Winter' ? 1 : season === 'Spring' ? 3 : season === 'Summer' ? 7 : 9
  return new Date(`${year}-${String(month).padStart(2, '0')}-01`)
}

// 분반 번호 추출 (Fall-1 -> 1, Fall -> 0)
const getSectionNumber = (period: string): number => {
  const match = period.match(/-(\d+)$/)
  return match ? parseInt(match[1], 10) : 0
}

export const LecturesTemplate = () => {
  const { showModal } = useStoreModal()
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<{ role: string[]; school: string[]; year: string[] }>({
    role: [],
    school: [],
    year: [],
  })
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const contentAnimation = useScrollAnimation()

  // 데이터 로드
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    fetch(`${baseUrl}data/lectures.json`)
      .then((res) => res.json())
      .then((data) => {
        setLectures(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load lectures:', err)
        setLoading(false)
      })
  }, [])

  // 필터 옵션 추출
  const filterOptions = useMemo(() => {
    const roles = [...new Set(lectures.map((l) => l.role))].sort()
    const schools = [...new Set(lectures.map((l) => l.school))].sort()
    const years = [...new Set(lectures.flatMap((l) => l.periods.map((p) => p.split(' ')[0])))].sort((a, b) => Number(b) - Number(a))
    return { roles, schools, years }
  }, [lectures])

  // 강의를 개별 항목으로 확장
  const expandedLectures = useMemo(() => {
    const items: (Lecture & { course: Course; period: string })[] = []
    lectures.forEach((lecture) => {
      lecture.courses.forEach((course) => {
        items.push({
          ...lecture,
          course,
          period: lecture.periods[0].replace(/-\d+$/, ''),
        })
      })
    })
    return items
  }, [lectures])

  // 필터링 및 검색
  const filteredLectures = useMemo(() => {
    return expandedLectures.filter((item) => {
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = `${item.role} ${item.school} ${item.course.en} ${item.course.ko}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }
      // 역할 필터
      if (filters.role.length > 0 && !filters.role.includes(item.role)) return false
      // 학교 필터
      if (filters.school.length > 0 && !filters.school.includes(item.school)) return false
      // 연도 필터
      if (filters.year.length > 0) {
        const years = item.periods.map((p) => p.split(' ')[0])
        if (!years.some((y) => filters.year.includes(y))) return false
      }
      return true
    })
  }, [expandedLectures, searchQuery, filters])

  // 연도별 그룹화
  const lecturesByYear = useMemo(() => {
    const grouped: Record<string, typeof filteredLectures> = {}
    filteredLectures.forEach((item) => {
      const year = item.period.split(' ')[0]
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(item)
    })
    // 각 연도 내에서 시즌별 정렬 (같은 시즌이면 분반 번호 순)
    Object.keys(grouped).forEach((year) => {
      grouped[year].sort((a, b) => {
        const dateA = seasonToDate(a.period).getTime()
        const dateB = seasonToDate(b.period).getTime()
        if (dateA !== dateB) return dateB - dateA // 최신 시즌 먼저
        // 같은 시즌이면 분반 번호 작은 것 먼저 (1분반 -> 2분반)
        return getSectionNumber(a.period) - getSectionNumber(b.period)
      })
    })
    return grouped
  }, [filteredLectures])

  const sortedYears = useMemo(() => {
    return Object.keys(lecturesByYear).sort((a, b) => Number(b) - Number(a))
  }, [lecturesByYear])

  // 연도별 통계
  const getYearStats = (year: string) => {
    const items = lecturesByYear[year] || []
    const lecturerCount = items.filter((l) => l.role === 'Lecturer').length
    const taCount = items.filter((l) => l.role === 'Teaching Assistant').length
    return { lecturer: lecturerCount, ta: taCount, total: items.length }
  }

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }))
  }

  const handleFilterReset = () => {
    setFilters({ role: [], school: [], year: [] })
    setSearchQuery('')
  }

  // 첫 번째 연도 자동 확장
  useEffect(() => {
    if (sortedYears.length > 0 && expandedYear === null) {
      setExpandedYear(sortedYears[0])
    }
  }, [sortedYears, expandedYear])

  return (
    <div className="flex flex-col bg-white">
      {/* Banner - 통일된 스타일 */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{ backgroundImage: `url(${banner3})` }}
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
              Teaching
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Lectures
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
            <span className="text-sm text-primary font-semibold">Lectures</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 pb-60 md:pb-120"
      >
        {/* Search & Filter - Unified Design */}
        <div className="mb-24 md:mb-32">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 md:gap-20 relative z-30">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-8 px-12 md:px-16 py-12 md:py-16 border rounded-xl text-sm md:text-base transition-all ${
                  isFilterOpen || filters.role.length > 0 || filters.school.length > 0 || filters.year.length > 0
                    ? 'bg-primary/5 border-primary text-primary font-medium'
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Filters
                <SlidersHorizontal className="size-16 md:size-20" />
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute top-[calc(100%+12px)] left-0 w-[calc(100vw-32px)] sm:w-[400px] max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <FilterModal
                      filters={filters}
                      options={filterOptions}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course, university, role..."
                className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0"
              />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredLectures.length} of {expandedLectures.length}
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.role.length > 0 || filters.school.length > 0 || filters.year.length > 0) && (
            <div className="flex flex-wrap items-center gap-8 mt-12">
              {[...filters.role.map(r => ({ label: r, key: 'role' as const })), ...filters.school.map(s => ({ label: s, key: 'school' as const })), ...filters.year.map(y => ({ label: y, key: 'year' as const }))].map((item) => (
                <button key={`${item.key}-${item.label}`} onClick={() => handleFilterChange(item.key, item.label)} className="flex items-center gap-4 px-10 py-4 rounded-full text-xs font-medium border transition-all hover:opacity-70 bg-primary/5 border-primary/20 text-primary">
                  {item.label} <span className="text-[10px]">✕</span>
                </button>
              ))}
              <button onClick={handleFilterReset} className="text-xs text-gray-400 hover:text-primary transition-colors ml-4">Clear all</button>
            </div>
          )}
        </div>

        {/* Year List */}
        {loading ? (
          <div className="bg-gray-50 rounded-2xl p-60 text-center">
            <p className="text-md text-gray-500">Loading lectures...</p>
          </div>
        ) : sortedYears.length > 0 ? (
          <div className="flex flex-col gap-16">
            {sortedYears.map((year) => {
              const stats = getYearStats(year)
              const items = lecturesByYear[year] || []
              const currentYear = new Date().getFullYear()
              const isCurrentYear = year === String(currentYear)

              return (
                <div key={year} className={clsx('border rounded-2xl overflow-hidden shadow-sm', isCurrentYear ? 'border-[#D6C360]' : 'border-gray-100')}>
                  <button
                    onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                    className={clsx(
                      'w-full flex items-center justify-between px-24 py-20 transition-colors',
                      isCurrentYear ? 'bg-[#FFF3CC] hover:bg-[#FFEB99]' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex flex-col items-start gap-4">
                      <div className="flex items-center gap-12">
                        <span className={clsx('text-lg font-semibold', isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-900')}>{year}</span>
                        {isCurrentYear && <span className="px-8 py-2 bg-[#D6B14D] text-white text-[10px] md:text-xs font-semibold rounded-full">NEW</span>}
                      </div>
                      <span className={clsx('text-base', isCurrentYear ? 'text-[#B8962D]' : 'text-gray-500')}>
                        {stats.lecturer} Lecturer · {stats.ta} Teaching Assistant
                      </span>
                    </div>
                    {expandedYear === year ? <ChevronUp className="size-20 text-gray-500" /> : <ChevronDown className="size-20 text-gray-500" />}
                  </button>

                  {expandedYear === year && (
                    <div className="flex flex-col">
                      {items.length === 0 ? (
                        <div className="p-32 md:p-40 text-center bg-white border-t border-gray-100">
                          <p className="text-sm md:text-base text-gray-500">등록된 강의가 없습니다.</p>
                        </div>
                      ) : (
                        items.map((item, idx) => {
                          const isLecturer = item.role === 'Lecturer'
                          return (
                            <div key={idx} className="p-20 md:p-24 bg-white border-t border-gray-100">
                              <div className="flex flex-col md:flex-row md:items-start gap-16 md:gap-20">
                                {/* Left: Role Badge */}
                                <div className="flex flex-col items-center shrink-0 w-60 md:w-80">
                                  <div
                                    className={clsx(
                                      'w-full py-8 md:py-10 rounded-lg text-center',
                                      isLecturer ? 'bg-[#D6B14D]' : 'bg-red-500'
                                    )}
                                  >
                                    <span className="text-xs md:text-sm font-bold text-white">{isLecturer ? 'L' : 'TA'}</span>
                                  </div>
                                </div>

                                {/* Middle: Content */}
                                <div className="flex-1 min-w-0">
                                  {/* School & Role Badges */}
                                  <div className="flex flex-wrap items-center gap-6 mb-8">
                                    <span
                                      className={clsx(
                                        'inline-flex items-center gap-6 px-8 py-4 rounded-md text-[10px] md:text-xs font-bold border',
                                        isLecturer ? 'bg-white text-[#D6B14D] border-[#FFF9E6]' : 'bg-white text-red-600 border-red-200'
                                      )}
                                    >
                                      {schoolLogos[item.school] && (
                                        <img loading="lazy" decoding="async" src={schoolLogos[item.school]} alt={item.school} className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                                      )}
                                      {item.school}
                                    </span>
                                    <span
                                      className={clsx(
                                        'px-8 py-4 rounded-md text-[10px] md:text-xs font-bold',
                                        isLecturer ? 'bg-[#FFF3CC] text-[#B8962D]' : 'bg-red-100 text-red-700'
                                      )}
                                    >
                                      {item.role}
                                    </span>
                                  </div>

                                  {/* Periods */}
                                  <div className="flex flex-wrap gap-4 mb-10">
                                    {item.periods.map((period, pIdx) => (
                                      <span key={pIdx} className="px-8 py-4 bg-gray-100 border border-gray-200 rounded-md text-[10px] md:text-xs font-medium text-gray-600">
                                        {period}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Course Title */}
                                  <h4 className="text-sm md:text-base font-bold text-gray-900 leading-relaxed">{item.course.en}</h4>
                                  <p className="text-xs md:text-base text-gray-500 mt-4">{item.course.ko}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-60 text-center">
            <p className="text-md text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default memo(LecturesTemplate)
