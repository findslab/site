import { memo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

// Image Imports
import banner1 from '@/assets/images/banner/1.webp'
import fdsImg from '@/assets/images/icons/fds.webp'
import baImg from '@/assets/images/icons/ba.webp'
import dimImg from '@/assets/images/icons/dim.webp'

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

// 연구 분야 데이터
const researchAreas = [
  {
    id: 'fds',
    badge: '핀테크의 핵심 원동력',
    titleEn: 'Financial Data Science',
    titleKo: '금융 데이터 사이언스',
    image: fdsImg,
    items: [
      {
        en: 'Data-driven advanced asset allocation strategies',
        ko: '데이터 과학 기반의 고도화된 자산 배분 전략 수립',
      },
      {
        en: 'Financial market analysis via time-series modeling',
        ko: '금융 시계열 모형을 활용한 시장 추정 및 분석 연구',
      },
      {
        en: 'Personalized finance and behavioral decision models',
        ko: '개인 맞춤형 자산 관리와 투자자 행동 기반 의사결정',
      },
    ],
  },
  {
    id: 'ba',
    badge: '디지털 전환의 핵심 경쟁력',
    titleEn: 'Business Analytics',
    titleKo: '비즈니스 애널리틱스',
    image: baImg,
    items: [
      {
        en: 'Data-driven value through industrial convergence',
        ko: '산업 간 융합을 촉진하는 데이터 기반 가치 창출',
      },
      {
        en: 'Structured knowledge systems for data clarity',
        ko: '지식화 및 가독성 제고를 위한 정보 전달 체계화',
      },
      {
        en: 'Actionable management insights via data science',
        ko: '데이터 과학 기법을 활용한 실효적 경영 통찰 도출',
      },
    ],
  },
  {
    id: 'dim',
    badge: '전략을 완성하는 공신력',
    titleEn: 'Data-Informed Decision Making',
    titleKo: '데이터 기반 의사결정',
    image: dimImg,
    items: [
      {
        en: 'Trustworthy intelligent decision system design',
        ko: '신뢰할 수 있는 지능형 의사결정 시스템 설계 및 최적화',
      },
      {
        en: 'Risk-aware decision tools for business and industry',
        ko: '경영 환경과 산업 현장의 위험을 고려한 정책 지원 도구',
      },
      {
        en: 'Interdisciplinary approaches to strategic decisions',
        ko: '다각적 통찰을 활용한 전략적 의사결정 방안 모색',
      },
    ],
  },
]

export const AboutResearchTemplate = () => {
  const heroAnimation = useScrollAnimation()
  const contentAnimation = useScrollAnimation()

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
            Research Areas
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
            <span className="text-sm text-primary font-semibold">Research Areas</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 pt-32 md:pt-48 pb-20 md:pb-32"
      >
        <div className="relative text-center max-w-4xl mx-auto">
          <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            <span className="font-bold" style={{color: 'rgb(214, 177, 77)'}}>FINDS Lab</span>은 데이터를 바탕으로 하는<br className="md:hidden" /> <span className="font-bold" style={{color: '#AC0E0E'}}>세 가지 핵심 연구 분야</span>를 통해<br className="md:hidden" /> 경영 환경과 산업 현장에서<br className="md:hidden" /> <span className="font-bold" style={{color: '#AC0E0E'}}>실질적인 가치</span>를 창출하는 연구를 지향합니다.
          </p>
        </div>
      </div>

      {/* Content */}
      <div 
        
        className="max-w-1480 mx-auto w-full px-16 md:px-20 pb-60 md:pb-100"
      >
        <div className="flex flex-col gap-20 md:gap-32">
          {researchAreas.map((area, index) => (
            <article
              key={area.id}
              className={`
                relative bg-gradient-to-br from-white via-white to-[#FFF9E6]/30
                border border-[#FFF3CC]/50 rounded-2xl md:rounded-3xl p-24 md:p-48 
                shadow-sm hover:shadow-xl hover:border-[#D6B14D]/30 
                transition-all duration-500 group overflow-hidden
              `}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D6B14D]/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-xl" />
              
              <div className={`
                relative grid gap-24 md:gap-40 md:grid-cols-2
              `}>
                {/* 텍스트 영역 */}
                <div className={`flex flex-col ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  {/* 헤더 */}
                  <div className="mb-20 md:mb-24">
                    <div className="inline-flex items-center gap-8 px-12 md:px-14 py-6 md:py-8 bg-gradient-to-r from-[#FFF9E6] to-primary/5 border border-[#FFEB99]/50 rounded-full mb-12 md:mb-16">
                      <span className="text-[10px] md:text-xs font-bold text-[#B8962D] tracking-wide">
                        {area.badge}
                      </span>
                    </div>
                    <h2>
                      <span className="block text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-[#D6B14D] to-primary bg-clip-text text-transparent mb-6">
                        {area.titleEn}
                      </span>
                      <span className="text-base md:text-lg font-semibold text-gray-600">
                        {area.titleKo}
                      </span>
                    </h2>
                  </div>

                  {/* 항목 리스트 */}
                  <ul className="flex flex-col gap-16 md:gap-20">
                    {area.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="relative pl-20 md:pl-24 group/item"
                      >
                        <span className="absolute left-0 top-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-[#D6B14D]/20 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        </span>
                        <span className="block text-sm md:text-base font-semibold text-gray-800 leading-snug group-hover/item:text-primary transition-colors">
                          {item.en}
                        </span>
                        <span className="block text-xs md:text-sm text-gray-500 mt-6 leading-relaxed">
                          {item.ko}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 이미지 영역 */}
                <div
                  className={`
                    flex items-center justify-center 
                    bg-gradient-to-br from-[#FFF9E6]/50 via-white to-primary/5
                    rounded-xl md:rounded-2xl p-16 md:p-24
                    border border-[#FFF3CC]/30
                    group-hover:border-[#D6B14D]/20 transition-all duration-500
                    ${index % 2 === 1 ? 'md:order-1' : ''}
                  `}
                >
                  <img
                    src={area.image}
                    alt={area.titleEn}
                    className="w-full h-auto max-w-[240px] md:max-w-[360px] object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(AboutResearchTemplate)
