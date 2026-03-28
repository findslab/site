import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

interface PageBannerProps {
  backgroundImage: string
  category?: string
  title: string
  breadcrumbs: BreadcrumbItem[]
}

export const PageBanner = memo(({ backgroundImage, category, title, breadcrumbs }: PageBannerProps) => {
  return (
    <>
      {/* Banner */}
      <div className="relative w-full h-[280px] md:h-[420px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[2000ms]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        
        {/* Luxurious Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-[#D6A076]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D6B14D]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Floating Accent */}
        <div className="absolute top-1/4 right-[15%] w-32 h-32 rounded-full bg-[#D6B14D]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-20">
          {category && (
            <div className="flex items-center gap-8 mb-16 md:mb-20">
              <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-[#D6B14D]/80" />
              <span className="text-[#D6C360]/90 text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase">
                {category}
              </span>
              <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
            </div>
          )}
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            {title}
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
            <Link 
              to="/" 
              className="text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"
              aria-label="홈으로 이동"
            >
              <Home size={16} />
            </Link>
            {breadcrumbs.map((item, index) => (
              <span key={index} className="contents">
                <span className="text-gray-200">—</span>
                {item.path ? (
                  <Link to={item.path} className="text-sm text-gray-400 hover:text-primary font-medium transition-colors">
                    {item.label}
                  </Link>
                ) : item.isActive ? (
                  <span className="text-sm text-primary font-semibold">{item.label}</span>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
})

PageBanner.displayName = 'PageBanner'

export default PageBanner
