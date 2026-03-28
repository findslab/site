import React, { memo, useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Home, Search, SlidersHorizontal} from 'lucide-react'
import { useStoreModal } from '@/store/modal'
import { parseMarkdown, processJekyllContent } from '@/utils/parseMarkdown'

// Image Imports
import banner5 from '@/assets/images/banner/5.webp'

// Tag types and colors based on FINDS Lab Color Palette
type NoticeTag = 'Announcements' | 'Recruitment' | 'General';

const tagColors: Record<NoticeTag, { bg: string; text: string; border: string; hoverText: string }> = {
  'Announcements': { bg: 'bg-[#D6B14D]/10', text: 'text-[#9A7D1F]', border: 'border-[#D6B14D]/30', hoverText: '#9A7D1F' },
  'Recruitment': { bg: 'bg-[#AC0E0E]/10', text: 'text-[#AC0E0E]', border: 'border-[#AC0E0E]/30', hoverText: '#AC0E0E' },
  'General': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', hoverText: '#4B5563' }
};

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

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  description: string;
  isPinned?: boolean;
  author?: string;
  tag?: NoticeTag;
}

// 상세 모달
const NoticeDetailModal = ({ id, title, date }: { id: string; title?: string; date?: string }) => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<{ title?: string; date?: string; author?: string }>({})

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    fetch(`${baseUrl}data/notice/${id}.md`)
      .then(res => res.text())
      .then(text => {
        const { data, content } = parseMarkdown(text)

        if (!data.date && id.match(/^\d{4}-\d{2}-\d{2}/)) {
          data.date = id.slice(0, 10)
        }

        setMetadata({ 
          title: data.title as string || title, 
          date: data.date as string || date,
          author: data.author as string || 'FINDS Lab'
        })
        const processedContent = processJekyllContent(content, data, { basePath: baseUrl.replace(/\/$/, '') })
        setContent(processedContent)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-80">
      <div className="w-32 h-32 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="relative bg-white">
      {/* Header - Clean minimal style */}
      <div className="px-24 md:px-32 pt-28 md:pt-36 pb-20 md:pb-24">
        <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-snug tracking-[-0.02em] mb-12 md:mb-16">
          {metadata.title}
        </h1>
        <div className="flex items-center gap-8 text-[12px] text-gray-500">
          <span className="font-medium">{metadata.author}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-gray-300" />
          <span>{metadata.date}</span>
        </div>
      </div>
      
      {/* Divider */}
      <div className="mx-24 md:mx-32 h-px bg-gray-200" />
      
      {/* Content - Clean typography with subtle styling */}
      <div className="px-24 md:px-32 py-24 md:py-32">
        <article 
          className="
            [&>p]:text-[14px] [&>p]:leading-[1.85] [&>p]:text-gray-600 [&>p]:mb-20 [&>p]:tracking-[-0.01em]
            [&>h2]:text-[15px] [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-32 [&>h2]:mb-16 [&>h2]:pb-8 [&>h2]:border-b [&>h2]:border-primary/30
            [&>h3]:text-[14px] [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-24 [&>h3]:mb-12 [&>h3]:pl-12 [&>h3]:border-l-2 [&>h3]:border-primary
            [&>ul]:my-16 [&>ul]:space-y-8
            [&>ul>li]:relative [&>ul>li]:pl-16 [&>ul>li]:text-[14px] [&>ul>li]:leading-[1.75] [&>ul>li]:text-gray-600
            [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-[9px] [&>ul>li]:before:w-[5px] [&>ul>li]:before:h-[5px] [&>ul>li]:before:rounded-full [&>ul>li]:before:bg-primary/60
            [&>ol]:my-16 [&>ol]:space-y-8 [&>ol]:list-decimal [&>ol]:pl-20
            [&>ol>li]:text-[14px] [&>ol>li]:leading-[1.75] [&>ol>li]:text-gray-600 [&>ol>li]:pl-4
            [&>blockquote]:my-20 [&>blockquote]:px-16 [&>blockquote]:py-12 [&>blockquote]:bg-amber-50/50 [&>blockquote]:border-l-3 [&>blockquote]:border-primary/40 [&>blockquote]:rounded-r-lg [&>blockquote]:text-[13px] [&>blockquote]:text-gray-600 [&>blockquote]:leading-[1.7]
            [&>hr]:my-28 [&>hr]:border-0 [&>hr]:h-px [&>hr]:bg-gray-200
            [&_strong]:font-semibold [&_strong]:text-gray-800
            [&_a]:text-primary [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline
            [&_img]:my-20 [&_img]:rounded-lg [&_img]:max-w-full [&_img]:shadow-sm
            [&>code]:text-[12px] [&>code]:bg-gray-100 [&>code]:px-6 [&>code]:py-2 [&>code]:rounded [&>code]:font-mono [&>code]:text-gray-700
            [&>pre]:my-20 [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:rounded-lg [&>pre]:p-16 [&>pre]:overflow-x-auto [&>pre]:text-[12px]
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}

export const ArchivesNoticeTemplate = () => {
  const [noticeItems, setNoticeItems] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState<NoticeTag[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { showModal } = useStoreModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const contentAnimation = useScrollAnimation()

  const allTags: NoticeTag[] = ['Announcements', 'Recruitment', 'General']

  const tagFilterColors: Record<string, { bg: string; text: string }> = {
    'Announcements': { bg: '#D6B14D', text: '#FFFFFF' },
    'Recruitment': { bg: '#AC0E0E', text: '#FFFFFF' },
    'General': { bg: '#6B7280', text: '#FFFFFF' },
  }

  const handleTagToggle = (tag: NoticeTag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  // URL에서 id 파라미터가 있으면 자동으로 해당 게시글 모달 열기
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && noticeItems.length > 0) {
      const item = noticeItems.find(n => n.id === id)
      if (item) {
        showModal({
          title: '',
          children: <NoticeDetailModal id={item.id} title={item.title} date={item.date} />
        })
        // URL에서 id 파라미터 제거
        setSearchParams({})
      }
    }
  }, [searchParams, noticeItems])

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'

    const fetchAllNotices = async () => {
      try {
        // Fetch index.json to get the list of notice files
        const indexResponse = await fetch(`${baseUrl}data/notice/index.json`)
        if (!indexResponse.ok) {
          console.error('Failed to load notice index')
          setLoading(false)
          return
        }
        const indexData = await indexResponse.json()
        const noticeFiles: string[] = indexData.files || []

        const results = await Promise.all(
          noticeFiles.map(async (file) => {
            try {
              const response = await fetch(`${baseUrl}data/notice/${file}`)
              if (!response.ok) return null
              const text = await response.text()
              const { data } = parseMarkdown(text)
              return {
                id: file.replace('.md', ''),
                title: data.title || 'No Title',
                date: data.date || '',
                description: data.excerpt || '',
                isPinned: data.isPinned === 'true',
                author: data.author || 'FINDS Lab',
                tag: (data.tag as NoticeTag) || 'General'
              }
            } catch (err) {
              return null
            }
          })
        )
        const validResults = results.filter((item) => item !== null) as NoticeItem[]
        setNoticeItems(validResults.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.date.localeCompare(a.date);
        }))
      } catch (err) {
        console.error('Failed to load notices:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllNotices()
  }, [])

  const filteredItems = noticeItems.filter(item => {
    const matchesTag = selectedTags.length === 0 || (item.tag && selectedTags.includes(item.tag))
    const matchesSearch = !searchTerm.trim() || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTag && matchesSearch
  })

  const hasActiveFilters = selectedTags.length > 0 || searchTerm.trim() !== ''

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]" style={{ backgroundImage: `url(${banner5})` }} />
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
              Archives
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">Notice</h1>
          
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
            <Link to="/" className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"><Home size={16} /></Link>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-gray-400 font-medium">Archives</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Notice</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 py-40 md:py-60 pb-60 md:pb-100"
      >
        {/* Filter & Search - Unified Design */}
        <div className="mb-24 md:mb-32">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 md:gap-20 relative z-30">
            <div className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center gap-8 px-12 md:px-16 py-12 md:py-16 border rounded-xl text-sm md:text-base transition-all ${
                  isFilterOpen || selectedTags.length > 0 ? 'bg-primary/5 border-primary text-primary font-medium' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
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
                        <h4 className="text-sm font-bold text-gray-500">Tag</h4>
                        <div className="flex flex-wrap gap-8">
                          {allTags.map((tag) => {
                            const isActive = selectedTags.includes(tag)
                            const color = tagFilterColors[tag]
                            return (
                              <button key={tag} onClick={() => handleTagToggle(tag)}
                                className="px-12 md:px-16 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border"
                                style={isActive && color ? { backgroundColor: color.bg, borderColor: color.bg, color: color.text, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: 'white', borderColor: '#f0f0f0', color: '#7f8894' }}
                              >{tag}</button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-end pt-16 border-t border-gray-100">
                        <button onClick={() => setSelectedTags([])} className="px-16 py-8 text-sm font-medium text-gray-400 hover:text-primary transition-colors">Reset all filters</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 flex items-center px-12 md:px-16 py-12 md:py-16 bg-white border border-gray-100 rounded-xl focus-within:border-primary transition-colors">
              <input type="text" placeholder="Search by title, content..." className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredItems.length} of {noticeItems.length}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-8 mt-12">
              {selectedTags.map((tag) => {
                const color = tagFilterColors[tag]
                return (
                  <button key={tag} onClick={() => handleTagToggle(tag)} className="flex items-center gap-4 px-10 py-4 rounded-full text-xs font-medium border transition-all hover:opacity-70" style={{ backgroundColor: `${color.bg}15`, borderColor: `${color.bg}30`, color: color.bg }}>
                    {tag} <span className="text-[10px]">✕</span>
                  </button>
                )
              })}
              <button onClick={() => { setSelectedTags([]); setSearchTerm('') }} className="text-xs text-gray-400 hover:text-primary transition-colors ml-4">Clear all</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-12 md:gap-20">
            {/* Centered Spinner */}
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
              </div>
            </div>
            {/* Skeleton Loading - 3 notice cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#f0f0f0] rounded-xl md:rounded-[20px] p-16 md:p-30 min-h-[120px] md:min-h-[140px] animate-pulse">
                <div className="flex items-center gap-8 md:gap-16 mb-8 md:mb-12">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded hidden md:block" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="h-5 md:h-6 w-3/4 bg-gray-200 rounded mb-8" />
                <div className="h-4 w-full bg-gray-100 rounded mb-4" />
                <div className="h-4 w-2/3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="flex flex-col gap-12 md:gap-20">
            {filteredItems.map((item) => {
              const hoverColor = item.tag && tagColors[item.tag] ? tagColors[item.tag].hoverText : '#D6B14D'
              return (
              <div
                key={item.id}
                onClick={() => showModal({
                  maxWidth: '800px',
                  children: <NoticeDetailModal id={item.id} title={item.title} date={item.date} />
                })}
                className={`bg-white border rounded-xl md:rounded-[20px] p-16 md:p-30 transition-all duration-300 cursor-pointer group min-h-[120px] md:min-h-[140px] hover:shadow-lg hover:[border-color:var(--tag-hover-color)] hover:[box-shadow:0_10px_15px_-3px_var(--tag-hover-shadow)] ${
                  item.isPinned ? 'border-primary bg-primary/5' : 'border-[#f0f0f0]'
                }`}
                style={{ '--tag-hover-color': hoverColor, '--tag-hover-shadow': `${hoverColor}15` } as React.CSSProperties}
              >
                <div className="flex items-center gap-8 md:gap-16 mb-8 md:mb-12 text-xs md:text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-6">
                    <Calendar className="size-12 md:size-14 text-gray-400" />
                    <span className="font-medium">{item.date}</span>
                  </div>
                  <span className="text-gray-300 hidden md:inline">|</span>
                  <span>{item.author}</span>
                  {item.isPinned && (
                    <span className="px-6 md:px-8 py-2 bg-primary text-white text-[10px] md:text-xs font-semibold rounded-md">
                      PINNED
                    </span>
                  )}
                  {item.tag && (
                    <>
                      <span className="text-gray-300 hidden md:inline">|</span>
                      <span className={`px-8 py-2 rounded-full text-[10px] md:text-xs font-medium border ${tagColors[item.tag].bg} ${tagColors[item.tag].text} ${tagColors[item.tag].border}`}>
                        {item.tag}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 transition-colors group-hover:[color:var(--tag-hover-color)]">
                  {item.title}
                </h3>
              </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#f9fafb] rounded-xl md:rounded-[20px] p-40 md:p-60 text-center">
            <p className="text-xs md:text-[14px] text-[#7f8894]">No items found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ArchivesNoticeTemplate)
