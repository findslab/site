import { memo, useState, useEffect, useMemo } from 'react'
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

  // Loader: scattered data points that converge into an ordered ring
  const dataPoints = useMemo(() => {
    const N = 12
    const ordered = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2
      return [100 + Math.cos(a) * 43, 100 + Math.sin(a) * 43] as [number, number]
    })
    const rnd = (min: number, max: number) => min + Math.random() * (max - min)
    return ordered.map(([ex, ey], i) => {
      const w = Array.from({ length: 3 }, () => {
        const a = rnd(0, Math.PI * 2)
        const r = rnd(14, 72)
        return [
          Number((100 + Math.cos(a) * r).toFixed(1)),
          Number((100 + Math.sin(a) * r).toFixed(1)),
        ] as [number, number]
      })
      const [nx, ny] = ordered[(i + 1) % N]
      return {
        w,
        ex: Number(ex.toFixed(1)), ey: Number(ey.toFixed(1)),
        nx: Number(nx.toFixed(1)), ny: Number(ny.toFixed(1)),
      }
    })
  }, [])

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
          {/* Compass — data scattered, then aligned to a direction */}
          <div className="relative w-[172px] h-[172px] mb-32">
            {/* fixed indicator (does not rotate) */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-14 bg-[#B8962D] z-10">
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#B8962D]" />
            </div>

            {/* knurled bezel */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200"
                 style={{ animation: 'cpDrift 18s linear infinite' }}>
              <circle cx="100" cy="100" r="86" fill="none" stroke="#18181b"
                      strokeWidth="9" opacity="0.12" strokeDasharray="3 6.006" />
            </svg>

            {/* dial face */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="cpFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(214,177,77,0.07)" />
                  <stop offset="100%" stopColor="rgba(184,150,45,0.02)" />
                </linearGradient>
                <linearGradient id="cpNeedle" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#E8D688" />
                  <stop offset="100%" stopColor="#B8962D" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#D6B14D" strokeWidth="1" opacity="0.28" />
              <circle cx="100" cy="100" r="58" fill="url(#cpFace)" stroke="#D6B14D" strokeWidth="1" opacity="0.38" />
              <g stroke="#D6B14D">
                {Array.from({ length: 36 }, (_, i) => {
                  const major = i % 9 === 0
                  const a = (i / 36) * Math.PI * 2 - Math.PI / 2
                  const r1 = major ? 68 : 72
                  return (
                    <line key={i}
                      x1={(100 + Math.cos(a) * r1).toFixed(2)} y1={(100 + Math.sin(a) * r1).toFixed(2)}
                      x2={(100 + Math.cos(a) * 79).toFixed(2)} y2={(100 + Math.sin(a) * 79).toFixed(2)}
                      strokeWidth={major ? 1.4 : 0.7} opacity={major ? 0.55 : 0.22} />
                  )
                })}
              </g>
              <g fontSize="10.5" fontWeight="600" fill="#9A7D1F" textAnchor="middle">
                <text x="100" y="34" style={{ animation: 'cpLock 5.2s ease-in-out infinite' }}>N</text>
                <text x="167" y="104" opacity="0.24">E</text>
                <text x="100" y="174" opacity="0.24">S</text>
                <text x="33" y="104" opacity="0.24">W</text>
              </g>
              {/* ring of light released on lock */}
              <circle cx="100" cy="100" r="58" fill="none" stroke="#D6B14D" strokeWidth="1.2"
                      style={{ transformOrigin: '100px 100px', animation: 'cpFlash 5.2s ease-out infinite' }} />
            </svg>

            {/* data points: scattered -> ordered */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <g>
                {dataPoints.map((d, i) => (
                  <line key={`l-${i}`} x1={d.ex} y1={d.ey} x2={d.nx} y2={d.ny}
                    stroke="#D6B14D" strokeWidth="0.6" strokeDasharray="60" strokeDashoffset="60"
                    style={{ animation: 'cpDraw 5.2s ease-out infinite', animationDelay: `${i * 0.02}s` }} />
                ))}
              </g>
              <g>
                {dataPoints.map((d, i) => (
                  <circle key={`d-${i}`} cx={d.w[0][0]} cy={d.w[0][1]} r="1.5" fill="#D6B14D">
                    <animate attributeName="cx" dur="5.2s" repeatCount="indefinite"
                      keyTimes="0;0.22;0.42;0.52;0.66;1"
                      values={`${d.w[0][0]};${d.w[1][0]};${d.w[2][0]};${d.w[2][0]};${d.ex};${d.ex}`} />
                    <animate attributeName="cy" dur="5.2s" repeatCount="indefinite"
                      keyTimes="0;0.22;0.42;0.52;0.66;1"
                      values={`${d.w[0][1]};${d.w[1][1]};${d.w[2][1]};${d.w[2][1]};${d.ey};${d.ey}`} />
                    <animate attributeName="r" dur="5.2s" repeatCount="indefinite"
                      keyTimes="0;0.42;0.52;0.66;0.74;1"
                      values="1.5;1.7;1.8;2.9;2.2;2.4" />
                    <animate attributeName="opacity" dur="5.2s" repeatCount="indefinite"
                      keyTimes="0;0.22;0.42;0.52;0.66;0.74;1"
                      values="0.16;0.22;0.3;0.4;1;0.85;0.9" />
                  </circle>
                ))}
              </g>
            </svg>

            {/* needle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <g style={{ transformOrigin: '100px 100px', animation: 'cpSeek 5.2s cubic-bezier(.65,0,.35,1) infinite' }}>
                <path d="M100 52 L105.5 100 L100 108 L94.5 100 Z" fill="url(#cpNeedle)" />
                <path d="M100 148 L94.5 100 L100 92 L105.5 100 Z" fill="#D6B14D" opacity="0.2" />
              </g>
              <circle cx="100" cy="100" r="6.2" fill="#D6B14D"
                      style={{ transformOrigin: '100px 100px', animation: 'cpHub 5.2s ease-in-out infinite' }} />
              <circle cx="100" cy="100" r="2.5" fill="#fff" opacity="0.92" />
            </svg>
          </div>
          
          {/* Text */}
          <div className="text-center">
            <h1 className="text-[23px] font-bold leading-none tracking-tight">
              <span style={{ color: '#D6B14D' }}>FINDS</span>{' '}
              <span className="text-gray-900">Lab</span>
            </h1>
            <div className="mt-13 text-[10px] font-semibold tracking-wide">
              <span style={{ color: '#D6B14D' }}>F</span>
              <span style={{ color: '#E8D688' }}>inancial </span>
              <span style={{ color: '#D6B14D' }}>D</span>
              <span style={{ color: '#E8D688' }}>ata </span>
              <span style={{ color: '#D6B14D' }}>I</span>
              <span style={{ color: '#E8D688' }}>ntelligence &amp; </span>
              <span style={{ color: '#D6B14D' }}>S</span>
              <span style={{ color: '#E8D688' }}>olutions </span>
              <span className="text-gray-900/70">Laboratory</span>
            </div>
          </div>

          {/* hairline progress */}
          <div className="mt-24 w-168 h-px bg-[#e3ded8] overflow-hidden">
            <span className="block h-full w-0 bg-[#D6B14D]"
                  style={{ animation: 'cpFill 5.2s cubic-bezier(.4,0,.2,1) infinite' }} />
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
          @keyframes cpDrift { to { transform: rotate(360deg); } }
          @keyframes cpSeek {
            /* 가속하며 두 바퀴 회전 */
            0%   { transform: rotate(0deg);   animation-timing-function: cubic-bezier(.4,0,.9,.6); }
            12%  { transform: rotate(150deg); animation-timing-function: linear; }
            34%  { transform: rotate(520deg); animation-timing-function: cubic-bezier(.15,.6,.35,1); }
            /* 정북을 살짝 지나침 */
            54%  { transform: rotate(736deg); animation-timing-function: ease-in-out; }
            /* 반대쪽으로 약하게, 점점 잦아들며 정북으로 수렴 */
            63%  { transform: rotate(709deg); animation-timing-function: ease-in-out; }
            71%  { transform: rotate(727deg); animation-timing-function: ease-in-out; }
            78%  { transform: rotate(715deg); animation-timing-function: ease-in-out; }
            84%  { transform: rotate(723deg); animation-timing-function: ease-in-out; }
            88%  { transform: rotate(718deg); animation-timing-function: ease-in-out; }
            91%  { transform: rotate(721deg); animation-timing-function: ease-in-out; }
            94%  { transform: rotate(720deg); animation-timing-function: linear; }
            /* 정북에서 정지 */
            100% { transform: rotate(720deg); }
          }
          @keyframes cpLock {
            0%, 48% { opacity: 0.26; }
            56%     { opacity: 1; }
            66%     { opacity: 0.55; }
            76%     { opacity: 0.9; }
            94%, 100% { opacity: 1; }
          }
          @keyframes cpHub {
            0%, 48% { opacity: 0.55; }
            57%     { opacity: 1; }
            94%,100% { opacity: 0.9; }
          }
          @keyframes cpFlash {
            0%, 50% { opacity: 0; transform: scale(0.5); }
            57%     { opacity: 0.55; transform: scale(1); }
            72%, 100% { opacity: 0; transform: scale(1.45); }
          }
          @keyframes cpDraw {
            0%, 56% { opacity: 0; stroke-dashoffset: 60; }
            74%     { opacity: 0.4; stroke-dashoffset: 0; }
            100%    { opacity: 0.28; stroke-dashoffset: 0; }
          }
          @keyframes cpFill {
            0% { width: 0; } 20% { width: 28%; } 45% { width: 58%; }
            70% { width: 88%; } 94%, 100% { width: 100%; }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="cpSeek"] { animation-duration: 14s !important; animation-timing-function: linear !important; }
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
