import React, { memo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, Calendar, Home, Search, SlidersHorizontal} from 'lucide-react'
import { useStoreModal } from '@/store/modal'
import { parseMarkdown, processJekyllContent } from '@/utils/parseMarkdown'

// Image Imports
import banner5 from '@/assets/images/banner/5.webp'

// Category types and colors based on FINDS Lab Color Palette
type GalleryCategory = 'Conferences' | 'Events' | 'Celebrations' | 'Design' | 'General';

const categoryColors: Record<GalleryCategory, { bg: string; text: string; border: string; hoverText: string }> = {
  'Conferences': { bg: 'bg-[#AC0E0E]/10', text: 'text-[#AC0E0E]', border: 'border-[#AC0E0E]/30', hoverText: '#AC0E0E' },
  'Events': { bg: 'bg-[#D6B14D]/10', text: 'text-[#D6B14D]', border: 'border-[#D6B14D]/30', hoverText: '#D6B14D' },
  'Celebrations': { bg: 'bg-[#E8889C]/10', text: 'text-[#E8889C]', border: 'border-[#E8889C]/30', hoverText: '#E8889C' },
  'Design': { bg: 'bg-[#FFF3CC]/20', text: 'text-[#B8962D]', border: 'border-[#FFF3CC]/50', hoverText: '#B8962D' },
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

interface GalleryItem {
  id: string;
  title: string;
  date: string;
  thumb: string;
  author?: string;
  category?: GalleryCategory;
}

// 상세 모달
const GalleryDetailModal = ({ id, title, date }: { id: string; title?: string; date?: string }) => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<{ title?: string; date?: string; author?: string }>({})
  const baseUrl = import.meta.env.BASE_URL || '/'

  useEffect(() => {
    fetch(`${baseUrl}data/gallery/${id}/index.md`)
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
        // Gallery 이미지 경로를 위해 basePath를 gallery 폴더까지 확장
        const galleryBasePath = `${baseUrl.replace(/\/$/, '')}/data/gallery/${id}`
        const processedContent = processJekyllContent(content, data, { basePath: galleryBasePath })
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
            [&_img]:my-12 [&_img]:rounded-lg [&_img]:max-w-full [&_img]:shadow-sm [&_img]:mx-auto [&_img]:block
            [&>p>img]:my-8
            [&>p>img+img]:mt-8
            [&>code]:text-[12px] [&>code]:bg-gray-100 [&>code]:px-6 [&>code]:py-2 [&>code]:rounded [&>code]:font-mono [&>code]:text-gray-700
            [&>pre]:my-20 [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:rounded-lg [&>pre]:p-16 [&>pre]:overflow-x-auto [&>pre]:text-[12px]
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}

export const ArchivesGalleryTemplate = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<GalleryCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { showModal } = useStoreModal()
  const baseUrl = import.meta.env.BASE_URL || '/'
  const contentAnimation = useScrollAnimation()

  const allCategories: GalleryCategory[] = ['Events', 'Conferences', 'Celebrations', 'Design', 'General']

  const categoryFilterColors: Record<string, { bg: string; text: string }> = {
    'Conferences': { bg: '#AC0E0E', text: '#FFFFFF' },
    'Events': { bg: '#D6B14D', text: '#FFFFFF' },
    'Celebrations': { bg: '#E8889C', text: '#FFFFFF' },
    'Design': { bg: '#B8962D', text: '#FFFFFF' },
    'General': { bg: '#6B7280', text: '#FFFFFF' },
  }

  const handleCategoryToggle = (cat: GalleryCategory) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  useEffect(() => {
    const fetchAllGalleries = async () => {
      try {
        const indexResponse = await fetch(`${baseUrl}data/gallery/index.json`)
        const indexData = await indexResponse.json()
        const galleryFolders: string[] = indexData.folders || []

        const results = await Promise.all(
          galleryFolders.map(async (folder) => {
            const response = await fetch(`${baseUrl}data/gallery/${folder}/index.md`)
            const text = await response.text()
            const { data } = parseMarkdown(text)
            // date를 문자열로 확실히 변환
            const dateStr = data.date ? String(data.date).slice(0, 10) : ''
            // Validate category (map 'Lab Events' to 'Events' for backward compatibility)
            const validCategories: GalleryCategory[] = ['Conferences', 'Events', 'Celebrations', 'Design', 'General']
            let parsedCategory: GalleryCategory = 'General'
            if (data.category === 'Lab Events') {
              parsedCategory = 'Events'
            } else if (validCategories.includes(data.category as GalleryCategory)) {
              parsedCategory = data.category as GalleryCategory
            }
            return {
              id: folder,
              title: (data.title as string) || 'No Title',
              date: dateStr,
              thumb: (data.thumb as string) || '',
              author: (data.author as string) || 'FINDS Lab',
              category: parsedCategory
            }
          })
        )
        // 최신 날짜가 먼저 오도록 정렬 (내림차순) - 왼쪽 첫 번째에 최신 글
        setGalleryItems(results.sort((a, b) => {
          const dateA = new Date(a.date).getTime() || 0
          const dateB = new Date(b.date).getTime() || 0
          return dateB - dateA  // 최신이 먼저 (내림차순)
        }))
      } catch (err) {
        console.error('Failed to load galleries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllGalleries()
  }, [])

  const filteredItems = galleryItems.filter(item => {
    const matchesCat = selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category))
    const matchesSearch = !searchTerm.trim() || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  const hasActiveFilters = selectedCategories.length > 0 || searchTerm.trim() !== ''

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
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">Gallery</h1>
          
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
            <span className="text-sm text-primary font-semibold">Gallery</span>
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
                  isFilterOpen || selectedCategories.length > 0 ? 'bg-primary/5 border-primary text-primary font-medium' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
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
                        <h4 className="text-sm font-bold text-gray-500">Category</h4>
                        <div className="flex flex-wrap gap-8">
                          {allCategories.map((cat) => {
                            const isActive = selectedCategories.includes(cat)
                            const color = categoryFilterColors[cat]
                            return (
                              <button key={cat} onClick={() => handleCategoryToggle(cat)}
                                className="px-12 md:px-16 py-6 md:py-8 rounded-lg text-xs md:text-sm font-medium transition-all border"
                                style={isActive && color ? { backgroundColor: color.bg, borderColor: color.bg, color: color.text, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: 'white', borderColor: '#f0f0f0', color: '#7f8894' }}
                              >{cat}</button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-end pt-16 border-t border-gray-100">
                        <button onClick={() => setSelectedCategories([])} className="px-16 py-8 text-sm font-medium text-gray-400 hover:text-primary transition-colors">Reset all filters</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 flex items-center px-12 md:px-16 py-12 md:py-16 bg-white border border-gray-100 rounded-xl focus-within:border-primary transition-colors">
              <input type="text" placeholder="Search by title..." className="flex-1 text-sm md:text-base text-gray-700 outline-none min-w-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="size-16 md:size-20 text-gray-500 shrink-0 ml-8" />
            </div>
            <div className="px-12 md:px-16 py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-xl text-sm md:text-base font-medium text-gray-500 text-center shrink-0">
              {filteredItems.length} of {galleryItems.length}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-8 mt-12">
              {selectedCategories.map((cat) => {
                const color = categoryFilterColors[cat]
                return (
                  <button key={cat} onClick={() => handleCategoryToggle(cat)} className="flex items-center gap-4 px-10 py-4 rounded-full text-xs font-medium border transition-all hover:opacity-70" style={{ backgroundColor: `${color.bg}15`, borderColor: `${color.bg}30`, color: color.bg }}>
                    {cat} <span className="text-[10px]">✕</span>
                  </button>
                )
              })}
              <button onClick={() => { setSelectedCategories([]); setSearchTerm('') }} className="text-xs text-gray-400 hover:text-primary transition-colors ml-4">Clear all</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-16 md:gap-20">
            {/* Centered Spinner */}
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-[#D6B14D] animate-spin" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-20">
              {/* Skeleton Loading - 4 gallery cards */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-[#f0f0f0] rounded-xl md:rounded-[20px] overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-16 md:p-20">
                    <div className="flex items-center justify-between gap-6 mb-8">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-5 w-14 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-5 w-full bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-20">
            {filteredItems.map((item) => {
              const hoverColor = item.category && categoryColors[item.category] ? categoryColors[item.category].hoverText : '#D6B14D'
              return (
              <div
                key={item.id}
                onClick={() => showModal({
                  maxWidth: '800px',
                  children: <GalleryDetailModal id={item.id} title={item.title} date={item.date} />
                })}
                className="bg-white border border-[#f0f0f0] rounded-xl md:rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:[border-color:var(--tag-hover-color)] hover:[box-shadow:0_10px_15px_-3px_var(--tag-hover-shadow)]"
                style={{ '--tag-hover-color': hoverColor, '--tag-hover-shadow': `${hoverColor}15` } as React.CSSProperties}
              >
                <div className="aspect-[4/3] bg-[#f9fafb] flex items-center justify-center overflow-hidden">
                  {item.thumb ? (
                    <img
                      src={`${baseUrl}data/gallery/${item.id}/${item.thumb}`}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="size-32 md:size-40 text-[#cdcdcd]" />
                  )}
                </div>
                <div className="p-16 md:p-20">
                  <div className="flex items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <Calendar className="size-12 text-gray-400" />
                      <span className="font-medium">{item.date}</span>
                    </div>
                    {item.category && categoryColors[item.category] && (
                      <span className={`px-6 py-2 rounded-full text-[9px] md:text-[10px] font-medium border ${categoryColors[item.category].bg} ${categoryColors[item.category].text} ${categoryColors[item.category].border}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 transition-colors group-hover:[color:var(--tag-hover-color)]">
                    {item.title}
                  </h3>
                </div>
              </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#f9fafb] rounded-[20px] p-60 text-center text-gray-500">
            No items found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ArchivesGalleryTemplate)
