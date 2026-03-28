import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Slider from '@/components/atoms/slider'
import { parseMarkdown } from '@/utils/parseMarkdown'

// Image Imports
import icon8 from '@/assets/images/icons/8.png'
import icon9 from '@/assets/images/icons/9.png'
import hero1 from '@/assets/images/hero/1.webp'
import hero2 from '@/assets/images/hero/2.webp'
import hero3 from '@/assets/images/hero/3.webp'
import hero4 from '@/assets/images/hero/4.webp'
import logoFinds from '@/assets/images/brand/logo-finds.png'

// 슬라이드 데이터
const heroSlides = [
  {
    id: 1,
    badge: 'FINDS Lab',
    verb: 'Illuminate',
    title: 'Data-Illuminated\nFinancial Innovation',
    image: hero1,
    buttons: [
      { label: 'Introduction', path: '/about/introduction' },
      { label: 'Honors & Awards', path: '/about/honors' },
    ],
  },
  {
    id: 2,
    badge: 'FINDS Lab',
    verb: 'Highlight',
    title: 'Research &\nAccomplishments',
    image: hero2,
    buttons: [
      { label: 'Publications', path: '/publications' },
      { label: 'Projects', path: '/projects' },
    ],
  },
  {
    id: 3,
    badge: 'FINDS Lab',
    verb: 'Flash',
    title: 'News &\nAnnouncements',
    image: hero3,
    buttons: [
      { label: 'News', path: '/archives/news' },
      { label: 'Notice', path: '/archives/notice' },
    ],
  },
]

export const HomeTemplate = () => {
  const [newsItems, setNewsItems] = useState<{ title: string; date: string; slug: string }[]>([])
  const [noticeItems, setNoticeItems] = useState<{ title: string; date: string; slug: string }[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [loadStartTime] = useState(Date.now())
  const [logoTapped, setLogoTapped] = useState(false)

  useEffect(() => {
    const fetchLatest = async () => {
      const baseUrl = import.meta.env.BASE_URL || '/'
      try {
        // News index.json 로드
        const newsIndexRes = await fetch(`${baseUrl}data/news/index.json`)
        if (newsIndexRes.ok) {
          const newsIndex = await newsIndexRes.json()
          const newsFiles = newsIndex.files.slice(0, 2) // 최신 2개만
          
          const newsResults = await Promise.all(
            newsFiles.map(async (file: string) => {
              try {
                const response = await fetch(`${baseUrl}data/news/${file}`)
                if (!response.ok) return null
                const text = await response.text()
                const { data } = parseMarkdown(text)
                const slug = file.replace('.md', '')
                return { title: data.title || 'No Title', date: data.date || '', slug }
              } catch {
                return null
              }
            })
          )
          const validNews = newsResults.filter((item): item is { title: string; date: string; slug: string } => item !== null)
          setNewsItems(validNews)
        }

        // Notice index.json 로드
        const noticeIndexRes = await fetch(`${baseUrl}data/notice/index.json`)
        if (noticeIndexRes.ok) {
          const noticeIndex = await noticeIndexRes.json()
          const noticeFiles = noticeIndex.files.slice(0, 2) // 최신 2개만
          
          const noticeResults = await Promise.all(
            noticeFiles.map(async (file: string) => {
              try {
                const response = await fetch(`${baseUrl}data/notice/${file}`)
                if (!response.ok) return null
                const text = await response.text()
                const { data } = parseMarkdown(text)
                const slug = file.replace('.md', '')
                return { title: data.title || 'No Title', date: data.date || '', slug }
              } catch {
                return null
              }
            })
          )
          const validNotice = noticeResults.filter((item): item is { title: string; date: string; slug: string } => item !== null)
          setNoticeItems(validNotice)
        }
      } catch (err) {
        console.error('Failed to load home data:', err)
      } finally {
        setIsLoaded(true)
        const loadTime = Date.now() - loadStartTime
        // 로딩이 200ms 이내면 바로 넘어감, 아니면 잠시 보여주고 페이드아웃
        if (loadTime < 200) {
          setShowWelcome(false)
        } else {
          setTimeout(() => setShowWelcome(false), 400)
        }
      }
    }

    fetchLatest()
  }, [loadStartTime])

  // Welcome Loading Screen - Clean Engineering Style (White Background)
  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {/* Background Pattern - Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #D6B14D 1px, transparent 1px),
              linear-gradient(to bottom, #D6B14D 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Soft radial glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(214,177,77,0.03) 0%, transparent 50%)'
          }}
        />
        
        {/* Central Animation Container */}
        <div className="relative flex flex-col items-center">
          {/* Hexagon Network Animation */}
          <div className="relative w-[140px] h-[140px] mb-32">
            {/* Rotating outer ring */}
            <svg className="absolute inset-0 w-full h-full" style={{ animation: 'spin 12s linear infinite' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ringGradient)" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.5" />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D6B14D" />
                  <stop offset="100%" stopColor="#B8962D" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Counter-rotating middle ring */}
            <svg className="absolute inset-0 w-full h-full" style={{ animation: 'spin 8s linear infinite reverse' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#D6B14D" strokeWidth="0.3" strokeDasharray="3 9" opacity="0.3" />
            </svg>
            
            {/* Central hexagon */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {/* Outer hexagon with gradient stroke */}
              <polygon 
                points="50,18 78,34 78,66 50,82 22,66 22,34" 
                fill="none" 
                stroke="url(#hexGradient)"
                strokeWidth="1.2"
                opacity="0.9"
              >
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
              </polygon>
              
              {/* Inner hexagon with fill */}
              <polygon 
                points="50,28 68,39 68,61 50,72 32,61 32,39" 
                fill="url(#hexFill)"
                stroke="#D6B14D" 
                strokeWidth="0.6"
                opacity="0.8"
              />
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D6B14D" />
                  <stop offset="50%" stopColor="#E8D688" />
                  <stop offset="100%" stopColor="#B8962D" />
                </linearGradient>
                <linearGradient id="hexFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(214,177,77,0.08)" />
                  <stop offset="100%" stopColor="rgba(184,150,45,0.03)" />
                </linearGradient>
              </defs>
              
              {/* Center dot with glow */}
              <circle cx="50" cy="50" r="3" fill="#D6B14D">
                <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="50" r="6" fill="none" stroke="#D6B14D" strokeWidth="0.3" opacity="0.4">
                <animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              
              {/* Connection lines from center to vertices - subtle */}
              {[
                [50, 18], [78, 34], [78, 66], [50, 82], [22, 66], [22, 34]
              ].map(([x, y], i) => (
                <line key={`line-${i}`} x1="50" y1="50" x2={x} y2={y} stroke="#D6B14D" strokeWidth="0.3" opacity="0.2" />
              ))}
              
              {/* Node points on hexagon vertices */}
              {[
                [50, 18], [78, 34], [78, 66], [50, 82], [22, 66], [22, 34]
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="2.5" fill="#D6B14D">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </circle>
                  <circle cx={x} cy={y} r="5" fill="none" stroke="#D6B14D" strokeWidth="0.4" opacity="0">
                    <animate attributeName="r" values="2.5;8;2.5" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </circle>
                </g>
              ))}
            </svg>
          </div>
          
          {/* Text */}
          <div className="text-center">
            <h1 
              className="text-lg font-semibold tracking-[0.05em] mb-6"
              style={{ 
                background: 'linear-gradient(135deg, #D6B14D 0%, #9A7D1F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FINDS Lab
            </h1>
            <p className="text-[10px] text-gray-300 tracking-[0.2em] uppercase font-light">
              Loading
              <span className="inline-flex ml-2 gap-0.5">
                <span className="w-1 h-1 rounded-full bg-gray-300" style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-300" style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '200ms' }} />
                <span className="w-1 h-1 rounded-full bg-gray-300" style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '400ms' }} />
              </span>
            </p>
          </div>
          
          {/* Bottom decorative line */}
          <div className="absolute -bottom-20 w-64 h-px bg-gradient-to-r from-transparent via-[#D6B14D]/20 to-transparent" />
        </div>
        
        {/* Corner decorations - more subtle */}
        <div className="absolute top-12 left-12 w-12 h-12 border-l border-t border-[#D6B14D]/10" />
        <div className="absolute top-12 right-12 w-12 h-12 border-r border-t border-[#D6B14D]/10" />
        <div className="absolute bottom-12 left-12 w-12 h-12 border-l border-b border-[#D6B14D]/10" />
        <div className="absolute bottom-12 right-12 w-12 h-12 border-r border-b border-[#D6B14D]/10" />
        
        {/* CSS for spin animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section - PC only */}
      <section className="hidden md:block relative px-16 md:px-20 py-24 md:py-40">
        <div className="max-w-1480 mx-auto">
          <Slider loop autoplay autoplayDelay={5000} arrows dots>
            {heroSlides.map((slide) => (
              <div key={slide.id} className="group/slide relative bg-white h-full rounded-2xl md:rounded-3xl px-20 md:px-48 lg:px-60 xl:px-100 py-24 md:py-44 lg:py-48 flex items-center justify-between overflow-hidden border border-gray-100">
                {/* Subtle background accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D6B14D]/30 to-transparent" />
                <div className="flex flex-col flex-1 gap-10 md:gap-16 lg:gap-20 z-10">
                  {/* Badge */}
                  <div className="inline-flex items-center px-12 md:px-14 lg:px-16 py-6 md:py-10 lg:py-12 border border-primary/30 rounded-full bg-white shadow-sm w-fit">
                    <span className="text-xs md:text-md font-bold text-primary">{slide.badge}</span>
                  </div>
                  {/* Verb - large accent word */}
                  <div className="flex items-baseline gap-10">
                    <span className="text-2xl md:text-[40px] lg:text-[52px] xl:text-[60px] font-black tracking-tight bg-gradient-to-r from-[#D6B14D] to-[#E8D688] bg-clip-text text-transparent leading-tight pb-2 cursor-pointer transition-all duration-500 hover:drop-shadow-[0_0_25px_rgba(214,177,77,0.7)] hover:brightness-125 hover:scale-[1.02]">
                      {slide.verb}
                    </span>
                    <span className="hidden lg:block w-12 lg:w-20 h-[2px] bg-gradient-to-r from-[#D6B14D] to-transparent rounded-full" />
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-8 md:gap-10">
                    {slide.buttons.map((button, btnIndex) => (
                      <Link
                        key={btnIndex}
                        to={button.path}
                        className="px-12 md:px-18 lg:px-20 py-8 md:py-14 lg:py-16 bg-primary text-white! text-xs md:text-sm lg:text-md font-medium rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        {button.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:max-w-350 lg:max-w-450 xl:max-w-650">
                  <img loading="eager" src={slide.image} alt="Hero Illustration" className="w-full h-full object-contain object-right md:rounded-r-3xl" />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative h-300 md:h-414 overflow-hidden">
        <img loading="eager" src={hero4} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-16">
          <img loading="eager" src={logoFinds} alt="FINDS Lab" 
            className={`w-80 md:w-112 h-auto mb-16 md:mb-24 transition-all duration-700 cursor-pointer ${logoTapped ? '' : 'brightness-0 invert'} ${!logoTapped ? 'md:hover:brightness-100 md:hover:invert-0' : ''}`}
            onClick={() => setLogoTapped(prev => !prev)}
          />
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-8">FINDS Lab</h2>
          <p className="text-base md:text-xl font-medium mb-12 md:mb-16">
            <span style={{ color: '#E8D688' }}>Fin</span>
            <span className="text-white">ancial </span>
            <span style={{ color: '#E8D688' }}>D</span>
            <span className="text-white">ata Intelligence & </span>
            <span style={{ color: '#E8D688' }}>S</span>
            <span className="text-white">olutions Laboratory</span>
          </p>
          <p className="text-sm md:text-xl font-medium max-w-500">
            가천대학교 경영대학 금융·빅데이터학부 빅데이터경영전공
            <br />
            <span style={{ color: '#D6B14D' }}>금융데이터인텔리전스</span> 연구실 홈페이지입니다.
          </p>
        </div>
      </section>

      {/* News & Notice Section */}
      <section className="bg-gray-50 py-40 md:py-60 lg:py-80 px-16 md:px-20">
        <div className="max-w-1480 mx-auto">
          <div className="flex flex-col md:flex-row gap-32 md:gap-40 lg:gap-60">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-16 md:mb-20 lg:mb-24">
                <div className="flex items-center gap-8">
                  <svg 
                    className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#D6B14D" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                  </svg>
                  <h3 className="text-lg md:text-xl lg:text-[26px] font-semibold text-gray-900">News</h3>
                </div>
                <Link
                  to="/archives/news"
                  className="flex items-center gap-4 md:gap-6 lg:gap-8 px-12 md:px-14 lg:px-16 py-8 md:py-10 lg:py-12 bg-white border border-gray-100 rounded-full text-sm md:text-base font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  자세히 보기
                  <ChevronRight size={16} className="text-primary" />
                </Link>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
                {!isLoaded ? (
                  // Skeleton placeholder - looks like content
                  <>
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center justify-between px-12 md:px-14 lg:px-16 py-12 md:py-14 lg:py-16 border-b border-gray-100 last:border-b-0">
                        <div className="h-4 md:h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 md:h-4 bg-gray-100 rounded w-20 shrink-0" />
                      </div>
                    ))}
                  </>
                ) : newsItems.length > 0 ? (
                  newsItems.map((item, index) => (
                    <Link
                      key={index}
                      to={`/archives/news?id=${item.slug}`}
                      className="flex items-center justify-between px-12 md:px-14 lg:px-16 py-12 md:py-14 lg:py-16 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm md:text-base font-medium text-gray-900 truncate flex-1 mr-12">· {item.title}</span>
                      <span className="text-xs md:text-sm lg:text-base text-gray-500 shrink-0">{item.date}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-16 py-32 md:py-36 lg:py-40 text-center text-sm md:text-base text-gray-500">
                    등록된 뉴스가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-16 md:mb-20 lg:mb-24">
                <div className="flex items-center gap-8">
                  <svg 
                    className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] lg:w-[28px] lg:h-[28px]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#D6B14D" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="m3 11 18-5v12L3 13v-2z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                  <h3 className="text-lg md:text-xl lg:text-[26px] font-semibold text-gray-900">Notice</h3>
                </div>
                <Link
                  to="/archives/notice"
                  className="flex items-center gap-4 md:gap-6 lg:gap-8 px-12 md:px-14 lg:px-16 py-8 md:py-10 lg:py-12 bg-white border border-gray-100 rounded-full text-sm md:text-base font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  자세히 보기
                  <ChevronRight size={16} className="text-primary" />
                </Link>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
                {!isLoaded ? (
                  // Skeleton placeholder - looks like content
                  <>
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center justify-between px-12 md:px-14 lg:px-16 py-12 md:py-14 lg:py-16 border-b border-gray-100 last:border-b-0">
                        <div className="h-4 md:h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 md:h-4 bg-gray-100 rounded w-20 shrink-0" />
                      </div>
                    ))}
                  </>
                ) : noticeItems.length > 0 ? (
                  noticeItems.map((item, index) => (
                    <Link
                      key={index}
                      to={`/archives/notice?id=${item.slug}`}
                      className="flex items-center justify-between px-12 md:px-14 lg:px-16 py-12 md:py-14 lg:py-16 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm md:text-base font-medium text-gray-900 truncate flex-1 mr-12">· {item.title}</span>
                      <span className="text-xs md:text-sm lg:text-base text-gray-500 shrink-0">{item.date}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-16 py-32 md:py-36 lg:py-40 text-center text-sm md:text-base text-gray-500">
                    등록된 공지사항이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(HomeTemplate)
