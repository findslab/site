import ResumeModal from '@/components/common/ResumeModal'
import {memo, useState, useEffect, useMemo, useRef, useCallback} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
  Building,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Home,
  Copy,
  Check,
  User,
  Users,
  Activity,
  Award,
  Medal,
  Trophy,
  Landmark,
  GraduationCap,
  Calendar,
  BookOpen,
  Search,
  Folder,
  Factory,
  School,
  FlaskConical,
  Crown,
  ShieldCheck,
  Compass,
  Microscope,
} from 'lucide-react'
import {useStoreModal} from '@/store/modal'
import type {HonorsData} from '@/types/data'
import {citationStats, affiliations, researchInterests} from '@/data/director-common'

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

// Format date from "Dec 5" to "MM-DD" format
const formatHonorDate = (dateStr: string): string => {
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

// Types
type Project = {
  titleEn: string
  titleKo: string
  period: string
  fundingAgency: string
  fundingAgencyKo: string
  type: 'government' | 'industry' | 'institution' | 'academic'
  roles: {
    principalInvestigator?: string
    leadResearcher?: string
    visitingResearcher?: string
    researchers?: string[]
  }
}

type Lecture = {
  role: string
  periods: string[]
  school: string
  courses: { en: string; ko: string }[]
  credits?: Record<string, number>
}

// Image Imports
import banner2 from '@/assets/images/banner/2.webp'
import directorImg from '@/assets/images/members/director.webp'
import logoKaist from '@/assets/images/logos/kaist.png'
import logoKyunghee from '@/assets/images/logos/kyunghee.png'
import logoGcu from '@/assets/images/logos/gcu.png'
import logoDwu from '@/assets/images/logos/dwu.png'
import logoFinds from '@/assets/images/logos/finds.png'
import logoKangnam from '@/assets/images/logos/kangnam.png'
import logoKorea from '@/assets/images/logos/korea.png'
import logoWorldquant from '@/assets/images/logos/worldquant.jpg'
import logoEy from '@/assets/images/logos/ey.png'
import logoJl from '@/assets/images/logos/jl.png'

// Static Data - Education
const education: any[] = [
  {
    school: 'Korea Advanced Institute of Science and Technology (KAIST)',
    period: '2025-02',
    degree: 'Doctor of Philosophy in Engineering (Ph.D. in Engineering)',
    field: 'Industrial and Systems Engineering',
    college: 'College of Engineering',
    dissertation: {
      en: 'LUCIDE: A Lucid, User-Centric, Intelligent, Data-Inspired, End-to-End System Framework for Illustrative Decision-Making in Financial Asset Management Services — Orchestrating Transparency-Oriented Financial Investment Solutions via Empirical Evidence and Clairvoyant-Guided Approaches from Iridescent and Analytical Perspectives',
      ko: 'LUCIDE: 금융 자산 운용 서비스에서의 설명적 의사결정 지원을 위한 고객 중심의 데이터 기반 지능형 시스템 통합 프레임워크 — 입체적 관점에서의 경험적 증거와 예측 분석 기반 접근을 통한 운용 투명성 지향적 통합형 금융 투자 방법론'
    },
    advisors: [
      {name: 'Woo Chang Kim', url: 'https://scholar.google.com/citations?user=7NmBs1kAAAAJ&hl=en'}
    ],
    researchGroup: {name: 'Financial Engineering Lab', department: 'Korea Advanced Institute of Science and Technology (KAIST)', url: 'https://felab.kaist.ac.kr/'},
    leadership: [
      {role: 'Member', roleKo: '대의원', context: 'Graduate School Central Operations Committee', contextKo: '대학원 총학생회 대의원회', period: '2021-09 – 2025-01'},
      {role: 'Graduate Student Representative', roleKo: '원우회장', context: 'Department of Industrial and Systems Engineering', contextKo: '산업및시스템공학과', period: '2021-09 – 2025-01'},
    ],
    awards: [{title: 'Best Doctoral Dissertation Award', titleKo: '우수박사학위논문상', org: 'Korean Operations Research and Management Science Society (KORMS)'}],
    honors: [],
    logo: logoKaist
  },
  {
    school: 'Korea Advanced Institute of Science and Technology (KAIST)',
    period: '2021-02',
    degree: 'Master of Science (M.S.)',
    field: 'Industrial and Systems Engineering',
    college: 'College of Engineering',
    thesis: {
      en: 'Empirical Analysis of Politically-Themed Stocks Using Text Mining Techniques and Entropy-Based Network Dynamics — Focus on the Republic of Korea\'s Case',
      ko: '텍스트 마이닝 기법과 엔트로피 기반의 네트워크 분석을 활용한 정치 테마주에 대한 실증적 분석 — 한국의 사례를 중심으로'
    },
    advisors: [
      {name: 'Woo Chang Kim', url: 'https://scholar.google.com/citations?user=7NmBs1kAAAAJ&hl=en'}
    ],
    researchGroup: {name: 'Financial Engineering Lab', department: 'Korea Advanced Institute of Science and Technology (KAIST)', url: 'https://felab.kaist.ac.kr/'},
    leadership: [],
    awards: [{title: 'Best Master Thesis Award', titleKo: '우수석사학위논문상', org: 'Korean Institute of Industrial Engineers (KIIE)'}],
    honors: [],
    logo: logoKaist
  },
  {
    school: 'Kyung Hee University',
    period: '2018-02',
    degree: 'Bachelor of Engineering (B.E.)',
    field: 'Industrial and Management Systems Engineering',
    college: 'College of Engineering',
    undergraduateTheses: [
      {
        number: '2nd',
        en: 'PREMISE: Prescription Data-Based Mobile Healthcare Information Management System',
        ko: '처방전을 활용한 개인 건강관리 어플리케이션 제안',
        advisorName: 'Jang Ho Kim'
      },
      {
        number: '1st',
        en: 'DOORS: Data-driven Optimal Operational Registration Strategies to Maximize Students\' Lecture Satisfaction',
        ko: '경희대학교 학부생의 수강 만족도 증대를 위한 최적의 수강신청 전략 개발',
        advisorName: 'Myoung-Ju Park'
      }
    ],
    advisors: [
      {name: 'Jang Ho Kim', url: 'https://scholar.google.com/citations?user=uTiqWBMAAAAJ&hl=en'},
      {name: 'Myoung-Ju Park', url: 'https://scholar.google.com/citations?user=O8OYIzMAAAAJ&hl=en&oi=sra'}
    ],
    researchGroup: {
      name: 'Financial Engineering Lab', 
      department: 'Kyung Hee University', 
      url: 'https://fintech.korea.ac.kr/members',
      role: 'Undergraduate Researcher'
    },
    leadership: [
      {role: 'Head of Culture & Public Relations', roleKo: '문화홍보국장', context: '41st Student Council, College of Engineering', contextKo: '제41대 공과대학 학생회', period: '2017-01 – 2017-11'},
      {role: 'President', roleKo: '학생회장', context: '7th Student Council, Department of Industrial and Management Systems Engineering', contextKo: '제7대 산업경영공학과 학생회', period: '2016-01 – 2016-12'},
    ],
    awards: [
      {title: 'Dean\'s Award for Academic Excellence', titleKo: '학장상 (성적우수)', college: 'College of Engineering', university: 'Kyung Hee University'},
      {title: 'Outstanding Project Award', titleKo: '우수프로젝트상', note: '2nd Graduation Paper', college: 'College of Engineering', university: 'Kyung Hee University'},
      {title: 'Outstanding Project Award', titleKo: '우수프로젝트상', note: '1st Graduation Paper', college: 'College of Engineering', university: 'Kyung Hee University'}
    ],
    honors: [{title: 'Valedictorian', titleKo: '수석 졸업', org: '1st out of 86 students', gpa: '4.42', gpaMax: '4.5'}],
    logo: logoKyunghee
  },
]

// Static Data - Employment (sorted by start date, newest first)
const employment = [
  {position: 'Assistant Professor (Tenure-Track)', positionKo: '조교수', department: 'Department of Finance & Big Data (Big Data Business Management Major), College of Business', departmentKo: '경영대학 금융·빅데이터학부 빅데이터경영전공', organization: 'Gachon University', organizationKo: '가천대학교', period: '2026-03 – Present', logo: logoGcu, isCurrent: true},
  {position: 'Assistant Professor (Tenure-Track)', positionKo: '조교수', department: 'Division of Business Administration, College of Business', departmentKo: '경영대학 경영융합학부', organization: 'Dongduk Women\'s University', organizationKo: '동덕여자대학교', period: '2025-09 – 2026-02', logo: logoDwu, isCurrent: false},
  {position: 'Director', positionKo: '연구실장', department: 'Financial Data Intelligence & Solutions Laboratory', departmentKo: '금융데이터인텔리전스연구실', organization: 'FINDS Lab', organizationKo: 'FINDS Lab', period: '2025-06 – Present', logo: logoFinds, isCurrent: true},
  {position: 'Postdoctoral Researcher', positionKo: '박사후연구원', department: 'Financial Technology Lab, Graduate School of Management of Technology', departmentKo: '기술경영전문대학원 금융기술연구실', organization: 'Korea University', organizationKo: '고려대학교', period: '2025-03 – 2025-08', logo: logoKorea, isCurrent: false},
  {position: 'Postdoctoral Researcher', positionKo: '박사후연구원', department: 'Financial Engineering Lab, Department of Industrial and Systems Engineering', departmentKo: '산업및시스템공학과 금융공학연구실', organization: 'Korea Advanced Institute of Science and Technology (KAIST)', organizationKo: '한국과학기술원', period: '2025-03 – 2025-08', logo: logoKaist, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Department of Electronic and Semiconductor Engineering, College of Engineering', departmentKo: '공과대학 전자반도체공학부 (舊 인공지능융합공학부)', organization: 'Kangnam University', organizationKo: '강남대학교', period: '2025-03 – 2026-02', logo: logoKangnam, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Division of Convergence Business (Digital Business Major), College of Global Business', departmentKo: '글로벌비즈니스대학 융합경영학부 디지털경영전공', organization: 'Korea University Sejong Campus', organizationKo: '고려대학교 세종캠퍼스', period: '2025-03 – 2026-02', logo: logoKorea, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Department of Industrial and Management Systems Engineering', departmentKo: '산업경영공학과', organization: 'Kyung Hee University', organizationKo: '경희대학교', period: '2024-03 – 2024-08', logo: logoKyunghee, isCurrent: false},
  {position: 'Research Consultant', positionKo: '연구 컨설턴트', department: '', departmentKo: '', organization: 'WorldQuant Brain', organizationKo: '월드퀀트 브레인', period: '2022-06 – Present', logo: logoWorldquant, isCurrent: true},
  {position: 'Intern', positionKo: '인턴', department: 'Data & Analytics Team', departmentKo: '데이터 애널리틱스 팀', organization: 'EY Consulting', organizationKo: 'EY컨설팅', period: '2020-03 – 2020-05', logo: logoEy, isCurrent: false},
  {position: 'Research Consultant', positionKo: '연구 컨설턴트', department: '', departmentKo: '', organization: 'WorldQuant WebSim', organizationKo: '월드퀀트 웹심', period: '2018-07 – 2019-12', logo: logoWorldquant, isCurrent: false},
  {position: 'Director', positionKo: '대표', department: '', departmentKo: '', organization: 'JL Creatives & Contents (JL C&C)', organizationKo: 'JL크리에이티브&콘텐츠', period: '2014-06 – Present', logo: logoJl, isCurrent: true},
]

// Static Data - Professional Affiliations, Citation Statistics, Research Interests
// Now imported from @/data/director-common.ts


export const MembersDirectorPortfolioProfileTemplate = () => {
  const [emailCopied, setEmailCopied] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [teachingSearchTerm, setTeachingSearchTerm] = useState('')
  const [expandedProjectYears, setExpandedProjectYears] = useState<string[]>([])
  const [honorsData, setHonorsData] = useState<HonorsData | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013']))
  const [expandedEduAwards, setExpandedEduAwards] = useState<Set<number>>(new Set([0, 1, 2])) // For education awards/honors - all expanded
  const [expandedEduSections, setExpandedEduSections] = useState<Set<string>>(new Set([
    '0-dissertation', '0-advisor', '0-researchGroup', '0-leadership', '1-thesis', '1-advisor', '1-researchGroup', '2-graduationPaper', '2-advisor', '2-researchGroup', '2-leadership'
  ])) // For education sub-sections - all expanded by default
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    researchInterests: true,
    education: true,
    employment: true,
    projectStats: true,
    honorsStats: true
  })
  
  // Sticky profile card refs and state
  const profileCardRef = useRef<HTMLDivElement>(null)
  const contentSectionRef = useRef<HTMLElement>(null)
  const [profileTop, setProfileTop] = useState(0)
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  
  // Sticky profile card effect
  useEffect(() => {
    const handleScroll = () => {
      if (!profileCardRef.current || !contentSectionRef.current) return
      if (window.innerWidth < 1024) return // Only on desktop
      
      const section = contentSectionRef.current
      const card = profileCardRef.current
      const sectionRect = section.getBoundingClientRect()
      const cardHeight = card.offsetHeight
      const navHeight = 16 // Small top padding (no sticky top bar)
      const topOffset = navHeight + 16 // Below nav + small padding
      const bottomPadding = 32
      
      // Section의 시작이 topOffset 위로 올라가면 sticky 시작
      if (sectionRect.top <= topOffset) {
        // Section의 끝이 card + topOffset + padding 보다 작으면 bottom에 고정
        if (sectionRect.bottom <= cardHeight + topOffset + bottomPadding) {
          setProfileTop(sectionRect.bottom - cardHeight - bottomPadding - sectionRect.top)
        } else {
          // 위쪽에 고정 (nav bar 바로 아래)
          setProfileTop(topOffset - sectionRect.top)
        }
      } else {
        setProfileTop(0)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({...prev, [section]: !prev[section as keyof typeof prev]}))
  }
  
  const toggleEduAwards = (idx: number) => {
    setExpandedEduAwards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) {
        newSet.delete(idx)
      } else {
        newSet.add(idx)
      }
      return newSet
    })
  }
  
  const toggleEduSection = (key: string) => {
    setExpandedEduSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }
  
  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev)
      if (newSet.has(year)) {
        newSet.delete(year)
      } else {
        newSet.add(year)
      }
      return newSet
    })
  }
  const [pubStats, setPubStats] = useState<{label: string, count: number}[]>([
    {label: 'SCIE', count: 0}, {label: 'SSCI', count: 0}, {label: 'A&HCI', count: 0}, 
    {label: 'ESCI', count: 0}, {label: 'Scopus', count: 0}, {label: 'Other Int\'l', count: 0},
    {label: 'Int\'l Conf', count: 0}, {label: 'KCI', count: 0}, {label: 'Dom. Conf', count: 0}
  ])
  const {showModal} = useStoreModal()
  const location = useLocation()
  const directorEmail = 'ischoi@gachon.ac.kr'

  // Fetch Projects, Lectures, and Publications data
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    
    // Fetch Publications and calculate stats
    fetch(`${baseUrl}data/pubs.json`)
      .then(res => res.json())
      .then((pubs: any[]) => {
        const stats = {
          scie: 0, ssci: 0, ahci: 0, esci: 0, scopus: 0, otherIntl: 0,
          intlConf: 0, kci: 0, domConf: 0
        }
        
        pubs.forEach(pub => {
          const indexing = pub.indexing_group || ''
          const type = pub.type || ''
          
          if (type === 'journal') {
            if (indexing === 'SCIE') stats.scie++
            else if (indexing === 'SSCI') stats.ssci++
            else if (indexing === 'A&HCI') stats.ahci++
            else if (indexing === 'ESCI') stats.esci++
            else if (indexing === 'Scopus') stats.scopus++
            else if (indexing === 'Other International') stats.otherIntl++
            else if (indexing.includes('KCI')) stats.kci++
          } else if (type === 'conference') {
            if (indexing === 'Scopus') {
              stats.scopus++
              stats.intlConf++
            } else if (indexing === 'International Conference') stats.intlConf++
            else if (indexing === 'Domestic Conference') stats.domConf++
          }
        })
        
        setPubStats([
          {label: 'SCIE', count: stats.scie},
          {label: 'SSCI', count: stats.ssci},
          {label: 'A&HCI', count: stats.ahci},
          {label: 'ESCI', count: stats.esci},
          {label: 'Scopus', count: stats.scopus},
          {label: 'Other Int\'l', count: stats.otherIntl},
          {label: 'Int\'l Conf', count: stats.intlConf},
          {label: 'KCI', count: stats.kci},
          {label: 'Dom. Conf', count: stats.domConf}
        ])
      })
      .catch(console.error)
    
    // Fetch Projects - all projects where director is involved
    fetch(`${baseUrl}data/projects.json`)
      .then(res => res.json())
      .then((data: Project[]) => {
        // Show all projects (no date filter) - most recent first
        const sortedProjects = [...data].sort((a, b) => {
          const dateA = new Date(a.period.split('–')[0].trim())
          const dateB = new Date(b.period.split('–')[0].trim())
          return dateB.getTime() - dateA.getTime()
        })
        setProjects(sortedProjects)
        // Expand all years by default
        const years = [...new Set(sortedProjects.map(p => p.period.split('–')[0].trim().slice(0, 4)))]
        setExpandedProjectYears(years)
      })
      .catch(console.error)

    // Fetch Lectures - current semester
    fetch(`${baseUrl}data/lectures.json`)
      .then(res => res.json())
      .then((data: Lecture[]) => {
        setLectures(data)
      })
      .catch(console.error)
    
    // Fetch Honors data
    fetch(`${baseUrl}data/honors.json`)
      .then(res => res.json())
      .then((data: HonorsData) => {
        setHonorsData(data)
        // PC: Auto-expand all years
        if (window.innerWidth >= 768) {
          const years = Object.keys(data).sort((a, b) => Number(b) - Number(a))
          setExpandedYears(new Set(years))
        }
        // Mobile: All collapsed by default (empty Set)
      })
      .catch(console.error)
  }, [])

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directorEmail)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  // Group projects by year
  const projectsByYear = useMemo(() => {
    const filtered = projectSearchTerm.trim()
      ? projects.filter(p => 
          p.titleEn.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          p.titleKo.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          p.fundingAgency.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          p.fundingAgencyKo.toLowerCase().includes(projectSearchTerm.toLowerCase())
        )
      : projects

    const grouped: Record<string, Project[]> = {}
    filtered.forEach(p => {
      const year = p.period.split('–')[0].trim().slice(0, 4)
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(p)
    })
    return grouped
  }, [projects, projectSearchTerm])

  const projectYears = useMemo(() => {
    return Object.keys(projectsByYear).sort((a, b) => parseInt(b) - parseInt(a))
  }, [projectsByYear])

  const toggleProjectYear = (year: string) => {
    setExpandedProjectYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    )
  }

  // Group lectures by course name and aggregate semesters, with role information
  const groupedLectures = useMemo(() => {
    const filtered = teachingSearchTerm.trim()
      ? lectures.filter(l =>
          l.courses.some(c => 
            c.en.toLowerCase().includes(teachingSearchTerm.toLowerCase()) ||
            c.ko.toLowerCase().includes(teachingSearchTerm.toLowerCase())
          ) ||
          l.school.toLowerCase().includes(teachingSearchTerm.toLowerCase())
        )
      : lectures

    // Group by course name (en) to aggregate semesters
    const courseMap: Record<string, {
      school: string
      courseName: string
      courseNameKo: string
      periods: string[]
      role: string
    }> = {}

    filtered.forEach(lecture => {
      lecture.courses.forEach(course => {
        const key = `${lecture.school}-${course.en}-${lecture.role}`
        if (!courseMap[key]) {
          courseMap[key] = {
            school: lecture.school,
            courseName: course.en,
            courseNameKo: course.ko,
            periods: [...lecture.periods],
            role: lecture.role
          }
        } else {
          // Add new periods that are not already in the list
          lecture.periods.forEach(p => {
            if (!courseMap[key].periods.includes(p)) {
              courseMap[key].periods.push(p)
            }
          })
        }
      })
    })

    // Sort periods in each course (most recent first, but within same semester: 1 before 2)
    Object.values(courseMap).forEach(course => {
      course.periods.sort((a, b) => {
        const [yearA, semA] = a.split(' ')
        const [yearB, semB] = b.split(' ')
        if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA)
        // Extract base semester (Fall, Spring) and number suffix (-1, -2)
        const baseA = semA.replace(/-\d+$/, '')
        const baseB = semB.replace(/-\d+$/, '')
        if (baseA !== baseB) return baseB.localeCompare(baseA) // Fall > Spring in same year
        // Same base semester, sort by number suffix ascending (1 before 2)
        const numA = parseInt(semA.match(/-(\d+)$/)?.[1] || '0')
        const numB = parseInt(semB.match(/-(\d+)$/)?.[1] || '0')
        return numA - numB
      })
    })

    return Object.values(courseMap)
  }, [lectures, teachingSearchTerm])

  // Separate Lecturer and TA courses
  const lecturerCourses = useMemo(() => 
    groupedLectures.filter(c => c.role === 'Lecturer'), [groupedLectures])
  
  const taCourses = useMemo(() => 
    groupedLectures.filter(c => c.role === 'Teaching Assistant'), [groupedLectures])

  // Count total semesters (sum of all periods across all courses)
  const totalSemesters = useMemo(() => 
    groupedLectures.reduce((sum, course) => sum + course.periods.length, 0), [groupedLectures])
  
  const lecturerSemesters = useMemo(() => 
    lecturerCourses.reduce((sum, course) => sum + course.periods.length, 0), [lecturerCourses])
  
  const taSemesters = useMemo(() => 
    taCourses.reduce((sum, course) => sum + course.periods.length, 0), [taCourses])

  const projectStats = useMemo(() => {
    const piProjects = projects.filter(p => p.roles.principalInvestigator === '최인수')
    const piIds = new Set(piProjects.map((_, i) => i))
    const remaining1 = projects.filter((_, i) => !piIds.has(i))
    const leadProjects = remaining1.filter(p => p.roles.leadResearcher === '최인수')
    const leadSet = new Set(leadProjects.map(p => p.titleEn))
    const remaining2 = remaining1.filter(p => !leadSet.has(p.titleEn))
    const visitingProjects = remaining2.filter(p => p.roles.visitingResearcher === '최인수')
    const visitingSet = new Set(visitingProjects.map(p => p.titleEn))
    const remaining3 = remaining2.filter(p => !visitingSet.has(p.titleEn))
    const researcherProjects = remaining3.filter(p => p.roles.researchers?.includes('최인수'))
    return {
      total: projects.length,
      government: projects.filter(p => p.type === 'government').length,
      industry: projects.filter(p => p.type === 'industry').length,
      institution: projects.filter(p => p.type === 'institution').length,
      academic: projects.filter(p => p.type === 'academic').length,
      pi: piProjects.length,
      lead: leadProjects.length,
      visiting: visitingProjects.length,
      researcher: researcherProjects.length,
    }
  }, [projects])

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center md:scale-105 transition-transform duration-[2000ms]"
          style={{backgroundImage: `url(${banner2})`}}
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
              Members
            </span>
            <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-[#D6B14D]/80" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center tracking-tight mb-16 md:mb-20">
            Director
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
              <Home size={16}/>
            </Link>
            <span className="text-gray-200">—</span>
            <Link to="/members" className="text-sm text-gray-400 font-medium hover:text-primary transition-colors">Members</Link>
            <span className="text-gray-200">—</span>
            <Link to="/members/director" className="text-sm text-gray-400 font-medium hover:text-primary transition-colors">Director</Link>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Profile</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section ref={contentSectionRef} className="max-w-1480 mx-auto w-full px-16 md:px-20 pb-60 md:pb-100 pt-24 md:pt-32">
        <div className="flex flex-col lg:flex-row gap-32 md:gap-60">
          {/* Left Column: Profile Card */}
          <aside className="lg:w-340 shrink-0">
            <div 
              ref={profileCardRef}
              className="transition-transform duration-100"
              style={{ transform: `translateY(${profileTop}px)` }}
            >
              {/* Tab Navigation - Desktop: above profile card */}
              <div className="hidden lg:flex items-center gap-6 mb-12">
                <Link
                  to="/members/director/portfolio/profile"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-md shadow-primary/25"
                >
                  <User size={14} />
                  Profile
                </Link>
                <Link
                  to="/members/director/portfolio/academic"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                >
                  <BookOpen size={14} />
                  Academics
                </Link>
                <Link
                  to="/members/director/portfolio/activities"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                >
                  <Activity size={14} />
                  Activities
                </Link>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-16 md:p-20 shadow-sm">
              <div className="flex flex-col items-center text-center mb-20 md:mb-24">
                <div 
                  className="w-120 h-155 md:w-140 md:h-180 bg-gray-100 rounded-2xl overflow-hidden mb-12 md:mb-16 shadow-inner border border-gray-50 relative select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img 
                    loading="lazy" 
                    decoding="async" 
                    src={directorImg} 
                    alt="Prof. Insu Choi" 
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Transparent overlay to prevent image interaction */}
                  <div className="absolute inset-0" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">Insu Choi</h2>
              </div>

              <div className="flex flex-col gap-12 md:gap-16">
                <div className="flex items-start gap-10 group">
                  <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Briefcase size={14}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">Position</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Director</p>
                    <p className="text-xs md:text-sm text-gray-500">FINDS Lab</p>
                  </div>
                </div>
                <div className="flex items-start gap-10 group">
                  <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Building size={14}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">Affiliation</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Assistant Professor</p>
                    <p className="text-xs md:text-sm text-gray-500">Gachon University</p>
                  </div>
                </div>
                <div className="flex items-start gap-10 group">
                  <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <MapPin size={14}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">Office</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Room 304, Gachon Hall</p>
                  </div>
                </div>
                <div className="flex items-start gap-10 group">
                  <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Mail size={14}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">E-mail</p>
                    <div className="flex items-center gap-6">
                      <a href={`mailto:${directorEmail}`} className="select-text text-xs md:text-sm font-semibold text-primary hover:underline break-all">
                        {directorEmail}
                      </a>
                      <button 
                        onClick={handleCopyEmail} 
                        className="size-20 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors shrink-0" 
                        title="Copy email"
                      >
                        {emailCopied ? <Check size={10} className="text-green-500"/> : <Copy size={10} className="text-gray-400"/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:gap-8 mt-16 md:mt-20">
                <button 
                  onClick={() => showModal({
                    title: '',
                    maxWidth: '800px',
                    children: <ResumeModal />
                  })}
                  className="flex items-center justify-center gap-4 py-10 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  Resume <ExternalLink size={12}/>
                </button>
                <a 
                  href="https://scholar.google.com/citations?user=p9JwRLwAAAAJ&hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-4 py-10 bg-primary text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
                  style={{ color: 'white' }}
                >
                  Scholar <ExternalLink size={12}/>
                </a>
              </div>
              <Link 
                to="/members/director"
                className="flex items-center justify-center gap-4 mt-8 py-10 bg-white border border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all"
              >
                <ChevronLeft size={12}/> Back to Overview
              </Link>
            </div>
            </div>
          </aside>

          {/* Right Column */}
          <main className="flex-1 flex flex-col gap-40 md:gap-56 min-w-0">
            {/* Introduction */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('introduction')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Introduction</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.introduction ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.introduction && (
              <div className="bg-gradient-to-br from-gray-50 to-white p-20 md:p-32 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-20">
                  I am an <span className="font-bold text-gray-900">assistant professor</span> at <span className="font-bold text-gray-900">Gachon University</span> and the <span className="font-bold text-gray-900">director</span> of <span className="font-bold text-gray-900">FINDS Lab</span>, with research interests spanning{' '}
                  <span className="font-bold text-primary">Financial Data Science</span>,{' '}
                  <span className="font-bold text-primary">Business Analytics</span>, and{' '}
                  <span className="font-bold text-primary">Data-Informed Decision Making</span>.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base font-semibold mb-16">
                  My research focuses on three main areas:
                </p>
                <div className="grid grid-cols-1 gap-12 md:gap-16 mb-24">
                  <div className="flex gap-12 md:gap-16 p-16 md:p-20 bg-white border border-gray-100 rounded-xl hover:border-[#D6B14D]/30 hover:shadow-md transition-all">
                    <span className="size-28 md:size-32 bg-primary text-white text-sm md:text-base font-bold rounded-full flex items-center justify-center shrink-0">1</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base mb-4" style={{color: '#D6B14D'}}>Financial Data Science</p>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                        Designing advanced asset strategies by orchestrating financial data with clairvoyant-guided modeling
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-12 md:gap-16 p-16 md:p-20 bg-white border border-gray-100 rounded-xl hover:border-[#D6B14D]/30 hover:shadow-md transition-all">
                    <span className="size-28 md:size-32 bg-primary text-white text-sm md:text-base font-bold rounded-full flex items-center justify-center shrink-0">2</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base mb-4" style={{color: '#D6B14D'}}>Business Analytics</p>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                        Fostering industrial convergence by intellectualizing complex data to enhance user-centric transparency
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-12 md:gap-16 p-16 md:p-20 bg-white border border-gray-100 rounded-xl hover:border-[#D6B14D]/30 hover:shadow-md transition-all">
                    <span className="size-28 md:size-32 bg-primary text-white text-sm md:text-base font-bold rounded-full flex items-center justify-center shrink-0">3</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base mb-4" style={{color: '#D6B14D'}}>Data-Informed Decision Making</p>
                      <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                        Empowering strategic choices by extracting iridescent insights to build lucid and trustworthy systems
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base pt-20 border-t border-gray-200">
                  My goal is to <span className="font-semibold text-gray-800">connect academic research with practical applications</span>, developing ideas that are both <span className="font-semibold text-primary">well-grounded</span> and <span className="font-semibold text-primary">useful</span>.
                </p>
              </div>
              )}
            </section>

            {/* Research Interests */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('researchInterests')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Research Interests</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.researchInterests ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.researchInterests && (
              <div className="p-20 md:p-24 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {researchInterests.map((area, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-xl p-20 md:p-24 hover:shadow-lg hover:border-[#D6B14D]/30 transition-all group">
                    <div className="mb-16 pb-12 border-b border-gray-100">
                      <h4 className="text-sm md:text-base font-bold text-primary">{area.category}</h4>
                    </div>
                    <ul className="space-y-10">
                      {area.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-10">
                          <span className="size-5 rounded-full shrink-0 mt-[6px] bg-primary/40"/>
                          <span className="text-[11px] md:text-sm text-gray-700 font-medium leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
              )}
            </section>

            {/* Education */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('education')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Education</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.education ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.education && (
              <div className="p-20 md:p-24 border-t border-gray-100">
              <div className="relative border-l-2 border-primary/20 ml-6 md:ml-8">
                {education.map((edu, index) => (
                  <div key={index} className="relative pb-32 last:pb-0 group pl-24 md:pl-32">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-1/2" style={{left: '-1px'}}>
                      <div className="size-12 md:size-16 bg-primary rounded-full border-3 md:border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#D6B14D]/30"/>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-16 md:p-24 hover:shadow-md transition-all">
                      {/* Header: Logo + Degree/School/Field */}
                      <div className="flex flex-col items-start gap-12 md:gap-16">
                        <div className="size-56 md:size-64 bg-gray-50 rounded-xl p-8 flex items-center justify-center shrink-0">
                          <img loading="lazy" decoding="async" src={edu.logo} alt={edu.school} className="w-full h-full object-contain"/>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          {/* Period + Honor/Award Badges */}
                          <div className="flex flex-wrap items-center justify-start gap-4 md:gap-6 mb-8 md:mb-10">
                            <span className="px-8 md:px-10 py-2 md:py-3 text-[10px] md:text-xs font-bold rounded-full bg-primary text-white">{edu.period}</span>
                            {edu.honors && edu.honors.length > 0 && (
                              <span className="flex items-center gap-3 px-6 md:px-8 py-2 md:py-3 text-[10px] md:text-xs font-bold rounded-full" style={{backgroundColor: '#FFF3CC', color: '#B8962D'}}>
                                <Medal size={10} />
                                Honor
                              </span>
                            )}
                            {edu.awards && edu.awards.length > 0 && (
                              <span className="flex items-center gap-3 px-6 md:px-8 py-2 md:py-3 text-[10px] md:text-xs font-bold rounded-full" style={{backgroundColor: 'rgba(172, 14, 14, 0.1)', color: 'rgb(172, 14, 14)'}}>
                                <Award size={10} />
                                Award
                              </span>
                            )}
                          </div>
                          {/* Degree - Largest */}
                          <p className="text-sm md:text-base font-bold text-gray-900 leading-tight">{edu.degree.includes("(Ph.D.") ? <>{edu.degree.split(" (")[0]}<br className="md:hidden" /><span className="text-sm md:text-base text-gray-900 font-bold"> ({edu.degree.split(" (")[1]}</span></> : edu.degree}</p>
                          {/* Field - Department */}
                          <p className="text-xs md:text-sm font-bold text-gray-600 mt-2">{edu.field}</p>
                          {/* School */}
                          <p className="text-xs md:text-sm text-gray-500 font-bold">{edu.school}</p>
                        </div>
                      </div>
                      
                      {/* Details Section */}
                      {(edu.dissertation || edu.thesis || edu.undergraduateTheses || edu.advisors?.length > 0 || edu.researchGroup || edu.leadership?.length > 0 || edu.awards?.length > 0 || edu.honors?.length > 0) && (
                        <div className="mt-16 pt-16 border-t border-gray-100 space-y-12">
                          {/* Dissertation (Ph.D.) */}
                          {edu.dissertation && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-dissertation`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Dissertation</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-dissertation`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-dissertation`) && (
                                <div className="p-12">
                                  <div className="bg-white rounded-lg px-12 py-10 border border-gray-100">
                                    <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
                                      {edu.dissertation.en.split(' — ')[0]}
                                    </p>
                                    {edu.dissertation.en.includes(' — ') && (
                                      <p className="text-xs md:text-sm font-medium text-gray-500 mt-4 leading-relaxed">— {edu.dissertation.en.split(' — ')[1]}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Thesis (M.S.) */}
                          {edu.thesis && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-thesis`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Thesis</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-thesis`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-thesis`) && (
                                <div className="p-12">
                                  <div className="bg-white rounded-lg px-12 py-10 border border-gray-100">
                                    <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
                                      {edu.thesis.en.split(' — ')[0]}
                                    </p>
                                    {edu.thesis.en.includes(' — ') && (
                                      <p className="text-xs md:text-sm font-medium text-gray-500 mt-4 leading-relaxed">— {edu.thesis.en.split(' — ')[1]}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Undergraduate Theses (B.E.) */}
                          {edu.undergraduateTheses && edu.undergraduateTheses.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-graduationPaper`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Graduation Paper</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-graduationPaper`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-graduationPaper`) && (
                                <div className="p-12 space-y-12">
                                  {edu.undergraduateTheses.map((thesis: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg p-12 border border-gray-100">
                                      {/* Header: Number Badge & Advisor Name */}
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-12 pb-10 border-b border-gray-100">
                                        <span className="px-10 py-4 bg-primary text-white text-[10px] md:text-xs font-bold rounded-full w-fit">{thesis.number} Paper</span>
                                        <div className="flex items-center gap-6 px-10 py-4 bg-gray-50 rounded-full border border-gray-100">
                                          <GraduationCap size={12} className="text-[#D6B14D]" />
                                          <span className="text-[10px] md:text-xs font-bold text-gray-600">{thesis.advisorName}</span>
                                        </div>
                                      </div>
                                      {/* English Title */}
                                      <div>
                                        <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
                                          {thesis.en}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Advisor */}
                          {edu.advisors && edu.advisors.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-advisor`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Advisor</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-advisor`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-advisor`) && (
                                <div className="p-12 space-y-6">
                                  {edu.advisors.map((adv: any, i: number) => (
                                    <a 
                                      key={i}
                                      href={adv.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-8 bg-white rounded-lg px-12 py-10 hover:bg-gray-50 transition-colors group border border-gray-100"
                                    >
                                      <div className="flex items-center gap-8">
                                        <GraduationCap className="size-14 text-[#D6B14D]" />
                                        <span className="text-xs md:text-sm font-bold text-gray-800">{adv.name}</span>
                                      </div>
                                      <ExternalLink className="size-12 text-gray-400 group-hover:text-[#D6B14D] transition-colors" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Research Group */}
                          {edu.researchGroup && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-researchGroup`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Research Group</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-researchGroup`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-researchGroup`) && (
                                <div className="p-12">
                                  <a 
                                    href={edu.researchGroup.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-start justify-between gap-8 bg-white rounded-lg px-12 py-10 hover:bg-gray-50 transition-colors group border border-gray-100"
                                  >
                                    <div className="flex items-start gap-8">
                                      <Building className="size-14 text-[#D6B14D] shrink-0 mt-1" />
                                      <div className="flex flex-col">
                                        <span className="text-xs md:text-sm font-bold text-gray-800">{edu.researchGroup.name}</span>
                                        {edu.researchGroup.department && (
                                          <span className="text-xs md:text-sm text-gray-500 font-medium">{edu.researchGroup.department}</span>
                                        )}
                                        {edu.researchGroup.role && (
                                          <span className="text-[10px] md:text-xs text-gray-600 font-medium mt-4 flex items-center gap-4">
                                            <span className="size-4 rounded-full bg-[#D6B14D]/60 shrink-0" />
                                            {edu.researchGroup.role}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-4 shrink-0">
                                      {edu.researchGroup.period && (
                                        <span className="px-8 py-3 bg-gray-100 rounded-full text-[10px] md:text-xs font-bold text-gray-600 whitespace-nowrap">{edu.researchGroup.period}</span>
                                      )}
                                      <ExternalLink className="size-12 text-gray-400 group-hover:text-[#D6B14D] transition-colors" />
                                    </div>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Leadership */}
                          {edu.leadership && edu.leadership.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleEduSection(`${index}-leadership`)}
                                className="w-full flex items-center justify-between px-12 py-10 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">Leadership Roles</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduSections.has(`${index}-leadership`) ? 'rotate-180' : ''}`}/>
                              </button>
                              {expandedEduSections.has(`${index}-leadership`) && (
                                <div className="p-12 space-y-8">
                                  {edu.leadership.map((l: any, i: number) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8 bg-white rounded-lg px-12 py-10 border border-gray-100">
                                      <div className="flex items-start gap-8">
                                        <Users className="size-14 text-[#D6B14D] shrink-0 mt-1" />
                                        <div className="flex flex-col">
                                          <span className="text-xs md:text-sm font-bold text-gray-800">{l.role}</span>
                                          <span className="text-xs md:text-sm text-gray-500 font-medium">{l.context}</span>
                                          <span className="md:hidden text-[10px] text-gray-400 font-medium mt-2">{l.period}</span>
                                        </div>
                                      </div>
                                      <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">{l.period}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Collapsible Honors & Awards */}
                          {((edu.awards && edu.awards.length > 0) || (edu.honors && edu.honors.length > 0)) && (
                            <div className="pt-12 border-t border-gray-100">
                              <button 
                                onClick={() => toggleEduAwards(index)}
                                className="flex items-center justify-between w-full group mb-10"
                              >
                                <p className="text-[10px] md:text-xs font-bold text-gray-400">Honors & Awards</p>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedEduAwards.has(index) ? 'rotate-180' : ''}`}/>
                              </button>
                              
                              {expandedEduAwards.has(index) && (
                                <div className="space-y-12">
                                  {edu.honors && edu.honors.length > 0 && (
                                    <div className="space-y-6">
                                      {edu.honors.map((h: any, i: number) => (
                                        <div key={i} className="flex flex-col items-start bg-[#FFF9E6] rounded-lg px-12 py-14">
                                          <Medal className="shrink-0 size-20 mb-10" style={{color: '#D6B14D'}} />
                                          <span className="text-xs md:text-sm font-bold text-gray-800">{h.title}</span>
                                          <span className="text-xs md:text-sm text-gray-500 font-medium mt-4">{h.org}</span>
                                          {h.gpa && (
                                            <div className="flex items-center gap-6 mt-4">
                                              <span className="w-5 h-5 rounded-full shrink-0" style={{backgroundColor: 'rgb(214, 177, 77)'}} />
                                              <span className="text-xs md:text-sm text-gray-500 font-medium">
                                                <span className="font-bold" style={{color: '#D6B14D'}}>{h.gpa}</span>
                                                {' '}
                                                <span className="font-bold text-gray-700">GPA</span>
                                                {' '}
                                                <span className="text-gray-500">on a {h.gpaMax} scale</span>
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {edu.awards && edu.awards.length > 0 && (
                                    <div className="space-y-6">
                                      {edu.awards.map((a: any, i: number) => (
                                        <div key={i} className="flex flex-col items-start rounded-lg px-12 py-14" style={{backgroundColor: 'rgba(172, 14, 14, 0.05)'}}>
                                          <Trophy className="shrink-0 size-20 mb-10" style={{color: 'rgb(172, 14, 14)'}} />
                                          <span className="text-xs md:text-sm font-bold text-gray-800">{a.title}</span>
                                          {a.note && <span className="text-xs md:text-sm font-bold mt-2" style={{color: '#D6B14D'}}>{a.note}</span>}
                                          {a.college && a.university ? (
                                            <div className="flex flex-col mt-4">
                                              <span className="text-xs md:text-sm text-gray-400 font-medium">{a.college}</span>
                                              <span className="text-xs md:text-sm text-gray-700 font-medium">{a.university}</span>
                                            </div>
                                          ) : (
                                            <span className="text-xs md:text-sm text-gray-500 font-medium mt-4">{a.org}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
              )}
            </section>

            {/* Employment */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('employment')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Employment</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.employment ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.employment && (
              <div className="p-20 md:p-24 border-t border-gray-100">
              <div className="relative border-l-2 border-primary/20 ml-6 md:ml-8">
                {employment.map((emp, index) => (
                  <div key={index} className="relative pb-16 md:pb-24 last:pb-0 group pl-24 md:pl-32">
                    {/* Timeline dot - vertically centered */}
                    <div className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-1/2" style={{left: '-1px'}}>
                      <div className={`size-12 md:size-16 rounded-full border-3 md:border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                        emp.isCurrent ? 'bg-primary group-hover:shadow-[#D6B14D]/30' : 'bg-gray-300 group-hover:shadow-gray-300/50'
                      }`}/>
                    </div>
                    <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16 bg-white border border-gray-100 rounded-lg md:rounded-xl p-12 md:p-16 hover:shadow-lg hover:shadow-[#D6B14D]/10 hover:border-[#D6B14D]/40 hover:bg-gradient-to-r hover:from-white hover:to-primary/[0.02] transition-all duration-300 min-h-[100px] md:min-h-[110px]">
                      <div className="size-48 md:size-44 bg-gray-50 rounded-lg p-6 flex items-center justify-center shrink-0">
                        <img loading="lazy" decoding="async" src={emp.logo} alt={emp.organization || emp.position} className="w-full h-full object-contain"/>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                        <div className="flex flex-wrap items-center justify-start gap-6 md:gap-8 mb-4">
                          <span className={`px-8 md:px-10 py-2 text-[10px] md:text-xs font-bold rounded-full ${
                            emp.isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>{emp.period}</span>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-gray-900">{emp.position}</h4>
                        {emp.organization && <p className="text-xs md:text-sm text-gray-500 font-bold break-words">{emp.organization}</p>}
                        {emp.department && emp.department.includes(',') ? (
                          <>
                            <p className="text-xs md:text-sm font-medium text-gray-600 break-words">{emp.department.split(',')[0].trim()}</p>
                            <p className="text-xs md:text-sm text-gray-500 break-words">{emp.department.split(',').slice(1).join(',').trim()}</p>
                          </>
                        ) : emp.department && (
                          <p className="text-xs md:text-sm font-medium text-gray-600 break-words">{emp.department}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
              )}
            </section>
          </main>
        </div>
      </section>

      {/* Mobile Floating Tab Button */}
      <div className="lg:hidden fixed bottom-24 right-16 z-50">
        {mobileTabOpen && (
          <div className="absolute bottom-56 right-0 flex flex-col gap-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Link
              to="/members/director/portfolio/profile"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-primary/20 whitespace-nowrap bg-primary text-white"
            >
              <User size={13} />
              Profile
            </Link>
            <Link
              to="/members/director/portfolio/academic"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-gray-200 whitespace-nowrap bg-white text-gray-600 hover:bg-gray-50"
            >
              <BookOpen size={13} />
              Academics
            </Link>
            <Link
              to="/members/director/portfolio/activities"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-gray-200 whitespace-nowrap bg-white text-gray-600 hover:bg-gray-50"
            >
              <Activity size={13} />
              Activities
            </Link>
          </div>
        )}
        <button
          onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="w-48 h-48 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border-2"
          style={{ 
            backgroundColor: mobileTabOpen ? '#fff' : '#D6B14D',
            borderColor: '#D6B14D',
            color: mobileTabOpen ? '#D6B14D' : '#fff'
          }}
        >
          {mobileTabOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>
    </div>
  )
}

export default memo(MembersDirectorPortfolioProfileTemplate)
