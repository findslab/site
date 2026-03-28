import { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Home,
  FileText,
  MessageSquare,
  BookMarked,
  FileCheck,
  BarChart3,
  Copy,
  Check,
  Calendar,
} from 'lucide-react'
import { useStoreModal } from '@/store/modal'
import type { Publication, AuthorsData } from '@/types/data'

// Image Imports
import banner3 from '@/assets/images/banner/3.webp'

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

// Color map for filter options - matches actual badge/rendering colors
const pubFilterColors: Record<string, { bg: string; border: string; text: string }> = {
  'Journal': { bg: '#D6B14D', border: '#D6B14D', text: '#FFFFFF' },
  'Conference': { bg: '#AC0E0E', border: '#AC0E0E', text: '#FFFFFF' },
  'Book': { bg: '#E8D688', border: '#E8D688', text: '#9A7D1F' },
  'Report': { bg: '#FFBAC4', border: '#FFBAC4', text: '#9A7D1F' },
  'SCIE': { bg: '#D6B14D', border: '#D6B14D', text: '#FFFFFF' },
  'SSCI': { bg: '#D6B14D', border: '#D6B14D', text: '#FFFFFF' },
  'A&HCI': { bg: '#D6B14D', border: '#D6B14D', text: '#FFFFFF' },
  'ESCI': { bg: '#D6C360', border: '#D6C360', text: '#FFFFFF' },
  'Scopus': { bg: '#D6C360', border: '#D6C360', text: '#FFFFFF' },
  'Other International': { bg: '#E8D688', border: '#E8D688', text: '#9A7D1F' },
  'KCI': { bg: '#64748b', border: '#64748b', text: '#FFFFFF' },
  'Other Domestic': { bg: '#94a3b8', border: '#94a3b8', text: '#FFFFFF' },
  'Preprint': { bg: '#8B8B8B', border: '#8B8B8B', text: '#FFFFFF' },
  'International Conference': { bg: '#AC0E0E', border: '#AC0E0E', text: '#FFFFFF' },
  'Domestic Conference': { bg: '#E8889C', border: '#E8889C', text: '#FFFFFF' },
  'Oral': { bg: '#D6B14D', border: '#D6B14D', text: '#FFFFFF' },
  'Poster': { bg: '#D6C360', border: '#D6C360', text: '#FFFFFF' },
}

// 필터 모달 컴포넌트
const FilterModal = ({
  filters,
  onChange,
  onReset,
  onClose
}: {
  filters: {
    type: string[];
    indexing: string[];
    conference: string[];
    presentation: string[];
  };
  onChange: (key: keyof typeof filters, value: string) => void;
  onReset: () => void;
  onClose: () => void;
}) => {
  // Color map for filter options - matches actual badge/rendering colors (module-level reference)
  const colors = pubFilterColors

  const sections = [
    {
      key: 'type' as const,
      label: 'Publication Type',
      options: ['Journal', 'Conference', 'Book', 'Report']
    },
    {
      key: 'indexing' as const,
      label: 'Journal Indexing',
      options: ['SCIE', 'SSCI', 'A&HCI', 'ESCI', 'Scopus', 'Other International', 'KCI', 'Other Domestic', 'Preprint']
    },
    {
      key: 'conference' as const,
      label: 'Conference',
      options: ['International Conference', 'Domestic Conference']
    },
    {
      key: 'presentation' as const,
      label: 'Presentation Type',
      options: ['Oral', 'Poster']
    }
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
        <div key={section.key} className="flex flex-col gap-16">
          <h4 className="text-sm font-bold text-gray-500">{section.label}</h4>
          <div className="flex flex-wrap gap-8">
            {section.options.map((option) => {
              const isActive = filters[section.key].includes(option)
              const color = colors[option]
              return (
                <button
                  key={option}
                  onClick={() => onChange(section.key, option)}
                  className={`px-12 md:px-16 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border`}
                  style={isActive && color ? {
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    color: color.text,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  } : {
                    backgroundColor: 'white',
                    borderColor: '#f0f0f0',
                    color: '#7f8894'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && color) {
                      e.currentTarget.style.borderColor = `${color.border}50`
                      e.currentTarget.style.backgroundColor = '#fafafa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#f0f0f0'
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
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

// 인용 모달 컴포넌트
const CitationModal = ({ citation }: { citation: Publication['citations'] }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (text: string, key: string) => {
    // For BibTeX, just copy plain text
    if (key === 'bibtex') {
      await navigator.clipboard.writeText(text)
    } else {
      // For other formats, copy as rich text (HTML) to preserve italics
      try {
        // Create plain text version (strip HTML tags)
        const plainText = text.replace(/<[^>]*>/g, '')
        
        // Create ClipboardItem with both HTML and plain text
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([text], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        })
        await navigator.clipboard.write([clipboardItem])
      } catch {
        // Fallback to plain text if rich text copy fails
        const plainText = text.replace(/<[^>]*>/g, '')
        await navigator.clipboard.writeText(plainText)
      }
    }
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const formats = [
    { key: 'apa', label: 'APA' },
    { key: 'mla', label: 'MLA' },
    { key: 'chicago', label: 'Chicago' },
    { key: 'harvard', label: 'Harvard' },
    { key: 'vancouver', label: 'Vancouver' },
    { key: 'korean', label: 'Korean' },
    { key: 'bibtex', label: 'BibTeX' },
  ]

  return (
    <div className="flex flex-col gap-24 p-24">
      {formats.map((format) => {
        const text = citation[format.key as keyof typeof citation]
        if (!text) return null

        return (
          <div key={format.key} className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-900">{format.label}</span>
              <button
                onClick={() => handleCopy(text, format.key)}
                className="flex items-center gap-4 text-xs font-medium text-primary hover:underline"
              >
                {copiedKey === format.key ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className={`p-16 rounded-xl border text-sm leading-relaxed break-words ${
              format.key === 'bibtex' 
                ? 'bg-gray-900 font-mono text-xs border-gray-700 whitespace-pre-wrap'
                : 'bg-gray-50 text-gray-600 border-gray-100'
            }`}
              style={format.key === 'bibtex' ? {color: '#D6B14D'} : undefined}
              dangerouslySetInnerHTML={format.key !== 'bibtex' ? {__html: text} : undefined}
            >
              {format.key === 'bibtex' ? text : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 저자 역할 데이터
const authorshipRemarks = [
  { symbol: 'P', label: '연구 책임자', subLabel: 'Principal Investigator' },
  { symbol: 'L', label: '총괄 연구원', subLabel: 'Lead Researcher' },
  { symbol: 'R', label: '참여 연구원', subLabel: 'Researcher' },
  { symbol: 'A', label: '지도교수', subLabel: 'Advisor' },
  { symbol: '1', label: '제1저자', subLabel: 'First Author' },
  { symbol: '2', label: '제2저자', subLabel: 'Second Author' },
  { symbol: '3', label: '제3저자', subLabel: 'Third Author' },
  { symbol: '*', label: '교신저자', subLabel: 'Corresponding Author' },
]

export const PublicationsTemplate = () => {
  const [searchParams] = useSearchParams()
  const [publications, setPublications] = useState<Publication[]>([])
  const [authors, setAuthors] = useState<AuthorsData>({})
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('author') || '')
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [filters, setFilters] = useState<{
    type: string[];
    indexing: string[];
    conference: string[];
    presentation: string[];
  }>({
    type: [],
    indexing: [],
    conference: [],
    presentation: [],
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showModal } = useStoreModal()
  const contentAnimation = useScrollAnimation()

  const toggleYear = (year: number) => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      // 모바일: 하나만 펼침
      setExpandedYears(prev => prev.has(year) ? new Set() : new Set([year]))
    } else {
      // PC: 다중 펼침
      setExpandedYears(prev => {
        const next = new Set(prev)
        if (next.has(year)) next.delete(year)
        else next.add(year)
        return next
      })
    }
  }

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const current = prev[key]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }, [])

  const handleFilterReset = useCallback(() => {
    setFilters({ type: [], indexing: [], conference: [], presentation: [] })
  }, [])

  useEffect(() => {
    const safeJsonFetch = async (url: string) => {
      const response = await fetch(url)
      const text = await response.text()
      // Trailing commas 제거 (사람이 작성한 JSON 대응)
      const cleaned = text.replace(/,(\s*[\}\]])/g, '$1')
      return JSON.parse(cleaned)
    }

    const baseUrl = import.meta.env.BASE_URL || '/'
    Promise.all([
      safeJsonFetch(`${baseUrl}data/pubs.json`),
      safeJsonFetch(`${baseUrl}data/authors.json`),
    ])
      .then(([pubsData, authorsData]) => {
        setPublications(pubsData)
        setAuthors(authorsData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load publications data:', err)
        setLoading(false)
      })
  }, [])

  // 타입별 순번 계산 (오래된 것부터 1번, 최신일수록 높은 번호)
  const publicationNumbers = useMemo(() => {
    const numberMap: Record<string, string> = {}
    const typeCounters: Record<string, number> = {
      journal: 0,
      conference: 0,
      book: 0,
      report: 0,
    }
    const typePrefix: Record<string, string> = {
      journal: 'J',
      conference: 'C',
      book: 'B',
      report: 'R',
    }

    // 날짜순 정렬 (오래된 것부터)
    const sorted = [...publications].sort((a, b) => {
      const dateA = new Date(a.published_date).getTime()
      const dateB = new Date(b.published_date).getTime()
      return dateA - dateB
    })

    // 타입별 번호 매기기
    sorted.forEach((pub) => {
      typeCounters[pub.type] = (typeCounters[pub.type] || 0) + 1
      const prefix = typePrefix[pub.type] || pub.type.charAt(0).toUpperCase()
      const key = `${pub.year}-${pub.title}-${pub.published_date}`
      numberMap[key] = `${prefix}${typeCounters[pub.type]}`
    })

    return numberMap
  }, [publications])

  const getPublicationNumber = useCallback((pub: Publication) => {
    const key = `${pub.year}-${pub.title}-${pub.published_date}`
    return publicationNumbers[key] || pub.code_label || ''
  }, [publicationNumbers])

  const statistics = useMemo(() => {
    let journals = 0
    let conferences = 0
    let books = 0
    let reports = 0

    publications.forEach((pub) => {
      if (pub.type === 'journal') journals++
      else if (pub.type === 'conference') conferences++
      else if (pub.type === 'book') books++
      else if (pub.type === 'report') reports++
    })

    return {
      total: { label: 'Total', count: publications.length, icon: BarChart3, color: '#9A7D1F' },
      items: [
        { label: journals === 1 ? 'Journal Paper' : 'Journal Papers', count: journals, icon: FileText, color: '#D6B14D' },
        { label: conferences === 1 ? 'Conference Proceeding' : 'Conference Proceedings', count: conferences, icon: MessageSquare, color: '#AC0E0E' },
        { label: books === 1 ? 'Book' : 'Books', count: books, icon: BookMarked, color: '#E8D688' },
        { label: reports === 1 ? 'Report' : 'Reports', count: reports, icon: FileCheck, color: '#FFBAC4' },
      ]
    }
  }, [publications])

  const getAuthorNames = useCallback(
    (authorIds: number[], authorMarks: string[], language?: string) => {
      const useEnglish = language?.toLowerCase() === 'english'
      return authorIds.map((id, idx) => {
        const author = authors[String(id)]
        const mark = authorMarks[idx] || ''
        if (author) {
          return { name: useEnglish ? author.en : author.ko, mark }
        }
        return { name: `Unknown (${id})`, mark }
      })
    },
    [authors]
  )

  const filteredPublications = useMemo(() => {
    let result = publications

    // 검색어 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((pub) => {
        const titleMatch = pub.title?.toLowerCase().includes(term) || pub.title_ko?.toLowerCase().includes(term)
        const venueMatch = pub.venue?.toLowerCase().includes(term) || pub.venue_ko?.toLowerCase().includes(term)
        const authorMatch = pub.authors?.some((id) => {
          const author = authors[String(id)]
          return author && (author.en.toLowerCase().includes(term) || author.ko.toLowerCase().includes(term))
        })
        return titleMatch || venueMatch || authorMatch
      })
    }

    // 타입 필터링
    if (filters.type.length > 0) {
      result = result.filter((pub) => filters.type.some(t => t.toLowerCase() === pub.type.toLowerCase()))
    }

    // 인덱싱 필터링
    if (filters.indexing.length > 0) {
      result = result.filter((pub) => {
        if (!pub.indexing_group) return false
        return filters.indexing.includes(pub.indexing_group)
      })
    }

    // 컨퍼런스 필터링
    if (filters.conference.length > 0) {
      result = result.filter((pub) => {
        if (!pub.indexing_group) return false
        // International Conference 필터 시 Scopus Conference도 포함
        if (filters.conference.includes('International Conference') && pub.indexing_group === 'Scopus') {
          return true
        }
        return filters.conference.includes(pub.indexing_group)
      })
    }

    // Presentation 타입 필터링
    if (filters.presentation.length > 0) {
      result = result.filter((pub) => {
        if (!pub.presentation_type) return false
        return filters.presentation.some(p => p.toLowerCase() === pub.presentation_type)
      })
    }

    return result
  }, [publications, searchTerm, authors, filters])

  const publicationsByYear = useMemo(() => {
    const grouped: { [year: number]: Publication[] } = {}
    filteredPublications.forEach((pub) => {
      if (!grouped[pub.year]) grouped[pub.year] = []
      grouped[pub.year].push(pub)
    })
    
    // Sort each year's publications by date (newest first), then by number descending for same date
    Object.keys(grouped).forEach((year) => {
      grouped[Number(year)].sort((a, b) => {
        const dateA = new Date(a.published_date).getTime()
        const dateB = new Date(b.published_date).getTime()
        if (dateB !== dateA) return dateB - dateA // Newest first
        // For same date, sort by publication number descending (higher number first)
        const keyA = `${a.year}-${a.title}-${a.published_date}`
        const keyB = `${b.year}-${b.title}-${b.published_date}`
        const numA = publicationNumbers[keyA] || ''
        const numB = publicationNumbers[keyB] || ''
        const extractNum = (s: string) => parseInt(s.replace(/[^\d]/g, '')) || 0
        return extractNum(numB) - extractNum(numA) // Higher number first
      })
    })
    
    return grouped
  }, [filteredPublications, publicationNumbers])

  const sortedYears = useMemo(() => {
    const years = Object.keys(publicationsByYear).map(Number)
    // 필터 없을 때만 현재 연도 포함
    const hasActiveFilters = searchTerm.trim() !== '' || filters.type.length > 0 || filters.indexing.length > 0 || filters.conference.length > 0 || filters.presentation.length > 0
    const currentYear = new Date().getFullYear()
    if (!hasActiveFilters && !years.includes(currentYear)) {
      years.push(currentYear)
    }
    return years.sort((a, b) => b - a)
  }, [publicationsByYear, searchTerm, filters])

  // Timeline 차트용 데이터 (전체 publications 기준, 필터 무관, 2017년부터)
  const yearlyChartData = useMemo(() => {
    const yearMap: { [year: number]: { journal: number; conference: number; book: number; report: number } } = {}
    
    publications.forEach((pub) => {
      if (pub.year < 2017) return // 2017년 이전 데이터 제외
      if (!yearMap[pub.year]) {
        yearMap[pub.year] = { journal: 0, conference: 0, book: 0, report: 0 }
      }
      if (pub.type === 'journal') yearMap[pub.year].journal++
      else if (pub.type === 'conference') yearMap[pub.year].conference++
      else if (pub.type === 'book') yearMap[pub.year].book++
      else if (pub.type === 'report') yearMap[pub.year].report++
    })
    
    const years = Object.keys(yearMap).map(Number).sort((a, b) => a - b)
    
    // 2017년부터 현재 연도까지 모든 연도 포함 (빈 연도도 0으로 표시)
    const currentYear = new Date().getFullYear()
    const startYear = 2017
    const allYears: number[] = []
    for (let y = startYear; y <= Math.max(currentYear, ...years); y++) {
      allYears.push(y)
    }
    
    return allYears.map(year => ({
      year,
      journal: yearMap[year]?.journal || 0,
      conference: yearMap[year]?.conference || 0,
      book: yearMap[year]?.book || 0,
      report: yearMap[year]?.report || 0,
      total: (yearMap[year]?.journal || 0) + (yearMap[year]?.conference || 0) + (yearMap[year]?.book || 0) + (yearMap[year]?.report || 0)
    }))
  }, [publications])

  // 현재 연도를 기본으로 펼침
  useEffect(() => {
    if (sortedYears.length > 0) {
      const currentYear = new Date().getFullYear()
      setExpandedYears(new Set([currentYear]))
    }
  }, [sortedYears])

  // 검색어가 있을 때 검색 결과가 있는 모든 연도 펼침
  useEffect(() => {
    if (searchTerm.trim()) {
      const yearsWithResults = Object.keys(publicationsByYear).map(Number)
      setExpandedYears(new Set(yearsWithResults))
    }
  }, [searchTerm, publicationsByYear])

  const getYearStats = useCallback(
    (year: number) => {
      const pubs = publicationsByYear[year] || []
      let journals = 0
      let conferences = 0
      let reports = 0
      let books = 0

      pubs.forEach((pub) => {
        if (pub.type === 'journal') journals++
        else if (pub.type === 'conference') conferences++
        else if (pub.type === 'report') reports++
        else if (pub.type === 'book') books++
      })

      return { journals, conferences, reports, books }
    },
    [publicationsByYear]
  )

  return (
    <div className="flex flex-col bg-white">
      {/* Banner - About FINDS 스타일 */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{ backgroundImage: `url(${banner3})` }}
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
              Research
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Publications
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
            <span className="text-sm text-gray-400 font-medium">Research</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Publications</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
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
                <statistics.total.icon className="size-20 md:size-24 mb-6" style={{color: statistics.total.color, opacity: 0.7}} />
                <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: statistics.total.color}}>{statistics.total.count}</span>
                <span className="text-xs md:text-sm font-medium text-gray-600">{statistics.total.label}</span>
              </div>
            </div>

            {/* Other Stats - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              {statistics.items.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-white border rounded-2xl p-16 md:p-20 transition-all duration-300 hover:shadow-lg"
                  style={{ borderColor: '#f3f4f6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = stat.color + '50'; e.currentTarget.style.boxShadow = `0 10px 15px -3px ${stat.color}15` }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = 'none' }}
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

            {/* Publications Timeline - PC Only */}
            {yearlyChartData.length > 0 && (
              <div className="hidden lg:block mt-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-24 hover:border-[#D6B14D]/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-20">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-8">
                      <Calendar className="size-16 text-primary" />
                      Publication Timeline
                    </h4>
                    <div className="flex items-center gap-16">
                      <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-sm" style={{ backgroundColor: '#D6B14D' }} />
                        <span className="text-[10px] text-gray-500">Journal Papers</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-sm" style={{ backgroundColor: '#AC0E0E' }} />
                        <span className="text-[10px] text-gray-500">Conference Proceedings</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-sm" style={{ backgroundColor: '#E8D688' }} />
                        <span className="text-[10px] text-gray-500">Books</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-sm" style={{ backgroundColor: '#FFBAC4' }} />
                        <span className="text-[10px] text-gray-500">Reports</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="relative h-[200px]">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-24 w-32 flex flex-col justify-between text-[10px] text-gray-400">
                      <span>{Math.max(...yearlyChartData.map(d => d.total))}</span>
                      <span>{Math.round(Math.max(...yearlyChartData.map(d => d.total)) / 2)}</span>
                      <span>0</span>
                    </div>
                    
                    {/* Chart */}
                    <div className="ml-40 h-full flex items-end gap-2 pb-24 border-l border-b border-gray-100">
                      {yearlyChartData.map((data, index) => {
                        const maxTotal = Math.max(...yearlyChartData.map(d => d.total))
                        const heightScale = 160 / maxTotal
                        
                        return (
                          <div key={data.year} className="flex-1 flex flex-col items-center group relative">
                            {/* Stacked Bar */}
                            <div className="w-full max-w-[40px] flex flex-col-reverse">
                              {data.report > 0 && (
                                <div 
                                  className="w-full transition-all duration-300 group-hover:opacity-80"
                                  style={{ 
                                    height: data.report * heightScale,
                                    backgroundColor: '#FFBAC4',
                                    borderRadius: data.journal + data.conference + data.book === 0 ? '4px 4px 0 0' : '0'
                                  }} 
                                />
                              )}
                              {data.book > 0 && (
                                <div 
                                  className="w-full transition-all duration-300 group-hover:opacity-80"
                                  style={{ 
                                    height: data.book * heightScale,
                                    backgroundColor: '#E8D688',
                                    borderRadius: data.journal + data.conference === 0 ? '4px 4px 0 0' : '0'
                                  }} 
                                />
                              )}
                              {data.conference > 0 && (
                                <div 
                                  className="w-full transition-all duration-300 group-hover:opacity-80"
                                  style={{ 
                                    height: data.conference * heightScale,
                                    backgroundColor: '#AC0E0E',
                                    borderRadius: data.journal === 0 ? '4px 4px 0 0' : '0'
                                  }} 
                                />
                              )}
                              {data.journal > 0 && (
                                <div 
                                  className="w-full rounded-t-[4px] transition-all duration-300 group-hover:opacity-80"
                                  style={{ 
                                    height: data.journal * heightScale,
                                    backgroundColor: '#D6B14D'
                                  }} 
                                />
                              )}
                            </div>
                            
                            {/* Year Label */}
                            <span className="text-[9px] text-gray-400 mt-8 group-hover:text-[#D6B14D] transition-colors font-medium">
                              {data.year}
                            </span>
                            
                            {/* Enhanced Tooltip */}
                            <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 scale-95 group-hover:scale-100">
                              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-16 py-14 rounded-xl shadow-2xl border border-gray-700/50 min-w-[220px]">
                                {/* Year header */}
                                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-700/50">
                                  <span className="text-lg font-bold text-primary">{data.year}</span>
                                  <span className="text-xs bg-primary/20 text-primary px-6 py-2 rounded-full font-semibold">{data.total}</span>
                                </div>
                                {/* Stats */}
                                <div className="space-y-6">
                                  {data.journal > 0 && (
                                    <div className="flex items-center justify-between gap-16">
                                      <div className="flex items-center gap-6">
                                        <span className="w-8 h-8 rounded-sm shrink-0" style={{backgroundColor: '#D6B14D'}} />
                                        <span className="text-xs text-gray-300 whitespace-nowrap">Journal Paper</span>
                                      </div>
                                      <span className="text-xs font-bold text-white">{data.journal}</span>
                                    </div>
                                  )}
                                  {data.conference > 0 && (
                                    <div className="flex items-center justify-between gap-16">
                                      <div className="flex items-center gap-6">
                                        <span className="w-8 h-8 rounded-sm shrink-0" style={{backgroundColor: '#AC0E0E'}} />
                                        <span className="text-xs text-gray-300 whitespace-nowrap">Conference Proceeding</span>
                                      </div>
                                      <span className="text-xs font-bold text-white">{data.conference}</span>
                                    </div>
                                  )}
                                  {data.book > 0 && (
                                    <div className="flex items-center justify-between gap-16">
                                      <div className="flex items-center gap-6">
                                        <span className="w-8 h-8 rounded-sm shrink-0" style={{backgroundColor: '#E8D688'}} />
                                        <span className="text-xs text-gray-300 whitespace-nowrap">Book</span>
                                      </div>
                                      <span className="text-xs font-bold text-white">{data.book}</span>
                                    </div>
                                  )}
                                  {data.report > 0 && (
                                    <div className="flex items-center justify-between gap-16">
                                      <div className="flex items-center gap-6">
                                        <span className="w-8 h-8 rounded-sm shrink-0" style={{backgroundColor: '#FFBAC4'}} />
                                        <span className="text-xs text-gray-300 whitespace-nowrap">Report</span>
                                      </div>
                                      <span className="text-xs font-bold text-white">{data.report}</span>
                                    </div>
                                  )}
                                  {data.total === 0 && (
                                    <div className="text-xs text-gray-500 text-center py-4">No publications</div>
                                  )}
                                </div>
                                {/* Arrow */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-900" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            )}
          </section>

          {/* Authorship Remarks Section */}
          <div className="flex flex-col gap-12 md:gap-20">
            <div className="flex items-center gap-8">
              <h2 className="text-xl md:text-[26px] font-bold text-gray-900">Authorship Remarks</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
              {authorshipRemarks.map((item, index) => {
                // FINDS Lab color palette for icons - 모두 gold 계열로 통일
                const color = '#D6B14D'
                const bgColor = 'rgba(214,177,77,0.15)'
                return (
                  <div
                    key={index}
                    className="flex items-center gap-8 md:gap-16 px-12 md:px-20 py-12 md:py-20 bg-white border border-gray-100 rounded-xl md:rounded-2xl shadow-sm hover:border-[#D6B14D]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
                  >
                    <div 
                      className="size-32 md:size-46 flex-shrink-0 rounded-lg flex items-center justify-center"
                      style={{backgroundColor: bgColor}}
                    >
                      <span 
                        className="text-lg md:text-2xl font-bold"
                        style={{color: color}}
                      >
                        {item.symbol}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs md:text-base font-bold text-gray-900">{item.label}</span>
                      <span className="text-[10px] md:text-xs text-gray-500 hidden sm:block">{item.subLabel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 md:gap-20 relative z-30">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-8 px-12 md:px-16 py-12 md:py-16 border rounded-xl text-sm md:text-base transition-all ${
                  isFilterOpen || filters.type.length > 0 || filters.indexing.length > 0 || filters.conference.length > 0 || filters.presentation.length > 0
                    ? 'bg-primary/5 border-primary text-primary font-medium'
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Filters
                <SlidersHorizontal className="size-16 md:size-20" />
              </button>

              {/* Filter Popup */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute top-[calc(100%+12px)] left-0 w-[calc(100vw-32px)] sm:w-[600px] lg:w-[1000px] max-w-[calc(100vw-32px)] bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                placeholder="Search by title, author, venue..."
                className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredPublications.length} of {publications.length}
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.type.length > 0 || filters.indexing.length > 0 || filters.conference.length > 0 || filters.presentation.length > 0) && (
            <div className="flex flex-wrap items-center gap-8 mt-12">
              {[...filters.type, ...filters.indexing, ...filters.conference, ...filters.presentation].map((item) => {
                const color = pubFilterColors[item]
                return (
                  <button key={item} onClick={() => {
                    const section = filters.type.includes(item) ? 'type' : filters.indexing.includes(item) ? 'indexing' : filters.conference.includes(item) ? 'conference' : 'presentation'
                    handleFilterChange(section as keyof typeof filters, item)
                  }} className="flex items-center gap-4 px-10 py-4 rounded-full text-xs font-medium border transition-all hover:opacity-70" style={color ? { backgroundColor: `${color.bg}15`, borderColor: `${color.bg}30`, color: color.bg } : {}}>
                    {item} <span className="text-[10px]">✕</span>
                  </button>
                )
              })}
              <button onClick={handleFilterReset} className="text-xs text-gray-400 hover:text-primary transition-colors ml-4">Clear all</button>
            </div>
          )}

          {/* Year List */}
          {loading ? (
            <div className="flex flex-col gap-16">
              {/* Centered Spinner */}
              <div className="flex items-center justify-center py-32">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
                </div>
              </div>
              {/* Skeleton Loading - 3 year cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="bg-gray-50 px-20 md:px-24 py-16 md:py-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-12 md:gap-16">
                        <div className="h-7 md:h-8 w-16 md:w-20 bg-gray-200 rounded" />
                        <div className="flex gap-6">
                          <div className="h-5 w-12 bg-gray-200 rounded-full" />
                          <div className="h-5 w-12 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                      <div className="h-5 w-5 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedYears.length > 0 ? (
            <div className="flex flex-col gap-16">
              {sortedYears.map((year) => {
                const stats = getYearStats(year)
                const pubs = publicationsByYear[year] || []
                const currentYear = new Date().getFullYear()
                const isCurrentYear = year === currentYear
                const hasFiltersActive = searchTerm.trim() !== '' || filters.type.length > 0 || filters.indexing.length > 0 || filters.conference.length > 0 || filters.presentation.length > 0

                // 필터 있을 때 빈 연도 숨김
                if (pubs.length === 0 && hasFiltersActive) return null

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
                      <div className="flex items-center gap-12 md:gap-16 flex-wrap">
                        <span className={`text-lg md:text-[20px] font-bold ${isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-800'}`}>{year}</span>
                        {/* White badge with counts - desktop */}
                        <span className="hidden sm:inline-flex px-10 md:px-12 py-4 md:py-5 bg-white rounded-full text-[10px] md:text-xs font-medium shadow-sm">
                          <span className="font-bold text-[#D6B14D]">{stats.journals}</span>
                          <span className="text-gray-500">&nbsp;{stats.journals === 1 ? 'Journal Paper' : 'Journal Papers'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#AC0E0E]">{stats.conferences}</span>
                          <span className="text-gray-500">&nbsp;{stats.conferences === 1 ? 'Conference Proceeding' : 'Conference Proceedings'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#E8D688]">{stats.books}</span>
                          <span className="text-gray-500">&nbsp;{stats.books === 1 ? 'Book' : 'Books'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#FFBAC4]">{stats.reports}</span>
                          <span className="text-gray-500">&nbsp;{stats.reports === 1 ? 'Report' : 'Reports'}</span>
                        </span>
                        {/* Mobile: full words */}
                        <span className="sm:hidden inline-flex px-8 py-4 bg-white rounded-full text-[9px] font-medium shadow-sm flex-wrap">
                          <span className="font-bold text-[#D6B14D]">{stats.journals}</span>
                          <span className="text-gray-500">&nbsp;{stats.journals === 1 ? 'Journal Paper' : 'Journal Papers'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#AC0E0E]">{stats.conferences}</span>
                          <span className="text-gray-500">&nbsp;{stats.conferences === 1 ? 'Conference Proceeding' : 'Conference Proceedings'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#E8D688]">{stats.books}</span>
                          <span className="text-gray-500">&nbsp;{stats.books === 1 ? 'Book' : 'Books'}</span>
                          <span className="text-gray-300">&nbsp;·&nbsp;</span>
                          <span className="font-bold text-[#FFBAC4]">{stats.reports}</span>
                          <span className="text-gray-500">&nbsp;{stats.reports === 1 ? 'Report' : 'Reports'}</span>
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
                        {pubs.length === 0 ? (
                          <div className="p-32 md:p-40 text-center bg-white border-t border-gray-100">
                            <p className="text-sm md:text-base text-gray-500">아직 등록된 논문이 없습니다.</p>
                          </div>
                        ) : pubs.map((pub, idx) => {
                          const authorList = getAuthorNames(pub.authors, pub.author_marks, pub.language)
                          const typeLabel = pub.type === 'journal' ? 'Journal' : pub.type === 'conference' ? 'Conference' : pub.type === 'book' ? 'Book' : pub.type === 'report' ? 'Report' : pub.type.charAt(0).toUpperCase() + pub.type.slice(1)
                          const typeColor = pub.type === 'journal'
                            ? 'bg-[#D6B14D]'
                            : pub.type === 'conference'
                            ? 'bg-[#AC0E0E]'
                            : pub.type === 'book'
                            ? 'bg-[#E8D688]'
                            : pub.type === 'report'
                            ? 'bg-[#FFBAC4]'
                            : 'bg-gray-500'

                          return (
                            <div key={idx} className="relative bg-white border-t border-gray-100 overflow-hidden">
                              {/* Mobile: Full-width top bar - solid color */}
                              <div className="md:hidden flex items-center justify-between px-12 py-8 border-b border-gray-50" style={{
                                background: pub.type === 'journal' ? '#D6B14D' :
                                  pub.type === 'conference' ? '#AC0E0E' :
                                  pub.type === 'book' ? '#E8D688' :
                                  pub.type === 'report' ? '#FFBAC4' :
                                  '#6B7280'
                              }}>
                                <div className="flex items-center gap-6">
                                  {/* Type Label */}
                                  <span className={`text-xs font-bold tracking-wide ${
                                    pub.type === 'book' || pub.type === 'report' ? 'text-gray-800' : 'text-white'
                                  }`}>
                                    {typeLabel}
                                  </span>
                                  {/* Divider */}
                                  <span className={`text-[10px] ${pub.type === 'book' || pub.type === 'report' ? 'text-gray-600' : 'text-white/60'}`}>|</span>
                                  {/* Number */}
                                  <span className={`text-xs font-bold ${
                                    pub.type === 'book' || pub.type === 'report' ? 'text-gray-700' : 'text-white/90'
                                  }`}>
                                    {getPublicationNumber(pub)}
                                  </span>
                                  {/* Indexing/Presentation next to number */}
                                  {pub.type === 'journal' && pub.indexing_group && (
                                    <>
                                      <span className="text-[10px] text-white/60">|</span>
                                      <span className="text-xs font-bold text-white/90">
                                        {pub.indexing_group}
                                      </span>
                                    </>
                                  )}
                                  {pub.type === 'conference' && (pub.presentation_type || pub.indexing_group) && (
                                    <>
                                      {pub.indexing_group && (
                                        <>
                                          <span className="text-[10px] text-white/60">|</span>
                                          <span className="text-xs font-bold text-white/90">
                                            {pub.indexing_group === 'Scopus' || pub.indexing_group === 'International Conference' ? 'International' : pub.indexing_group === 'Domestic Conference' ? 'Domestic' : ''}
                                          </span>
                                        </>
                                      )}
                                      {pub.presentation_type && (
                                        <>
                                          <span className="text-[10px] text-white/60">|</span>
                                          <span className="text-xs font-bold text-white/90">
                                            {pub.presentation_type === 'oral' ? 'Oral' : pub.presentation_type === 'poster' ? 'Poster' : ''}
                                          </span>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                                {/* Right side: Cite button */}
                                <button
                                  onClick={() => showModal({
                                    title: 'Citation Formats',
                                    maxWidth: '600px',
                                    children: <CitationModal citation={pub.citations} />
                                  })}
                                  className="px-8 py-3 bg-white/90 rounded text-[10px] font-bold text-gray-700 hover:bg-white transition-colors"
                                >
                                  Cite
                                </button>
                              </div>
                              
                              <div className="p-16 md:p-20 pb-20 md:pb-24">
                                <div className="flex flex-col gap-12 md:gap-16">
                                <div className="flex flex-row items-start gap-16 md:gap-20">
                                  {/* Desktop: Left Type Badge - Split design (top colored, bottom white) */}
                                  <div className="hidden md:flex flex-col items-center shrink-0 w-72">
                                    <div className="w-full rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                      {/* Top part - colored background */}
                                      <div className={`w-full py-6 text-center ${
                                        pub.type === 'journal' ? 'bg-[#D6B14D]' :
                                        pub.type === 'conference' ? 'bg-[#AC0E0E]' :
                                        pub.type === 'book' ? 'bg-[#E8D688]' :
                                        pub.type === 'report' ? 'bg-[#FFBAC4]' : 'bg-gray-500'
                                      }`}>
                                        <span className={`text-[9px] font-bold tracking-wide ${
                                          pub.type === 'book' || pub.type === 'report' ? 'text-gray-800' : 'text-white'
                                        }`}>
                                          {typeLabel}
                                        </span>
                                      </div>
                                      {/* Bottom part - white background with number */}
                                      <div className="w-full py-6 text-center bg-white">
                                        <span className={`text-lg font-bold ${
                                          pub.type === 'journal' ? 'text-[#D6B14D]' :
                                          pub.type === 'conference' ? 'text-[#AC0E0E]' :
                                          pub.type === 'book' ? 'text-[#B8962D]' :
                                          pub.type === 'report' ? 'text-[#E8889C]' : 'text-gray-500'
                                        }`}>
                                          {getPublicationNumber(pub)}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Status badge below - Conference: 2-row design */}
                                    {pub.type === 'conference' && (pub.indexing_group || pub.presentation_type) && (
                                      <div className="w-full mt-4 space-y-2">
                                        {/* Row 1: Domestic/International */}
                                        {pub.indexing_group && (
                                          <div className={`w-full py-3 text-center rounded-md ${
                                            pub.indexing_group === 'International Conference' || pub.indexing_group === 'Scopus' ? 'bg-[#AC0E0E]/10 border border-[#AC0E0E]/30' : 
                                            'bg-[#E8889C]/10 border border-[#E8889C]/30'
                                          }`}>
                                            <span className="text-[9px] font-bold" style={{color: pub.indexing_group === 'International Conference' || pub.indexing_group === 'Scopus' ? '#AC0E0E' : '#E8889C'}}>
                                              {pub.indexing_group === 'Scopus' ? 'International' : pub.indexing_group === 'International Conference' ? 'International' : 'Domestic'}
                                            </span>
                                          </div>
                                        )}
                                        {/* Row 2: Oral/Poster */}
                                        {pub.presentation_type && (
                                          <div className={`w-full py-3 text-center rounded-md ${
                                            pub.presentation_type === 'oral' ? 'bg-[#D6B14D]/10 border border-[#D6B14D]/30' : 'bg-[#D6C360]/10 border border-[#D6C360]/30'
                                          }`}>
                                            <span className="text-[9px] font-bold" style={{color: pub.presentation_type === 'oral' ? '#D6B14D' : '#D6C360'}}>
                                              {pub.presentation_type === 'oral' ? 'Oral' : 'Poster'}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {pub.type === 'journal' && pub.indexing_group && (
                                      <div className={`w-full mt-4 py-4 text-center rounded-md border`}
                                        style={{
                                          backgroundColor: 
                                            ['SCIE', 'SSCI', 'A&HCI'].includes(pub.indexing_group) ? 'rgba(214,177,77,0.1)' :
                                            pub.indexing_group === 'ESCI' || pub.indexing_group === 'Scopus' ? 'rgba(214,195,96,0.1)' :
                                            pub.indexing_group === 'Other International' ? 'rgba(232,214,136,0.15)' :
                                            pub.indexing_group === 'KCI' ? 'rgba(100,116,139,0.08)' : 'rgba(148,163,184,0.08)',
                                          borderColor: 
                                            ['SCIE', 'SSCI', 'A&HCI'].includes(pub.indexing_group) ? 'rgba(214,177,77,0.3)' :
                                            pub.indexing_group === 'ESCI' || pub.indexing_group === 'Scopus' ? 'rgba(214,195,96,0.3)' :
                                            pub.indexing_group === 'Other International' ? 'rgba(232,214,136,0.4)' :
                                            pub.indexing_group === 'KCI' ? 'rgba(100,116,139,0.2)' : 'rgba(148,163,184,0.2)'
                                        }}
                                      >
                                        <span 
                                          className="text-[9px] font-bold"
                                          style={{
                                            color: ['SCIE', 'SSCI', 'A&HCI'].includes(pub.indexing_group) ? '#D6B14D' :
                                              pub.indexing_group === 'ESCI' || pub.indexing_group === 'Scopus' ? '#D6C360' :
                                              pub.indexing_group === 'Other International' ? '#9A7D1F' :
                                              pub.indexing_group === 'KCI' ? '#64748b' : '#94a3b8'
                                          }}
                                        >
                                          {pub.indexing_group}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Middle: Content */}
                                  <div className="flex-1 min-w-0">
                                  {/* Title with date at top-right on PC */}
                                  {(() => {
                                    const isKorean = pub.indexing_group?.includes('KCI') || pub.indexing_group?.includes('Domestic') || pub.language?.toLowerCase() === 'korean'
                                    const mainTitle = isKorean && pub.title_ko ? pub.title_ko : pub.title
                                    const subTitle = isKorean && pub.title_ko ? pub.title : pub.title_ko
                                    return (
                                      <>
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-12 mb-6 md:mb-8">
                                          <h4 className="text-sm md:text-md font-semibold text-gray-800 leading-relaxed flex-1">
                                            {pub.awards !== undefined && pub.awards !== null && pub.awards > 0 && (
                                              <span className="relative inline-block mr-6 group">
                                                <span className="cursor-help">🏆</span>
                                                <span className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 w-max max-w-[280px] px-12 py-8 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-normal">
                                                  <span className="absolute left-4 bottom-full border-4 border-transparent border-b-gray-900"></span>
                                                  {pub.award_details ? (
                                                    <>
                                                      <span className="font-bold text-[#D6B14D]">{pub.award_details.prize_ko || pub.award_details.prize}</span>
                                                      {pub.award_details.category_ko || pub.award_details.category ? (
                                                        <span className="block text-gray-300 mt-1">{pub.award_details.category_ko || pub.award_details.category}</span>
                                                      ) : null}
                                                      <span className="block text-gray-400 mt-1 text-[10px]">{pub.award_details.organization_ko || pub.award_details.organization}</span>
                                                    </>
                                                  ) : (
                                                    <span>Award-winning paper</span>
                                                  )}
                                                </span>
                                              </span>
                                            )}
                                            {mainTitle}
                                          </h4>
                                          {/* Date badge - top right on PC, unified style */}
                                          <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-500 shrink-0 shadow-sm">
                                            {pub.published_date}
                                          </span>
                                        </div>
                                        {subTitle && (
                                          <p className="text-xs md:text-sm text-gray-600 mb-6 md:mb-8">{subTitle}</p>
                                        )}
                                      </>
                                    )
                                  })()}
                                  <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
                                    {authorList.map((author, aIdx) => (
                                      <span key={aIdx} className="text-xs md:text-sm text-gray-600">
                                        {author.name}
                                        {author.mark && (
                                          <sup className="text-primary ml-1">{author.mark}</sup>
                                        )}
                                        {aIdx < authorList.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                  {/* Venue */}
                                  <p className="text-xs md:text-sm text-gray-700 font-bold">
                                    {(pub.indexing_group?.includes('KCI') || pub.indexing_group?.includes('Domestic') || pub.language?.toLowerCase() === 'korean') && pub.venue_ko 
                                      ? pub.venue_ko 
                                      : pub.venue}
                                  </p>
                                  {/* Edition info for books - only show for 2nd edition and above */}
                                  {pub.type === 'book' && pub.edition && pub.edition >= 2 && (
                                    <>
                                      {/* PC: Badge style */}
                                      <div className="hidden md:flex items-center gap-8 mt-6">
                                        <span className="inline-flex items-center gap-6 px-10 py-4 bg-[#FFF9E6] border border-[#E8D688] rounded-full">
                                          <span className="text-[10px] font-bold text-[#9A7D1F]">
                                            {(pub.edition || 1) === 1 ? '1st' : pub.edition === 2 ? '2nd' : pub.edition === 3 ? '3rd' : `${pub.edition}th`} Edition
                                          </span>
                                          <span className="text-[10px] text-[#B8962D]">·</span>
                                          <span className="text-[10px] font-medium text-[#B8962D]">{pub.edition_year || pub.year}</span>
                                        </span>
                                      </div>
                                      {/* Mobile: Text style */}
                                      <p className="md:hidden text-[10px] text-[#9A7D1F] font-medium mt-4">
                                        {(pub.edition || 1) === 1 ? '1st' : pub.edition === 2 ? '2nd' : pub.edition === 3 ? '3rd' : `${pub.edition}th`} Edition · {pub.edition_year || pub.year}
                                      </p>
                                    </>
                                  )}
                                  {/* Mobile: Date below venue */}
                                  <p className="md:hidden text-xs text-gray-400 font-medium mt-4">
                                    {pub.published_date}
                                  </p>
                                  {/* DOI below venue/date - refined design */}
                                  {pub.doi && (
                                    <a
                                      href={`https://doi.org/${pub.doi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-6 mt-8 group/doi"
                                    >
                                      <span className="px-6 py-2 bg-gray-100 rounded text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                                        doi
                                      </span>
                                      <span className="text-xs md:text-xs text-gray-500 group-hover/doi:text-primary transition-colors">
                                        {pub.doi}
                                      </span>
                                    </a>
                                  )}
                                </div>

                                {/* Right: Cite button only - PC only */}
                                <div className="hidden md:flex flex-col items-start md:items-end gap-8 md:gap-12 shrink-0">
                                  <button
                                    onClick={() => showModal({
                                      title: 'Citation Formats',
                                      maxWidth: '600px',
                                      children: <CitationModal citation={pub.citations} />
                                    })}
                                    className="flex items-center gap-4 md:gap-6 px-10 md:px-12 py-4 md:py-6 bg-gray-50 border border-gray-100 rounded-lg text-[10px] md:text-xs font-medium text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors"
                                  >
                                    Cite
                                  </button>
                                </div>
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
          ) : (
            <div className="bg-gray-50 rounded-2xl p-60 text-center">
              <p className="text-md text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}

export default memo(PublicationsTemplate)
