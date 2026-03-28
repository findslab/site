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
  Activity,
  Award,
  Medal,
  Trophy,
  Landmark,
  GraduationCap,
  Calendar,
  BookOpen,
  PenTool,
  UserCheck,
  Bookmark,
  FileText,
  Search,
  Folder,
  Factory,
  School,
  FlaskConical,
  Crown,
  ShieldCheck,
  Compass,
  Microscope,
  Newspaper,
  BadgeCheck,
  ClipboardList,
  Mic,
  FileSearch,
  Globe,
} from 'lucide-react'
import {useStoreModal} from '@/store/modal'
import type {HonorsData, AcademicActivitiesData} from '@/types/data'
import {citationStats, affiliations, researchInterests, scholarConfig} from '@/data/director-common'

// Scholar data type
type ScholarData = {
  lastUpdated: string
  metrics: {
    totalCitations: number
    hIndex: number
    i10Index: number
    i5Index: number
    gIndex: number
  }
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
    leadResearcher?: string | {name: string, lab: boolean}[]
    visitingResearcher?: string
    researchers?: (string | {name: string, lab: boolean})[]
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
const education = [
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
    leadership: [
      {role: 'Member', context: 'Graduate School Central Operations Committee', period: '2021-09 – 2025-01'},
      {role: 'Graduate Student Representative', context: 'Department of Industrial and Systems Engineering', period: '2021-09 – 2025-01'},
    ],
    awards: [{title: 'Best Doctoral Dissertation Award', org: 'Korean Operations Research and Management Science Society (KORMS, 한국경영과학회)'}],
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
    leadership: [],
    awards: [{title: 'Best Master Thesis Award', org: 'Korean Institute of Industrial Engineers (KIIE, 대한산업공학회)'}],
    honors: [],
    logo: logoKaist
  },
  {
    school: 'Kyung Hee University',
    period: '2018-02',
    degree: 'Bachelor of Engineering (B.E.)',
    field: 'Industrial and Management Systems Engineering',
    college: 'College of Engineering',
    advisors: [
      {name: 'Jang Ho Kim', url: 'https://scholar.google.com/citations?user=uTiqWBMAAAAJ&hl=en'},
      {name: 'Myoung-Ju Park', url: 'https://scholar.google.com/citations?user=O8OYIzMAAAAJ&hl=en&oi=sra'}
    ],
    leadership: [
      {role: 'Head of Culture & Public Relations', context: '41st Student Council, College of Engineering', period: '2017-01 – 2017-11'},
      {role: 'President', context: '7th Student Council, Department of Industrial and Management Systems Engineering', period: '2016-01 – 2016-12'},
    ],
    awards: [{title: 'Dean\'s Award for Academic Excellence', org: 'College of Engineering, Kyung Hee University'}],
    honors: [{title: 'Valedictorian', org: '1st out of 86 students', gpa: '4.42', gpaMax: '4.5'}],
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
  {position: 'Lecturer', positionKo: '강사', department: 'Department of Industrial and Management Systems Engineering, College of Engineering', departmentKo: '공과대학 산업경영공학과', organization: 'Kyung Hee University', organizationKo: '경희대학교', period: '2024-03 – 2024-08', logo: logoKyunghee, isCurrent: false},
  {position: 'Research Consultant', positionKo: '연구 컨설턴트', department: '', departmentKo: '', organization: 'WorldQuant Brain', organizationKo: '월드퀀트 브레인', period: '2022-06 – Present', logo: logoWorldquant, isCurrent: true},
  {position: 'Doctoral Technical Research Personnel', positionKo: '박사과정 전문연구요원', department: 'Department of Industrial and Systems Engineering', departmentKo: '산업및시스템공학과', organization: 'Korea Advanced Institute of Science and Technology (KAIST)', organizationKo: '한국과학기술원', period: '2022-03 – 2025-02', logo: logoKaist, isCurrent: false},
  {position: 'Intern', positionKo: '인턴', department: 'Data & Analytics Team', departmentKo: '데이터 애널리틱스 팀', organization: 'EY Consulting', organizationKo: 'EY컨설팅', period: '2020-03 – 2020-05', logo: logoEy, isCurrent: false},
  {position: 'Director', positionKo: '대표', department: '', departmentKo: '', organization: 'JL Creatives & Contents (JL C&C)', organizationKo: 'JL크리에이티브&콘텐츠', period: '2014-06 – Present', logo: logoJl, isCurrent: true},
]

// Static Data - Professional Affiliations, Citation Statistics, Research Interests
// Now imported from @/data/director-common.ts


export const MembersDirectorTemplate = () => {
  const [emailCopied, setEmailCopied] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const devKeysRef = useRef<Set<string>>(new Set())

  // J+L secret combo to show portfolio link
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      devKeysRef.current.add(e.key.toLowerCase())
      if (devKeysRef.current.has('j') && devKeysRef.current.has('l')) {
        e.preventDefault()
        setDevMode(prev => !prev)
      }
    }
    const onUp = (e: KeyboardEvent) => { devKeysRef.current.delete(e.key.toLowerCase()) }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])
  const [projects, setProjects] = useState<Project[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [teachingSearchTerm, setTeachingSearchTerm] = useState('')
  const [expandedProjectYears, setExpandedProjectYears] = useState<string[]>([])
  const [honorsData, setHonorsData] = useState<HonorsData | null>(null)
  const [activitiesData, setActivitiesData] = useState<AcademicActivitiesData | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013']))
  const [expandedEduAwards, setExpandedEduAwards] = useState<Set<number>>(new Set([0, 1, 2])) // For education awards/honors - all expanded
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    researchInterests: true,
    education: true,
    employment: true,
    publicationOverview: false,
    projectOverview: false,
    academicServiceOverview: false,
    teachingOverview: false,
    honorsOverview: false,
    teaching: true
  })
  
  // Sticky profile card refs and state
  const profileCardRef = useRef<HTMLDivElement>(null)
  const contentSectionRef = useRef<HTMLElement>(null)
  const [profileTop, setProfileTop] = useState(0)
  
  // Sticky profile card effect
  useEffect(() => {
    const handleScroll = () => {
      if (!profileCardRef.current || !contentSectionRef.current) return
      if (window.innerWidth < 1024) return // Only on desktop
      
      const section = contentSectionRef.current
      const card = profileCardRef.current
      const sectionRect = section.getBoundingClientRect()
      const cardHeight = card.offsetHeight
      const topOffset = 32 // Top padding from viewport top
      const bottomPadding = 32
      
      // Section의 시작이 topOffset 위로 올라가면 sticky 시작
      if (sectionRect.top <= topOffset) {
        // Section의 끝이 card + topOffset + padding 보다 작으면 bottom에 고정
        if (sectionRect.bottom <= cardHeight + topOffset + bottomPadding) {
          setProfileTop(sectionRect.bottom - cardHeight - bottomPadding - sectionRect.top)
        } else {
          // 위쪽에 고정
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
    {label: 'KCI', count: 0}, {label: 'Int\'l Conf', count: 0}, {label: 'Dom. Conf', count: 0}
  ])
  const [totalPubs, setTotalPubs] = useState(0)
  const [scholarData, setScholarData] = useState<ScholarData | null>(null)
  
  // Live citation stats (from Google Scholar or fallback)
  const liveCitationStats = useMemo(() => {
    if (!scholarData?.metrics) return citationStats
    return citationStats.map(stat => ({
      ...stat,
      count: stat.key === 'totalCitations' ? scholarData.metrics.totalCitations :
             stat.key === 'hIndex' ? scholarData.metrics.hIndex :
             stat.key === 'i10Index' ? scholarData.metrics.i10Index :
             stat.key === 'i5Index' ? scholarData.metrics.i5Index :
             stat.key === 'gIndex' ? scholarData.metrics.gIndex :
             stat.count
    }))
  }, [scholarData])
  const {showModal} = useStoreModal()
  const location = useLocation()
  const directorEmail = 'ischoi@gachon.ac.kr'

  // Fetch Projects, Lectures, and Publications data
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    
    // Fetch Google Scholar data
    fetch(`${baseUrl}data/scholar.json`)
      .then(res => res.json())
      .then((data: ScholarData) => setScholarData(data))
      .catch(() => {}) // Silently fail, use fallback values
    
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
        
        setTotalPubs(pubs.length)
        setPubStats([
          {label: 'SCIE', count: stats.scie},
          {label: 'SSCI', count: stats.ssci},
          {label: 'A&HCI', count: stats.ahci},
          {label: 'ESCI', count: stats.esci},
          {label: 'Scopus', count: stats.scopus},
          {label: 'Other Int\'l', count: stats.otherIntl},
          {label: 'KCI', count: stats.kci},
          {label: 'Int\'l Conf', count: stats.intlConf},
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
        // All years expanded by default
        const years = Object.keys(data).sort((a, b) => Number(b) - Number(a))
        setExpandedYears(new Set(years))
      })
      .catch(console.error)

    fetch(`${baseUrl}data/academicactivities.json`)
      .then(res => res.json())
      .then((data: AcademicActivitiesData) => setActivitiesData(data))
      .catch(console.error)
  }, [])

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directorEmail)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  // Project Statistics
  const projectStats = useMemo(() => {
    const piProjects = projects.filter(p => p.roles.principalInvestigator === '최인수')
    const piIds = new Set(piProjects.map((_, i) => i))
    const remaining1 = projects.filter((_, i) => !piIds.has(i))
    const leadProjects = remaining1.filter(p => {
      const lr = p.roles.leadResearcher
      if (!lr) return false
      if (typeof lr === 'string') return lr.includes('최인수')
      if (Array.isArray(lr)) return lr.some((r: any) => r.name === '최인수')
      return false
    })
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

  // Academic Service Statistics
  const serviceStats = useMemo(() => {
    if (!activitiesData) return { total: 0, editorial: 0, membership: 0, committee: 0, chair: 0, journalReviewer: 0, conferenceReviewer: 0 }
    const acts = activitiesData.activities
    const editorial = acts.filter(a => a.category === 'editorial').length
    const membership = acts.filter(a => a.category === 'membership').length
    const committee = acts.filter(a => a.category === 'committee').length
    const chair = acts.filter(a => a.category === 'chair').length
    const journalReviewer = acts.filter(a => a.category === 'journal').length
    const conferenceReviewer = acts.filter(a => a.category === 'conference').length
    return {
      total: editorial + membership + committee + chair + journalReviewer + conferenceReviewer,
      editorial,
      membership,
      committee,
      chair,
      journalReviewer,
      conferenceReviewer,
    }
  }, [activitiesData])

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
      credits: Record<string, number>
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
            role: lecture.role,
            credits: lecture.credits || {}
          }
        } else {
          // Add new periods that are not already in the list
          lecture.periods.forEach(p => {
            if (!courseMap[key].periods.includes(p)) {
              courseMap[key].periods.push(p)
            }
          })
          // Merge credits
          if (lecture.credits) {
            Object.assign(courseMap[key].credits, lecture.credits)
          }
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
            <span className="text-sm text-gray-400 font-medium">Members</span>
            <span className="text-gray-200">—</span>
            <span className="text-sm text-primary font-semibold">Director</span>
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
              className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-16 md:p-20 shadow-sm transition-transform duration-100"
              style={{ transform: `translateY(${profileTop}px)` }}
            >
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
                    <p className="text-[10px] md:text-xs text-gray-500">FINDS Lab</p>
                  </div>
                </div>
                <div className="flex items-start gap-10 group">
                  <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Building size={14}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">Affiliation</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Assistant Professor</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Gachon University</p>
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

              {/* Office Phone */}
              <div className="flex items-start gap-10 group mt-12 md:mt-16">
                <div className="size-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                  <Phone size={14}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-1">Office</p>
                  <a href="tel:031-750-5405" className="text-xs md:text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                    031-750-5405
                  </a>
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
              {devMode && (
              <Link 
                to="/members/director/portfolio/profile"
                className="flex items-center justify-center gap-4 mt-8 py-10 bg-white border border-gray-200 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all"
              >
                View Full Portfolio <ChevronRight size={12}/>
              </Link>
              )}
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
                  <div key={index} className="relative pb-16 md:pb-24 last:pb-0 group pl-24 md:pl-32">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-1/2" style={{left: '-1px'}}>
                      <div className="size-12 md:size-16 bg-primary rounded-full border-3 md:border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#D6B14D]/30"/>
                    </div>
                    <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16 bg-white border border-gray-100 rounded-lg md:rounded-xl p-12 md:p-16 hover:shadow-lg hover:shadow-[#D6B14D]/10 hover:border-[#D6B14D]/40 hover:bg-gradient-to-r hover:from-white hover:to-primary/[0.02] transition-all duration-300 min-h-[100px] md:min-h-[110px]">
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                        <div className="flex flex-wrap items-center justify-start gap-6 md:gap-8 mb-4">
                          <span className="px-8 md:px-10 py-2 text-[10px] md:text-xs font-bold rounded-full bg-primary text-white">{edu.period}</span>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-gray-900">{edu.degree.includes("(Ph.D.") ? <>{edu.degree.split(" (")[0]}<br className="md:hidden" /><span className="text-sm md:text-base text-gray-900 font-bold"> ({edu.degree.split(" (")[1]}</span></> : edu.degree}</h4>
                        <p className="text-xs md:text-sm font-bold text-gray-600 break-words">{edu.field}</p>
                        <p className="text-xs md:text-sm text-gray-500 font-bold break-words">{edu.school}</p>
                      </div>
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
                {employment.filter((emp) => 
                  (emp.organization === 'Gachon University' ||
                  emp.organization === 'Dongduk Women\'s University' ||
                  emp.position === 'Director' ||
                  (emp.position === 'Lecturer' && (emp.organization === 'Kangnam University' || emp.organization === 'Korea University Sejong Campus' || emp.organization === 'Kyung Hee University')) ||
                  emp.organization === 'EY Consulting') &&
                  !emp.organization.includes('JL Creatives')
                ).map((emp, index) => (
                  <div key={index} className="relative pb-16 md:pb-24 last:pb-0 group pl-24 md:pl-32">
                    {/* Timeline dot - vertically centered */}
                    <div className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-1/2" style={{left: '-1px'}}>
                      <div className={`size-12 md:size-16 rounded-full border-3 md:border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                        emp.isCurrent ? 'bg-primary group-hover:shadow-[#D6B14D]/30' : 'bg-gray-300 group-hover:shadow-gray-300/50'
                      }`}/>
                    </div>
                    <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16 bg-white border border-gray-100 rounded-lg md:rounded-xl p-12 md:p-16 hover:shadow-lg hover:shadow-[#D6B14D]/10 hover:border-[#D6B14D]/40 hover:bg-gradient-to-r hover:from-white hover:to-primary/[0.02] transition-all duration-300 min-h-[100px] md:min-h-[110px]">
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
                            <p className="text-[10px] md:text-sm font-medium text-gray-600 break-words">{emp.department.split(',')[0].trim()}</p>
                            <p className="text-xs md:text-sm text-gray-500 break-words">{emp.department.split(',').slice(1).join(',').trim()}</p>
                          </>
                        ) : emp.department && (
                          <p className="text-[10px] md:text-sm font-medium text-gray-600 break-words">{emp.department}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
              )}
            </section>

            {/* Teaching */}
            {lectures.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('teaching')}
                  className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Teaching</h3>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.teaching ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.teaching && (
                  <div className="p-20 md:p-24 border-t border-gray-100">
                    {/* Lecturer Section */}
                    {lecturerCourses.length > 0 && (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-16 py-12 bg-gray-50">
                          <div className="flex items-center gap-8">
                            <p className="text-sm md:text-base font-bold text-gray-900">Lecturer</p>
                          </div>
                        </div>
                        <div className="space-y-12 p-16">
                          {lecturerCourses.map((course, index) => {
                            const getSchoolLogo = (school: string) => {
                              if (school.includes('KAIST') || school.includes('Korea Advanced')) return logoKaist
                              if (school.includes('Kyung Hee')) return logoKyunghee
                              if (school.includes('Gachon')) return logoGcu
                              if (school.includes('Dongduk')) return logoDwu
                              if (school.includes('Kangnam')) return logoKangnam
                              if (school.includes('Korea University') || school === 'Korea University') return logoKorea
                              return null
                            }
                            const getSchoolKo = (school: string) => {
                              if (school.includes('KAIST') || school.includes('Korea Advanced')) return '한국과학기술원 (KAIST)'
                              if (school.includes('Kyung Hee')) return '경희대학교'
                              if (school.includes('Gachon')) return '가천대학교'
                              if (school.includes('Dongduk')) return '동덕여자대학교'
                              if (school.includes('Kangnam')) return '강남대학교'
                              if (school.includes('Korea University Sejong')) return '고려대학교 세종캠퍼스'
                              if (school.includes('Korea University') || school === 'Korea University') return '고려대학교'
                              return school
                            }
                            const schoolLogo = getSchoolLogo(course.school)
                            
                            return (
                              <div key={index} className="bg-white border border-gray-100 rounded-lg md:rounded-xl p-12 md:p-16 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
                                <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16">
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="flex flex-wrap items-center justify-start gap-6 mb-8">
                                      {course.periods.map((period, i) => (
                                        <span key={i} className="inline-flex items-center gap-3 px-8 py-2 bg-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-full">
                                          {period}
                                          {course.credits[period] && (
                                            <span className="inline-flex items-center justify-center size-14 md:size-16 rounded-full bg-primary/20 text-primary text-[9px] md:text-[10px] font-bold">
                                              {course.credits[period]}
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-sm md:text-base font-bold text-gray-900">{course.courseNameKo || course.courseName}</p>
                                    {course.courseNameKo && course.courseName !== course.courseNameKo && (
                                      <p className="text-xs md:text-sm text-gray-500 mt-2">{course.courseName}</p>
                                    )}
                                    <p className="text-xs md:text-sm font-bold text-gray-500 mt-4">{getSchoolKo(course.school)}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
            {/* Publication Overview */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('publicationOverview')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Publication Overview</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.publicationOverview ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.publicationOverview && (
                <div className="p-20 md:p-24 border-t border-gray-100">
                  {/* Total - Full Width */}
                  <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300 mb-8 md:mb-12">
                    <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{totalPubs}</span>
                      <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-8 md:gap-12 mb-16 md:mb-24">
                    {pubStats.map((stat, index) => {
                      const getColors = (label: string) => {
                        switch(label) {
                          case 'SCIE': case 'SSCI': case 'A&HCI': return { color: '#D6B14D' }
                          case 'ESCI': case 'Scopus': return { color: '#D6C360' }
                          case 'Other Int\'l': return { color: '#9A7D1F' }
                          case 'Int\'l Conf': return { color: '#AC0E0E' }
                          case 'Dom. Conf': return { color: '#E8889C' }
                          case 'KCI': return { color: '#64748b' }
                          default: return { color: '#D6B14D' }
                        }
                      }
                      return (
                      <div key={index} className="group relative bg-white border border-gray-100 rounded-2xl p-12 md:p-16 hover:shadow-lg transition-all duration-300"
                        onMouseEnter={(e) => { const c = getColors(stat.label).color; e.currentTarget.style.borderColor = c + '66'; e.currentTarget.style.boxShadow = '0 10px 15px -3px ' + c + '1a' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div className="absolute top-0 left-12 right-12 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{background: `linear-gradient(to right, ${getColors(stat.label).color}99, transparent)`}} />
                        <div className="flex flex-col items-center text-center">
                          <span className="text-lg md:text-xl font-bold mb-2" style={{color: getColors(stat.label).color}}>{stat.count}</span>
                          <span className="text-[10px] md:text-xs font-medium text-gray-500">{stat.label}</span>
                        </div>
                      </div>
                    )})}
                  </div>
                  <div className="pt-16 border-t border-gray-100">
                    <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300 mb-8 md:mb-12">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{liveCitationStats[0]?.count || 0}</span>
                        <span className="text-[10px] md:text-sm font-semibold text-gray-500">{liveCitationStats[0]?.label || 'Citations'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                      {liveCitationStats.slice(1).map((stat, index) => (
                        <div key={index} className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                          <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center text-center">
                            <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#D6B14D'}}>{stat.count}</span>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500">{stat.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Project Overview */}
            {projects.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('projectOverview')}
                  className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Project Overview</h3>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.projectOverview ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.projectOverview && (
                <div className="p-20 md:p-24 border-t border-gray-100">
                  <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300 mb-8 md:mb-12">
                    <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{projectStats.total}</span>
                      <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funding Source</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#D6B14D'}}>{projectStats.government}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Government</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#AC0E0E]/30 hover:shadow-lg hover:shadow-[#AC0E0E]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#AC0E0E]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#AC0E0E'}}>{projectStats.industry}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Industry</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8D688]/50 hover:shadow-lg hover:shadow-[#E8D688]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8D688]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#E8D688'}}>{projectStats.institution}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Institutional</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8889C]/50 hover:shadow-lg hover:shadow-[#E8889C]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8889C]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#E8889C'}}>{projectStats.academic}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Research</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-8">Participation</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-900/30 hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-900/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{projectStats.pi}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Principal Investigator</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-600/30 hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-600/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-600">{projectStats.lead}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Lead Researcher</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-500/30 hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-500/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-500">{projectStats.visiting}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Visiting Researcher</span>
                      </div>
                    </div>
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-gray-400/30 hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-gray-400/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 text-gray-400">{projectStats.researcher}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Researcher</span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </section>
            )}

            {/* Academic Service Overview */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('academicServiceOverview')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Academic Service Overview</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.academicServiceOverview ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.academicServiceOverview && (
                <div className="p-20 md:p-24 border-t border-gray-100">
                  {/* Total */}
                  <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300 mb-8 md:mb-12">
                    <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{serviceStats.total}</span>
                      <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Editorial Service */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#D6B14D'}}>{serviceStats.editorial}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Editorial Service</span>
                      </div>
                    </div>
                    {/* Academic Memberships */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8D688]/50 hover:shadow-lg hover:shadow-[#E8D688]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8D688]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#E8D688'}}>{serviceStats.membership}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Memberships</span>
                      </div>
                    </div>
                    {/* Program Committee */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#FFEB99]/70 hover:shadow-lg hover:shadow-[#FFEB99]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#FFEB99] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#C4A52D'}}>{serviceStats.committee}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Program Committee</span>
                      </div>
                    </div>
                    {/* Session Chair */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#AC0E0E]/30 hover:shadow-lg hover:shadow-[#AC0E0E]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#AC0E0E]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#AC0E0E'}}>{serviceStats.chair}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Session Chair</span>
                      </div>
                    </div>
                    {/* Journal Reviewer */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#C41E3A]/30 hover:shadow-lg hover:shadow-[#C41E3A]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#C41E3A]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#C41E3A'}}>{serviceStats.journalReviewer}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Journal Reviewer</span>
                      </div>
                    </div>
                    {/* Conference Reviewer */}
                    <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8889C]/50 hover:shadow-lg hover:shadow-[#E8889C]/10 transition-all duration-300">
                      <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8889C]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col items-center text-center">
                        <span className="text-2xl md:text-3xl font-bold mb-4 transition-all duration-300" style={{color: '#E8889C'}}>{serviceStats.conferenceReviewer}</span>
                        <span className="text-[10px] md:text-xs font-medium text-gray-500">Conference Reviewer</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Teaching Overview */}
            {lectures.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('teachingOverview')}
                  className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Teaching Overview</h3>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.teachingOverview ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.teachingOverview && (
                  <div className="p-20 md:p-24 border-t border-gray-100">
                    <div className="flex flex-col gap-16 md:gap-24 transition-opacity duration-500">
                      <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                        <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{lecturerSemesters + taSemesters}</span>
                          <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total Classes Taught</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classes Taught</p>
                      <div className="grid grid-cols-2 gap-8 md:gap-12">
                        <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                          <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center text-center">
                            <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#D6B14D'}}>{lecturerSemesters}</span>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500">Lecturer</span>
                          </div>
                        </div>
                        <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8889C]/50 hover:shadow-lg hover:shadow-[#E8889C]/10 transition-all duration-300">
                          <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8889C]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center text-center">
                            <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#E8889C'}}>{taSemesters}</span>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500">Teaching Assistant</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unique Subjects</p>
                      <div className="grid grid-cols-2 gap-8 md:gap-12">
                        <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                          <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center text-center">
                            <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#D6B14D'}}>{lecturerCourses.length}</span>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500">Lecturer</span>
                          </div>
                        </div>
                        <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#E8889C]/50 hover:shadow-lg hover:shadow-[#E8889C]/10 transition-all duration-300">
                          <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#E8889C]/80 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col items-center text-center">
                            <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#E8889C'}}>{taCourses.length}</span>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500">Teaching Assistant</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Honors & Awards Overview */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('honorsOverview')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Honors & Awards Overview</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.honorsOverview ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.honorsOverview && (
                <div className="border-t border-gray-100 p-20 md:p-24">
                  {!honorsData || Object.keys(honorsData).length === 0 ? (
                    <div className="py-16 text-center text-sm text-gray-400">No awards data available</div>
                  ) : (
                    <>
                      {(() => {
                        const allItems = Object.values(honorsData).flat()
                        const totalAwards = allItems.filter(item => item.type === 'award').length
                        const totalHonors = allItems.filter(item => item.type === 'honor').length
                        const totalItems = totalAwards + totalHonors
                        return (
                          <div className="flex flex-col gap-16 md:gap-24 transition-opacity duration-500">
                            <div className="group relative bg-[#FFF9E6] border border-[#D6B14D]/20 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                              <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300" style={{color: '#9A7D1F'}}>{totalItems}</span>
                                <span className="text-[10px] md:text-sm font-semibold text-gray-500">Total</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 md:gap-12">
                              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#D6B14D]/40 hover:shadow-lg hover:shadow-[#D6B14D]/10 transition-all duration-300">
                                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#D6B14D]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center text-center">
                                  <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#D6B14D'}}>{totalHonors}</span>
                                  <span className="text-[10px] md:text-xs font-medium text-gray-500">Honors</span>
                                </div>
                              </div>
                              <div className="group relative bg-white border border-gray-100 rounded-2xl p-16 md:p-20 hover:border-[#AC0E0E]/30 hover:shadow-lg hover:shadow-[#AC0E0E]/10 transition-all duration-300">
                                <div className="absolute top-0 left-16 right-16 h-[2px] bg-gradient-to-r from-[#AC0E0E]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center text-center">
                                  <span className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#AC0E0E'}}>{totalAwards}</span>
                                  <span className="text-[10px] md:text-xs font-medium text-gray-500">Awards</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>
              )}
            </section>

          </main>
        </div>
      </section>
    </div>
  )
}

export default memo(MembersDirectorTemplate)
