import React, { memo, ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, Mail, Copy, Check } from 'lucide-react'
import clsx from 'clsx'
import logoFinds from '@/assets/images/brand/logo-finds.png'
import { useStoreModal } from '@/store/modal'

type props = {
  children?: ReactNode
}

type NavItem = {
  name: string
  path: string
  children?: { name: string; path: string }[]
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/' },
  {
    name: 'About FINDS',
    path: '/about/introduction',
    children: [
      { name: 'Introduction', path: '/about/introduction' },
      { name: 'Honors & Awards', path: '/about/honors' },
      { name: 'Location', path: '/about/location' },
    ]
  },
  {
    name: 'Members',
    path: '/members/director',
    children: [
      { name: 'Director', path: '/members/director' },
      { name: 'Current Members', path: '/members/current' },
      { name: 'Alumni', path: '/members/alumni' },
    ]
  },
  { name: 'Publications', path: '/publications' },
  { name: 'Projects', path: '/projects' },
  {
    name: 'Archives',
    path: '/archives/news',
    children: [
      { name: 'News', path: '/archives/news' },
      { name: 'Notice', path: '/archives/notice' },
      { name: 'Gallery', path: '/archives/gallery' },
    ]
  },
]

const footerLinks = [
  { name: '한국연구재단', url: 'https://www.nrf.re.kr', hoverColor: '#AC0E0E', hoverBg: '#AC0E0E' },
  { name: 'Google Scholar', url: 'https://scholar.google.com/', hoverColor: '#D6B14D', hoverBg: '#D6B14D' },
  { name: 'Web of Science', url: 'https://www.webofscience.com', hoverColor: '#E8D688', hoverBg: '#E8D688' },
  { name: 'Scopus', url: 'https://www.scopus.com', hoverColor: '#D6A076', hoverBg: '#D6A076' },
]

// Header logo text animation hook - simple dissolve fade
const useLogoTextAnimation = () => {
  const [showAlt, setShowAlt] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShowAlt(prev => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  return { showAlt }
}

// Contact Us Modal Content
const ContactModalContent = () => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const contacts = [
    { role: 'Director', email: 'ischoi@gachon.ac.kr', description: 'Research Inquiries & Collaborations' },
    { role: 'Webmaster', email: 'ischoi@gachon.ac.kr', description: 'Website Issues & Suggestions' },
    { role: 'Lab Administrator', email: 'ischoi@gachon.ac.kr', description: 'General Inquiries & Lab Operations' },
  ]

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <div className="">
      <div className="flex flex-col items-center text-center mb-24">
        <div className="size-64 md:size-80 bg-primary/10 rounded-full flex items-center justify-center mb-16 md:mb-20">
          <Mail size={28} className="text-primary md:hidden" />
          <Mail size={36} className="text-primary hidden md:block" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
        <p className="text-sm md:text-base text-gray-500">Feel free to reach out to us!</p>
      </div>

      <div className="flex flex-col gap-12 md:gap-16">
        {contacts.map((contact, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-14 md:p-16">
            <div className="flex flex-col gap-2 mb-10">
              <span className="text-sm md:text-base font-bold text-primary">{contact.role}</span>
              <span className="text-xs md:text-xs text-gray-400 leading-relaxed">{contact.description}</span>
            </div>
            <div className="flex items-center justify-between gap-8 md:gap-12">
              <a
                href={`mailto:${contact.email}`}
                className="text-sm md:text-base font-semibold text-gray-700 hover:text-primary hover:underline transition-colors truncate"
              >
                {contact.email}
              </a>
              <button
                onClick={() => handleCopyEmail(contact.email)}
                className="flex items-center gap-4 px-8 md:px-10 py-5 md:py-6 bg-white border border-gray-200 rounded-lg text-xs md:text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                aria-label={copiedEmail === contact.email ? '이메일 복사 완료' : `${contact.email} 복사`}
              >
                {copiedEmail === contact.email ? (
                  <>
                    <Check size={12} className="text-green-500" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LayoutOrganisms = ({ children }: props) => {
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null)
  const { showModal } = useStoreModal()
  const { showAlt: showAltText } = useLogoTextAnimation()
  const isHomePage = location.pathname === '/'

  // 모바일 메뉴 열릴 때 body 스크롤 방지 (iOS 포함)
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
    }
  }, [mobileMenuOpen])

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSubMenu(null)
  }, [location.pathname])

  const handleContactClick = () => {
    showModal({
      title: '',
      maxWidth: '450px',
      children: <ContactModalContent />
    })
  }

  const isActive = (item: NavItem) => {
    if (item.path === '/') {
      return location.pathname === '/'
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.path)
    }
    return location.pathname === item.path
  }

  const handleMouseEnter = (name: string) => {
    setOpenMenu(name)
  }

  const handleMouseLeave = () => {
    setOpenMenu(null)
  }

  const toggleMobileSubMenu = (name: string) => {
    setMobileSubMenu(mobileSubMenu === name ? null : name)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header - sticky on home page only */}
      <header className={`w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-[9999] ${isHomePage ? 'sticky top-0' : ''}`} role="banner" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-1480 mx-auto flex items-center justify-between px-16 md:px-20 py-10">
          {/* Logo with animated text - PC only animation, mobile static */}
          <Link to="/" className="flex items-center gap-12 md:gap-16" aria-label="FINDS Lab 홈으로 이동">
            <img src={logoFinds} alt="FINDS Lab" className="h-40 md:max-h-59" decoding="async" />
            
            {/* Mobile: Static FINDS Lab */}
            <span className="md:hidden text-lg font-bold">
              <span style={{ color: '#D6B14D' }}>FINDS </span>
              <span className="text-gray-900">Lab</span>
            </span>
            
            {/* PC: Animated text with simple dissolve */}
            <div className="hidden md:flex relative h-[44px] items-center overflow-hidden min-w-[200px]">
              {/* FINDS Lab */}
              <span 
                className={`font-bold transition-all duration-700 ease-in-out text-xl ${
                  showAltText ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <span style={{ color: '#D6B14D' }}>FINDS </span>
                <span className="text-gray-900">Lab</span>
              </span>
              {/* Financial Data Intelligence & Solutions Laboratory */}
              <span 
                className={`absolute left-0 flex flex-col leading-tight transition-all duration-700 ease-in-out ${
                  showAltText ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-[10px] font-semibold tracking-wide">
                  <span style={{ color: '#D6B14D' }}>Fin</span>
                  <span style={{ color: '#E8D688' }}>ancial </span>
                  <span style={{ color: '#D6B14D' }}>D</span>
                  <span style={{ color: '#E8D688' }}>ata Intelligence</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wide">
                  <span style={{ color: '#E8D688' }}>&amp; </span>
                  <span style={{ color: '#D6B14D' }}>S</span>
                  <span style={{ color: '#E8D688' }}>olutions </span>
                  <span className="text-gray-900">Laboratory</span>
                </span>
              </span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-8 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" role="navigation" aria-label="메인 네비게이션">
            <ul className="flex items-center gap-40 xl:gap-60">
              {navItems.map((item) => (
                <li
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => item.children && handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={item.path}
                    className={clsx(
                      'relative flex items-center gap-4 text-md transition-all duration-300 pt-8 pb-4',
                      isActive(item)
                        ? 'font-semibold text-primary'
                        : 'font-medium text-gray-900 hover:text-primary'
                    )}
                  >
                    {item.name}
                    {item.children && (
                      <ChevronDown
                        size={16}
                        className={clsx(
                          'transition-transform duration-300',
                          openMenu === item.name && 'rotate-180'
                        )}
                      />
                    )}
                    {/* Underline animation */}
                    <span className={clsx(
                      'absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300',
                      isActive(item) ? 'w-full' : 'w-0 group-hover:w-full'
                    )} />
                  </Link>

                  {/* Dropdown Menu */}
                  {item.children && openMenu === item.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-12 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-lg py-8 min-w-160">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={clsx(
                              'block px-20 py-12 text-base transition-all duration-200 hover:bg-gray-50 hover:pl-24 whitespace-nowrap',
                              location.pathname === child.path
                                ? 'text-primary font-medium bg-primary/5'
                                : 'text-gray-700'
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Us Button - Desktop */}
          <button
            onClick={handleContactClick}
            className="hidden md:flex items-center gap-8 px-20 py-12 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Mail size={16} />
            Contact Us
          </button>
        </div>
      </header>

      {/* Mobile Navigation - Outside header for proper z-index */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-[10000] overflow-y-auto" style={{ top: 'calc(61px + env(safe-area-inset-top))' }}>
          <nav className="px-16 py-16 max-w-1480 mx-auto">
            <ul className="flex flex-col gap-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleMobileSubMenu(item.name)}
                        className={clsx(
                          'w-full flex items-center justify-between py-12 text-base transition-colors',
                          isActive(item)
                            ? 'font-bold text-primary'
                            : 'font-semibold text-gray-900'
                        )}
                      >
                        {item.name}
                        <ChevronDown
                          size={18}
                          className={clsx(
                            'transition-transform duration-200',
                            mobileSubMenu === item.name && 'rotate-180'
                          )}
                        />
                      </button>

                      {/* Mobile Submenu */}
                      {mobileSubMenu === item.name && (
                        <div className="ml-16 mt-4 flex flex-col gap-4 border-l-2 border-primary/20 pl-12">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={clsx(
                                'py-8 px-8 -ml-8 text-sm rounded-lg transition-all duration-200',
                                location.pathname === child.path
                                  ? 'text-primary font-semibold bg-primary/5'
                                  : 'text-gray-400 font-medium active:bg-gray-100'
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        'block py-12 text-base transition-colors',
                        isActive(item)
                          ? 'font-bold text-primary'
                          : 'font-semibold text-gray-900'
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}

              {/* Contact Us Button - Mobile */}
              <li className="pt-16 mt-8 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleContactClick()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-8 px-20 py-14 bg-primary text-white text-base font-bold rounded-xl"
                >
                  <Mail size={18} />
                  Contact Us
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="overflow-x-hidden" role="main" aria-label="페이지 콘텐츠">{children}</main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-100" role="contentinfo" aria-label="사이트 정보">
        <div className="max-w-1480 mx-auto px-16 md:px-20 py-28 md:py-36">
          {/* Links Row - Each link with unique palette color */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-20 md:mb-24">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-12 py-6 text-[10px] md:text-xs text-gray-500 transition-all duration-300 font-medium tracking-wide"
                style={{ '--link-hover-color': link.hoverColor, '--link-hover-bg': `${link.hoverBg}10` } as React.CSSProperties}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:[color:var(--link-hover-color)]">{link.name}</span>
                <span className="absolute inset-0 bg-transparent rounded-full transition-all duration-300 group-hover:[background-color:var(--link-hover-bg)]" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-16 md:mb-20" />

          {/* Copyright - gradient swipe on hover (PC only) */}
          <p className="text-[10px] md:text-xs text-gray-400 text-center tracking-wide md:cursor-default">
            <span className="hidden md:inline-block relative group">
              <span className="relative z-10 bg-clip-text transition-all duration-700 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#AC0E0E] group-hover:via-[#D6B14D] group-hover:to-[#E8889C]">
                © 2026 FINDS Lab All Rights Reserved.
              </span>
              <span className="absolute bottom-0 left-1/2 w-0 h-px bg-gradient-to-r from-[#AC0E0E] via-[#D6B14D] to-[#E8889C] transition-all duration-500 group-hover:w-full group-hover:left-0" />
            </span>
            <span className="md:hidden">© 2026 FINDS Lab All Rights Reserved.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default memo(LayoutOrganisms)
