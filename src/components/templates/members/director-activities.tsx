import ResumeModal from '@/components/common/ResumeModal'
import {memo, useState, useEffect, useMemo, useCallback, useRef} from 'react'
import {Link} from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
  Award,
  Medal,
  Trophy,
  Building,
  ChevronRight,
  Home,
  ChevronDown,
  ChevronUp,
  User,
  Activity,
  BookOpen,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  X,
  Search,
  Instagram,
} from 'lucide-react'
import type {AcademicActivitiesData, AuthorsData, Publication, Mentee, HonorsData} from '@/types/data'
import {useStoreModal} from '@/store/modal'
import {citationStats, affiliations} from '@/data/director-common'

// Types for collaboration network
type CollabPublication = {
  title: string
  titleKo: string
  year: number
  venue: string
  venueKo: string
  type: string // journal, conference, book, report 등
}

type PublicationBreakdown = {
  journal: number
  conference: number
  book: number
  report: number
}

type NetworkNode = {
  id: string
  name: string
  nameKo: string
  x: number
  y: number
  vx: number
  vy: number
  publications: number
  isDirector: boolean
  collabPubs: CollabPublication[] // 공동 논문 목록
  breakdown: PublicationBreakdown // 유형별 분류
  coworkRate: number // 공동작업 비율
}

type NetworkLink = {
  source: string
  target: string
  weight: number
}

// Image Imports
import banner2 from '@/assets/images/banner/2.webp'

const formatHonorDate = (dateStr: string): string => {
  // Check if it's a date range format like "2018-02-26 – 2020-02-28"
  if (dateStr.includes('–') && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateStr.split('–').map(s => s.trim())
    const startYear = parts[0].substring(0, 4)
    const endYear = parts[1].substring(0, 4)
    const startMonth = parts[0].substring(5, 7)
    const endMonth = parts[1].substring(5, 7)
    return `${startYear}-${startMonth} – ${endYear}-${endMonth}`
  }
  
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

const isDateRange = (dateStr: string): boolean => {
  return dateStr.includes('–') && !!dateStr.match(/^\d{4}-\d{2}-\d{2}/)
}

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
import logoCaptima from '@/assets/images/logos/captima.png'
import logoKfac from '@/assets/images/logos/kfac.png'
import logoMensa from '@/assets/images/logos/mensa.png'
import logoField from '@/assets/images/logos/field.png'
import logoFba from '@/assets/images/logos/fba.png'
import logoDading from '@/assets/images/logos/dading.png'

const education = [
  {
    school: 'Korea Advanced Institute of Science and Technology (KAIST)',
    period: '2025-02',
    degree: 'Doctor of Philosophy in Engineering (Ph.D. in Engineering)',
    field: 'Industrial and Systems Engineering',
    location: 'Korea Advanced Institute of Science and Technology (KAIST)',
    krName: '한국과학기술원 (KAIST) 산업및시스템공학 공학박사',
    advisor: 'Woo Chang Kim',
    leadership: [
      {role: 'Member', context: 'Graduate School Central Operations Committee', period: '2021-09 – 2025-01'},
      {role: 'Graduate Student Representative', context: 'Department of Industrial and Systems Engineering', period: '2021-09 – 2025-01'},
    ],
    awards: [{title: 'Best Doctoral Dissertation Award', org: 'Korean Operations Research and Management Science Society (KORMS, 한국경영과학회)'}],
    logo: logoKaist
  },
  {
    school: 'Korea Advanced Institute of Science and Technology (KAIST)',
    period: '2021-02',
    degree: 'Master of Science (M.S.)',
    field: 'Industrial and Systems Engineering',
    location: 'Korea Advanced Institute of Science and Technology (KAIST)',
    krName: '한국과학기술원 (KAIST) 산업및시스템공학 공학석사',
    advisor: 'Woo Chang Kim',
    awards: [{title: "Best Master Thesis Award", org: 'Korean Institute of Industrial Engineers (KIIE, 대한산업공학회)'}],
    logo: logoKaist
  },
  {
    school: 'Kyung Hee University',
    period: '2018-02',
    degree: 'Bachelor of Engineering (B.E.)',
    field: 'Industrial and Management Systems Engineering',
    location: 'Kyung Hee University',
    krName: '경희대학교 산업경영공학 공학사',
    advisor: 'Jang Ho Kim, Myoung-Ju Park',
    leadership: [
      {role: 'Head of Culture & Public Relations', context: '41st Student Council, College of Engineering', period: '2017-01 – 2017-11'},
      {role: 'President', context: '7th Student Council, Department of Industrial and Management Systems Engineering', period: '2016-01 – 2016-12'},
    ],
    awards: [{title: "Dean's Award for Academic Excellence", org: "College of Engineering, Kyung Hee University"}],
    honors: [{title: 'Valedictorian', org: '1st out of 86 students', gpa: '4.42', gpaMax: '4.5'}],
    logo: logoKyunghee
  },
]

const employment = [
  {
    position: 'Assistant Professor (Tenure-Track)',
    organization: 'Gachon University',
    period: '2026-03 – Present',
    location: 'Big Data Business Management Major, Department of Finance & Big Data, College of Business',
    krOrg: '조교수 / 가천대학교 경영대학 금융·빅데이터학부',
    logo: logoGcu
  },
  {
    position: 'Assistant Professor (Tenure-Track)',
    organization: "Dongduk Women's University",
    period: '2025-09 – 2026-02',
    location: 'Division of Business Administration, College of Business',
    krOrg: '조교수 / 동덕여자대학교 경영대학 경영융합학부',
    logo: logoDwu
  },
  {position: 'Director', organization: 'FINDS Lab', period: '2025-06 – Present', location: 'FINDS Lab', krOrg: '디렉터 / FINDS Lab', logo: logoFinds},
  {
    position: 'Lecturer',
    organization: 'Kangnam University',
    period: '2025-03 – 2026-02',
    location: 'Department of Electronic and Semiconductor Engineering',
    krOrg: '강사 / 강남대학교 공과대학 전자반도체공학부',
    logo: logoKangnam
  },
  {
    position: 'Lecturer',
    organization: 'Korea University Sejong Campus',
    period: '2025-03 – 2026-02',
    location: 'Digital Business Major, Division of Convergence Business',
    krOrg: '강사 / 고려대학교 세종캠퍼스 글로벌비즈니스대학 융합경영학부 디지털비즈니스전공',
    logo: logoKorea
  },
  {
    position: 'Lecturer',
    organization: 'Kyung Hee University',
    period: '2024-03 – 2024-08',
    location: 'Department of Industrial and Management Systems Engineering',
    krOrg: '강사 / 경희대학교 공과대학 산업경영공학과',
    logo: logoKyunghee
  },
  {position: 'Research Consultant', organization: 'WorldQuant Brain', period: '2022-06 – Present', location: 'WorldQuant Brain', krOrg: '연구 컨설턴트 / 월드퀀트 브레인', logo: logoWorldquant},
  {position: 'Intern', organization: 'EY Consulting', period: '2020-03 – 2020-05', location: 'Performance Improvement Department', krOrg: '인턴 / EY컨설팅 성과개선팀', logo: logoEy},
  {position: 'Director', organization: 'JL Creatives & Contents (JL C&C)', period: '2014-06 – Present', location: 'JL C&C', krOrg: '대표 / JL C&C', logo: logoJl},
]

// affiliations imported from @/data/director-common.ts

const activities = [
  {
    name: 'CAPTIMA',
    logo: logoCaptima,
    fullName: 'Computer Applications for Optima',
    fullNameKo: '경희대학교 산업경영공학과 컴퓨터학술동아리',
    generation: '27th Generation',
    membership: [
      {role: 'Member', period: '2013-03 – 2018-02'},
      {role: 'Alumni', period: '2018-03 – Present'},
    ],
    leadership: [
      {role: 'President', period: '2015-06 – 2015-12'},
      {role: 'Vice President', period: '2013-12 – 2014-08'},
    ],
    url: '#',
    instagram: 'https://www.instagram.com/captima_official/'
  },
  {
    name: 'KFAC',
    logo: logoKfac,
    fullName: 'KAIST Financial Analysis Club',
    fullNameKo: 'KAIST 금융분석학회',
    generation: '25th Generation',
    membership: [
      {role: 'Member', period: '2018-03 – 2019-02'},
      {role: 'Alumni', period: '2019-03 – Present'},
    ],
    leadership: [
      {role: 'Acting President', period: '2021-03 – 2021-08'},
      {role: 'Session Leader', period: '2018-09 – 2019-02'},
    ],
    url: '#',
    instagram: 'https://www.instagram.com/kaist_kfac/'
  },
  {
    name: 'Mensa Korea',
    hidden: true,
    logo: logoMensa,
    fullName: '',
    fullNameKo: '멘사코리아',
    generation: '',
    membership: [
      {role: 'Member', period: '2019-01 – Present'},
    ],
    leadership: [],
    url: '#'
  },
  {
    name: 'FIELD',
    logo: logoField,
    fullName: 'Future Industrial Engineering Leaders and Dreamers',
    fullNameKo: '전국대학생산업공학도 모임',
    generation: '11th - 16th Generation',
    membership: [
      {role: 'Member', period: '2019-03 – 2024-12'},
      {role: 'Alumni', period: '2020-01 – Present'},
    ],
    leadership: [],
    url: '#',
    instagram: 'https://www.instagram.com/iefield/'
  },
  {
    name: 'FBA',
    hidden: true,
    logo: logoFba,
    fullName: 'FBA Quantitative Research Group',
    fullNameKo: '',
    generation: '12th Generation',
    membership: [
      {role: 'Member', period: '2022-01 – 2022-12'},
      {role: 'Alumni', period: '2023-01 – Present'},
    ],
    leadership: [],
    url: '#'
  },
  {
    name: 'DadingCoding',
    hidden: true,
    logo: logoDading,
    fullName: '',
    fullNameKo: '대딩코딩',
    generation: '6th Generation',
    membership: [
      {role: 'Member', period: '2024-02 – 2024-07'},
      {role: 'Alumni', period: '2024-08 – Present'},
    ],
    leadership: [],
    url: '#'
  },
]

const researchInterests = [
  {
    category: 'Financial Data Science',
    items: [
      {en: 'AI in Quantitative Finance & Asset Management', ko: '인공지능을 활용한 포트폴리오 최적화, 자산 배분, 알고리즘 트레이딩'},
      {en: 'Financial Time-Series Modeling & Forecasting', ko: '변동성 예측, 국면 전환 모형, 선·후행 관계 분석, 수익률 예측 등 금융 시계열 모형 연구'},
      {en: 'Household Finance & Behavioral Decision Modeling', ko: '가계 금융과 투자자 행동 분석, 행동재무학 기반 의사결정 모형화'},
    ],
  },
  {
    category: 'Business Analytics',
    items: [
      {en: 'Data Analytics for Cross-Industry & Cross-Domain Convergences', ko: '다양한 산업과 분야 간의 결합과 융합을 위한 데이터 분석'},
      {en: 'Data Visualization & Transparency in Business Analytics', ko: '복잡한 데이터를 직관적으로 표현하고 투명성을 높이는 시각화 기법'},
      {en: 'Business Insights from Data Science Techniques', ko: '시계열 모형, 그래프 기반 모형, 자연어 처리(NLP) 등 데이터 사이언스 기법을 활용한 비즈니스 인사이트 발굴'},
    ],
  },
  {
    category: 'Data-Informed Decision Making',
    items: [
      {en: 'Trustworthy Decision Systems & Optimization', ko: '신뢰할 수 있는 의사결정 시스템 설계와 최적화 기법'},
      {en: 'Risk-Aware & User-Friendly Decision Tools', ko: '금융·경영 위험을 반영하고 사용자 친화성을 갖춘 의사결정 도구'},
      {en: 'Decision Analytics for Complex Business Problems', ko: '복잡한 경영 및 투자 의사결정 문제 해결을 위한 분석 및 최적화 방법론'},
    ],
  },
]

// Collaboration Network Component
const CollaborationNetwork = memo(() => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [coworkRateThreshold, setCoworkRateThreshold] = useState(2) // 1-100%, default 2%
  const [totalPubsCount, setTotalPubsCount] = useState(0)
  
  // 모바일/데스크탑에 따른 기본 zoom 값
  const getDefaultZoom = () => typeof window !== 'undefined' && window.innerWidth < 768 ? 1.6 : 1.3
  const [zoom, setZoom] = useState(getDefaultZoom)
  
  const [pan, setPan] = useState({x: 0, y: 0})
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({x: 0, y: 0})
  const animationRef = useRef<number | null>(null)
  const nodesRef = useRef<NetworkNode[]>([])

  // Load and process collaboration data
  useEffect(() => {
    const loadData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/'
        const [pubsRes, authorsRes] = await Promise.all([
          fetch(`${baseUrl}data/pubs.json`),
          fetch(`${baseUrl}data/authors.json`),
        ])
        const pubs: Publication[] = await pubsRes.json()
        const authors: AuthorsData = await authorsRes.json()

        // Build collaboration map
        const collaborationMap = new Map<string, Map<string, number>>()
        const authorPubCount = new Map<string, number>()
        // 각 저자별 공동 논문 목록
        const authorCollabPubs = new Map<string, CollabPublication[]>()

        // 전체 논문 수 (co-work rate 계산용)
        const totalPubs = pubs.filter(pub => pub.authors.includes(1)).length
        setTotalPubsCount(totalPubs)

        pubs.forEach((pub) => {
          if (pub.authors.includes(1)) {
            // Only publications with director
            pub.authors.forEach((authorId) => {
              const idStr = String(authorId)
              authorPubCount.set(idStr, (authorPubCount.get(idStr) || 0) + 1)

              // 공동 논문 저장 (type 포함)
              if (!authorCollabPubs.has(idStr)) authorCollabPubs.set(idStr, [])
              authorCollabPubs.get(idStr)!.push({
                title: pub.title,
                titleKo: pub.title_ko,
                year: pub.year,
                venue: pub.venue,
                venueKo: pub.venue_ko,
                type: pub.type || 'other',
              })
            })

            // Create links between all co-authors
            for (let i = 0; i < pub.authors.length; i++) {
              for (let j = i + 1; j < pub.authors.length; j++) {
                const a = String(pub.authors[i])
                const b = String(pub.authors[j])
                if (!collaborationMap.has(a)) collaborationMap.set(a, new Map())
                if (!collaborationMap.has(b)) collaborationMap.set(b, new Map())
                collaborationMap.get(a)!.set(b, (collaborationMap.get(a)!.get(b) || 0) + 1)
                collaborationMap.get(b)!.set(a, (collaborationMap.get(b)!.get(a) || 0) + 1)
              }
            }
          }
        })

        // Get collaborators filtered by co-work rate threshold
        const directorCollabs = collaborationMap.get('1') || new Map()
        const minPubCount = Math.max(1, Math.ceil(totalPubs * coworkRateThreshold / 100))
        const topCollaborators = Array.from(directorCollabs.entries())
          .filter(([, count]) => count >= minPubCount) // cowork rate 기준 필터링
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)

        const nodesToShow = ['1', ...topCollaborators]

        // Initialize nodes with concentric circle layout
        const width = 800
        const height = 500
        const centerX = width / 2
        const centerY = height / 2

        // Sort collaborators by publication count for better layout
        const sortedCollabs = topCollaborators.sort((a, b) => {
          const countA = authorPubCount.get(a) || 0
          const countB = authorPubCount.get(b) || 0
          return countB - countA
        })

        const initialNodes: NetworkNode[] = nodesToShow.map((id, idx) => {
          const author = authors[id]
          const isDirector = id === '1'
          const collabPubsList = authorCollabPubs.get(id) || []
          const pubCount = authorPubCount.get(id) || 0

          let x = centerX
          let y = centerY

          if (!isDirector) {
            // Find position in sorted list
            const sortedIdx = sortedCollabs.indexOf(id)
            const total = sortedCollabs.length
            
            // Multi-ring layout - inner ring for top collaborators, outer for others
            const innerRingCount = Math.min(6, Math.ceil(total / 2))
            const isInnerRing = sortedIdx < innerRingCount
            
            if (isInnerRing && innerRingCount > 0) {
              // Inner ring - closer to center, evenly spaced
              const angle = (2 * Math.PI * sortedIdx) / innerRingCount - Math.PI / 2
              const radius = 120
              x = centerX + Math.cos(angle) * radius
              y = centerY + Math.sin(angle) * radius
            } else {
              // Outer ring
              const outerIdx = sortedIdx - innerRingCount
              const outerCount = total - innerRingCount
              if (outerCount > 0) {
                const angle = (2 * Math.PI * outerIdx) / outerCount - Math.PI / 2 + Math.PI / outerCount
                const radius = 200
                x = centerX + Math.cos(angle) * radius
                y = centerY + Math.sin(angle) * radius
              } else {
                // Fallback - place at random position in outer area
                const angle = Math.random() * 2 * Math.PI
                const radius = 200
                x = centerX + Math.cos(angle) * radius
                y = centerY + Math.sin(angle) * radius
              }
            }
          }

          // 논문 유형별 분류
          const breakdown: PublicationBreakdown = {
            journal: collabPubsList.filter(p => p.type === 'journal').length,
            conference: collabPubsList.filter(p => p.type === 'conference').length,
            book: collabPubsList.filter(p => p.type === 'book').length,
            report: collabPubsList.filter(p => p.type === 'report' || p.type === 'other').length,
          }

          // Co-work rate 계산 (Director 전체 논문 대비 공동 작업 비율)
          const coworkRate = totalPubs > 0 ? Math.round((pubCount / totalPubs) * 100) : 0

          return {
            id,
            name: author?.en || `Author ${id}`,
            nameKo: author?.ko || '',
            x,
            y,
            vx: 0,
            vy: 0,
            publications: pubCount,
            isDirector,
            collabPubs: collabPubsList,
            breakdown,
            coworkRate,
          }
        })

        // Create links
        const networkLinks: NetworkLink[] = []
        nodesToShow.forEach((sourceId) => {
          const collabs = collaborationMap.get(sourceId)
          if (collabs) {
            collabs.forEach((weight, targetId) => {
              if (
                nodesToShow.includes(targetId) &&
                sourceId < targetId // Avoid duplicates
              ) {
                networkLinks.push({source: sourceId, target: targetId, weight})
              }
            })
          }
        })

        setNodes(initialNodes)
        nodesRef.current = initialNodes
        setLinks(networkLinks)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load collaboration data:', err)
        setLoading(false)
      }
    }
    loadData()
  }, [coworkRateThreshold])

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return

    let iterationCount = 0
    const maxIterations = 150 // 최대 약 2.5초 (60fps 기준)
    
    const simulate = () => {
      const newNodes = [...nodesRef.current]
      const centerX = 400
      const centerY = 250

      // Apply forces
      newNodes.forEach((node) => {
        // Center gravity for director
        if (node.isDirector) {
          node.vx += (centerX - node.x) * 0.1
          node.vy += (centerY - node.y) * 0.1
        } else {
          // Weak center gravity
          node.vx += (centerX - node.x) * 0.002
          node.vy += (centerY - node.y) * 0.002
        }

        // Repulsion from other nodes
        newNodes.forEach((other) => {
          if (node.id !== other.id) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const minDist = 70 // 풀네임 표시를 위해 거리 확보
            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.3
              node.vx += dx * force
              node.vy += dy * force
            }
          }
        })
      })

      // Apply link forces (attraction)
      links.forEach((link) => {
        const source = newNodes.find((n) => n.id === link.source)
        const target = newNodes.find((n) => n.id === link.target)
        if (source && target) {
          const dx = target.x - source.x
          const dy = target.y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const idealDist = 80 - link.weight * 3
          const force = (dist - idealDist) * 0.005

          if (!source.isDirector) {
            source.vx += (dx / dist) * force
            source.vy += (dy / dist) * force
          }
          if (!target.isDirector) {
            target.vx -= (dx / dist) * force
            target.vy -= (dy / dist) * force
          }
        }
      })

      // Update positions with velocity and stronger damping
      let totalVelocity = 0
      newNodes.forEach((node) => {
        if (!node.isDirector) {
          // 강화된 damping (0.9 -> 0.7)으로 더 빠르게 안정화
          node.vx *= 0.7
          node.vy *= 0.7
          node.x += node.vx
          node.y += node.vy
          
          // 총 속도 계산 (안정화 체크용)
          totalVelocity += Math.abs(node.vx) + Math.abs(node.vy)
          
          // NaN check - reset to center if invalid
          if (isNaN(node.x) || isNaN(node.y)) {
            node.x = centerX + (Math.random() - 0.5) * 200
            node.y = centerY + (Math.random() - 0.5) * 200
            node.vx = 0
            node.vy = 0
          }
          
          // Boundary constraints
          node.x = Math.max(50, Math.min(750, node.x))
          node.y = Math.max(50, Math.min(450, node.y))
        } else {
          node.x = centerX
          node.y = centerY
          node.vx = 0
          node.vy = 0
        }
      })

      nodesRef.current = newNodes
      setNodes([...newNodes])
      
      iterationCount++
      
      // 안정화 조건: 총 속도가 임계값 이하이거나 최대 반복 횟수 도달
      const isStabilized = totalVelocity < 0.5 || iterationCount >= maxIterations
      
      if (!isStabilized) {
        animationRef.current = requestAnimationFrame(simulate)
      }
    }

    animationRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [links, nodes.length])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true)
    setPanStart({x: e.clientX - pan.x, y: e.clientY - pan.y})
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({x: e.clientX - panStart.x, y: e.clientY - panStart.y})
    }
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.2, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setZoom(getDefaultZoom())
    setPan({x: 0, y: 0})
    setSelectedNode(null)
  }, [])

  const getNodeSize = useCallback((node: NetworkNode) => {
    if (node.isDirector) return 20
    return Math.max(6, Math.min(14, 5 + node.publications * 0.8))
  }, [])

  const getLinkOpacity = useCallback(
    (link: NetworkLink) => {
      if (selectedNode) {
        if (link.source === selectedNode || link.target === selectedNode) {
          return 0.8
        }
        return 0.1
      }
      if (hoveredNode) {
        if (link.source === hoveredNode || link.target === hoveredNode) {
          return 0.8
        }
        return 0.2
      }
      return 0.4
    },
    [hoveredNode, selectedNode]
  )

  const getNodeOpacity = useCallback(
    (node: NetworkNode) => {
      if (selectedNode) {
        if (node.id === selectedNode) return 1
        const connectedLinks = links.filter(
          (l) => l.source === selectedNode || l.target === selectedNode
        )
        const connectedNodeIds = connectedLinks.flatMap((l) => [l.source, l.target])
        if (connectedNodeIds.includes(node.id)) return 1
        return 0.2
      }
      if (hoveredNode) {
        if (node.id === hoveredNode) return 1
        const connectedLinks = links.filter(
          (l) => l.source === hoveredNode || l.target === hoveredNode
        )
        const connectedNodeIds = connectedLinks.flatMap((l) => [l.source, l.target])
        if (connectedNodeIds.includes(node.id)) return 1
        return 0.3
      }
      return 1
    },
    [hoveredNode, selectedNode, links]
  )

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-3xl p-60 text-center border border-gray-100">
        <div className="size-64 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-16 mx-auto animate-pulse">
          <Network size={32}/>
        </div>
        <p className="text-lg font-bold text-gray-900 mb-8">Loading Network Data...</p>
        <p className="text-sm text-gray-500">Analyzing collaboration patterns</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gray-50/50 px-16 md:px-32 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 gap-12 md:gap-0">
        {/* Co-work Rate Threshold Slider */}
        <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto">
          <span className="text-[10px] md:text-xs text-gray-500 font-medium whitespace-nowrap">Co-work Rate ≥</span>
          <input
            type="range"
            min="1"
            max="100"
            value={coworkRateThreshold}
            onChange={(e) => setCoworkRateThreshold(Number(e.target.value))}
            className="w-80 md:w-100 h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10px] md:text-xs font-bold text-primary w-28">{coworkRateThreshold}%</span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-[10px] md:text-xs text-gray-400 font-medium mr-8 md:mr-12">
            {nodes.length} Collaborators · {links.length} Connections
          </span>
          <button
            onClick={handleZoomIn}
            className="size-28 md:size-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D6B14D] hover:border-[#D6B14D]/30 transition-all"
            title="Zoom In"
          >
            <ZoomIn size={14}/>
          </button>
          <button
            onClick={handleZoomOut}
            className="size-28 md:size-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D6B14D] hover:border-[#D6B14D]/30 transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={14}/>
          </button>
          <button
            onClick={handleReset}
            className="size-28 md:size-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D6B14D] hover:border-[#D6B14D]/30 transition-all"
            title="Reset View"
          >
            <Maximize2 size={14}/>
          </button>
        </div>
      </div>

      {/* Network Graph */}
      <div
        ref={containerRef}
        className="relative h-500 bg-gradient-to-br from-gray-50 via-white to-gray-50 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 500"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <radialGradient id="directorGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8D688"/>
              <stop offset="100%" stopColor="#D6B14D"/>
            </radialGradient>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4E9"/>
              <stop offset="100%" stopColor="#FFBAC4"/>
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
            </filter>
          </defs>

          {/* Links */}
          <g className="links">
            {links.map((link) => {
              const source = nodes.find((n) => n.id === link.source)
              const target = nodes.find((n) => n.id === link.target)
              if (!source || !target) return null
              return (
                <line
                  key={`${link.source}-${link.target}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={
                    source.isDirector || target.isDirector
                      ? 'rgb(172,14,14)'
                      : '#FFBAC4'
                  }
                  strokeWidth={Math.max(0.5, Math.min(2.5, link.weight * 0.6))}
                  opacity={getLinkOpacity(link)}
                  className="transition-opacity duration-200"
                />
              )
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const size = getNodeSize(node)
              const isHighlighted =
                node.id === hoveredNode || node.id === selectedNode
              // Calculate fill color based on coworkRate (higher = darker)
              const getNodeFillColor = () => {
                if (node.isDirector) return 'url(#directorGradient)'
                // coworkRate is 0-100%, map to color intensity
                // Light: #FFE4E9 (low rate) to Dark: #E8889C (high rate)
                const rate = Math.min(100, node.coworkRate)
                // Interpolate between light pink and dark pink
                const r = Math.round(255 - (rate / 100) * (255 - 232))
                const g = Math.round(214 - (rate / 100) * (214 - 135))
                const b = Math.round(221 - (rate / 100) * (221 - 155))
                return `rgb(${r}, ${g}, ${b})`
              }
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={getNodeOpacity(node)}
                  className="cursor-pointer transition-opacity duration-200"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode(selectedNode === node.id ? null : node.id)
                  }}
                >
                  {/* Node circle */}
                  <circle
                    r={size}
                    fill={getNodeFillColor()}
                    stroke={node.isDirector ? 'rgb(172,14,14)' : (isHighlighted ? 'rgb(172,14,14)' : 'white')}
                    strokeWidth={node.isDirector ? 3 : (isHighlighted ? 3 : 2)}
                    filter={isHighlighted ? 'url(#glow)' : 'url(#shadow)'}
                    className="transition-all duration-200"
                  />

                  {/* Director icon */}
                  {node.isDirector && (
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      IC
                    </text>
                  )}

                  {/* Label - Full Name */}
                  <text
                    y={size + 14}
                    textAnchor="middle"
                    fill={node.isDirector ? '#D6B14D' : '#374151'}
                    stroke={node.isDirector ? '#000000' : 'none'}
                    strokeWidth={node.isDirector ? 0.5 : 0}
                    paintOrder="stroke"
                    fontSize={node.isDirector ? 12 : 7}
                    fontWeight={node.isDirector ? 700 : 600}
                    className="pointer-events-none select-none"
                  >
                    {node.nameKo || node.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* Tooltip / Popup */}
        {(hoveredNode || selectedNode) && (
          <div
            className={`absolute bg-white/98 max-md:w-[calc(100%-40px)] backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden ${
              selectedNode
                ? 'bottom-20 left-20 w-340 max-h-500 overflow-y-auto pointer-events-auto'
                : 'bottom-20 left-20 w-300 pointer-events-none'
            }`}
          >
            {(() => {
              const node = nodes.find(
                (n) => n.id === (selectedNode || hoveredNode)
              )
              if (!node) return null

              return (
                <>
                  {/* Header */}
                  <div className="bg-gray-50 px-20 py-16 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-12">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {node.nameKo || node.name}
                        </p>
                        {node.nameKo && (
                          <p className="text-xs text-gray-500">{node.name}</p>
                        )}
                      </div>
                      {selectedNode && (
                        <button
                          type="button"
                          onClick={() => setSelectedNode(null)}
                          className="size-24 rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-white transition-colors flex items-center justify-center shrink-0"
                          title="Close"
                        >
                          <X size={12}/>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-16 space-y-12">
                    {/* Total Works & Co-work Rate */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="bg-primary/5 rounded-lg p-12 text-center border border-primary/10">
                        <div className="flex items-center justify-center gap-6 mb-4">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Works</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {node.publications}
                        </p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-12 text-center" style={{borderColor: '#FFBAC4', borderWidth: '1px'}}>
                        <div className="flex items-center justify-center gap-6 mb-4">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Co-work Rate</p>
                        </div>
                        <p className="text-2xl font-bold" style={{color: '#E8889C'}}>
                          {node.coworkRate}%
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-12 border border-gray-100">
                      <div className="flex items-center gap-6 mb-10">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Breakdown</p>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full bg-blue-500"/>
                          <span className="text-xs text-gray-600 flex-1">journal paper{node.breakdown.journal !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.journal}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full bg-purple-500"/>
                          <span className="text-xs text-gray-600 flex-1">conference proceeding{node.breakdown.conference !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.conference}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full bg-orange-500"/>
                          <span className="text-xs text-gray-600 flex-1">book{node.breakdown.book !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.book}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full bg-gray-400"/>
                          <span className="text-xs text-gray-600 flex-1">report{node.breakdown.report !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.report}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hint for hover */}
                  {!selectedNode && (
                    <div className="px-16 pb-12">
                      <p className="text-[10px] text-gray-400 text-center">
                        Click to see publications
                      </p>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-16 right-16 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-lg p-12 text-[10px]">
          <div className="flex items-center gap-6 mb-6">
            <div className="size-10 rounded-full bg-white flex items-center justify-center text-[9px] font-bold" style={{border: '2px solid rgb(172,14,14)', color: '#D6B14D'}}>IC</div>
            <span className="text-gray-600 font-medium">Director</span>
          </div>
          <div className="flex items-center gap-6 mb-6">
            <div className="size-8 rounded-full" style={{background: 'linear-gradient(135deg, #FFE4E9 0%, #FFBAC4 100%)'}}/>
            <span className="text-gray-600 font-medium">Collaborator</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-1 rounded" style={{backgroundColor: 'rgb(172,14,14)'}}/>
            <span className="text-gray-600 font-medium">Connection</span>
          </div>
        </div>
      </div>
    </div>
  )
})

CollaborationNetwork.displayName = 'CollaborationNetwork'

// Mentee 타입 with id
type MenteeWithId = Mentee & { id: string }

// 연도별 멘티 그룹
type MenteesByYear = {
  [year: string]: MenteeWithId[]
}

// Helper function to get school info for a specific year based on schoolHistory
const getSchoolInfoForYear = (mentee: MenteeWithId, year: string | null): { university: string; department: string } => {
  if (!mentee.schoolHistory || mentee.schoolHistory.length === 0 || !year || year === 'all') {
    return { university: mentee.university, department: mentee.department }
  }
  
  const yearNum = parseInt(year.split('-')[0])
  
  for (const entry of mentee.schoolHistory) {
    const startYear = parseInt(entry.yearRange[0])
    const endYear = entry.yearRange[1] === '9999' ? 9999 : parseInt(entry.yearRange[1])
    
    if (yearNum >= startYear && yearNum <= endYear) {
      return { university: entry.university, department: entry.department }
    }
  }
  
  // Default to base school info if no matching history found
  return { university: mentee.university, department: mentee.department }
}


export const MembersDirectorActivitiesTemplate = () => {
  const [activitiesData, setActivitiesData] = useState<AcademicActivitiesData | null>(null)
  const [showAllJournals, setShowAllJournals] = useState(false)
  const [showAllConferences, setShowAllConferences] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mentees, setMentees] = useState<MenteeWithId[]>([])
  const [selectedMentoringYear, setSelectedMentoringYear] = useState<string>('all')
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all')
  const [menteeSearchTerm, setMenteeSearchTerm] = useState('')
  const [programTooltip, setProgramTooltip] = useState<{name: string, org: string, x: number, y: number} | null>(null)

  useEffect(() => {
    if (!programTooltip) return
    const dismiss = () => setProgramTooltip(null)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('touchstart', dismiss, true)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('touchstart', dismiss, true)
    }
  }, [programTooltip])

  const parseProgramInfo = useCallback((program: string) => {
    const map: Record<string, {name: string, org: string}> = {
      '경희대학교 공학교육혁신센터 1인 1멘토 평생멘토링 프로그램': {name: '1인1멘토 평생멘토링 프로그램', org: '경희대학교 공학교육혁신센터'},
      '경희대학교 교수학습개발원 Learning Step-Up 튜터링 프로그램': {name: 'Learning Step-Up 튜터링 프로그램', org: '경희대학교 교수학습개발원'},
      '경희대학교 후마니타스칼리지 신입생세미나 프로그램': {name: '신입생세미나 프로그램', org: '경희대학교 후마니타스칼리지'},
      '자체 멘토링 프로그램': {name: '자체 멘토링 프로그램', org: ''},
    }
    return map[program] || {name: program, org: ''}
  }, [])
  const [emailCopied, setEmailCopied] = useState(false)
  const [honorsData, setHonorsData] = useState<HonorsData | null>(null)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013']))
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    honorsAwards: true,
    awardsHonors: true,
    academicService: true,
    activities: true,
    collaborationNetwork: true,
    mentoringProgram: true,
  })
  const {showModal} = useStoreModal()

  // Sticky profile card refs and state
  const profileCardRef = useRef<HTMLDivElement>(null)
  const contentSectionRef = useRef<HTMLElement>(null)
  const [profileTop, setProfileTop] = useState(0)
  const [mobileTabOpen, setMobileTabOpen] = useState(false)
  
  // Sticky profile card effect
  useEffect(() => {
    const handleScroll = () => {
      if (!profileCardRef.current || !contentSectionRef.current) return
      if (window.innerWidth < 1024) return
      
      const section = contentSectionRef.current
      const card = profileCardRef.current
      const sectionRect = section.getBoundingClientRect()
      const cardHeight = card.offsetHeight
      const navHeight = 16
      const bottomPadding = 32
      
      if (sectionRect.top <= navHeight) {
        if (sectionRect.bottom <= cardHeight + navHeight + bottomPadding) {
          setProfileTop(sectionRect.bottom - cardHeight - bottomPadding - sectionRect.top)
        } else {
          setProfileTop(navHeight - sectionRect.top)
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
    setExpandedSections(prev => ({...prev, [section]: !prev[section]}))
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

  const directorEmail = 'ischoi@gachon.ac.kr'

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directorEmail)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    // Load academic activities data
    fetch(`${baseUrl}data/academicactivities.json`)
      .then((res) => res.json())
      .then((data: AcademicActivitiesData) => {
        setActivitiesData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load academic activities data:', err)
        setLoading(false)
      })

    // Load mentees data
    fetch(`${baseUrl}data/mentees.json`)
      .then((res) => res.json())
      .then((data: { [id: string]: Mentee }) => {
        const menteesList = Object.entries(data).map(([id, mentee]) => ({
          id,
          ...mentee,
        }))
        setMentees(menteesList)
      })
      .catch((err) => {
        console.error('Failed to load mentees data:', err)
      })

    // Load honors data
    fetch(`${baseUrl}data/honors.json`)
      .then((res) => res.json())
      .then((data: HonorsData) => {
        // Filter to show only items where director is a winner
        const filteredData: HonorsData = {}
        Object.keys(data).forEach((year) => {
          const items = data[year].filter((item) => 
            item.winners?.some((w: {name: string}) => w.name.includes('최인수') || w.name.toLowerCase().includes('insu'))
          )
          if (items.length > 0) {
            filteredData[year] = items
          }
        })
        setHonorsData(filteredData)
      })
      .catch((err) => {
        console.error('Failed to load honors data:', err)
      })
  }, [])

  // 연도별 멘티 그룹화
  const menteesByYear = useMemo(() => {
    const grouped: MenteesByYear = {}
    mentees.forEach((mentee) => {
      mentee.participationYears.forEach((py) => {
        const year = typeof py === 'string' ? py : py.year
        if (!grouped[year]) grouped[year] = []
        grouped[year].push(mentee)
      })
    })
    return grouped
  }, [mentees])

  // 연도 목록 (최신순 - 연도만, 학기 제외)
  const mentoringYears = useMemo(() => {
    const yearsSet = new Set<string>()
    Object.keys(menteesByYear).forEach((key) => {
      // Extract year only (e.g., "2015-1" -> "2015", "2015" -> "2015")
      const yearOnly = key.split('-')[0]
      yearsSet.add(yearOnly)
    })
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a))
  }, [menteesByYear])

  // 연도별 멘티 수 계산 (해당 연도만)
  const getMenteeCountByYear = useCallback((year: string) => {
    const uniqueMentees = new Set<string>()
    Object.keys(menteesByYear).forEach((key) => {
      if (key === year || key.startsWith(year + '-')) {
        menteesByYear[key].forEach((m) => uniqueMentees.add(m.id))
      }
    })
    return uniqueMentees.size
  }, [menteesByYear])

  // 필터링된 멘티 (with year-based school info)
  const filteredMentees = useMemo(() => {
    let result: (MenteeWithId & { displayUniversity: string; displayDepartment: string })[] = []
    
    if (selectedMentoringYear === 'all') {
      // 중복 제거하여 전체 멘티 반환
      const uniqueMentees = new Map<string, MenteeWithId>()
      mentees.forEach((m) => uniqueMentees.set(m.id, m))
      result = Array.from(uniqueMentees.values()).map(m => ({
        ...m,
        displayUniversity: m.university,
        displayDepartment: m.department
      }))
    } else {
      // 선택한 연도와 해당 연도의 학기들 모두 포함
      const uniqueMentees = new Map<string, MenteeWithId>()
      Object.keys(menteesByYear).forEach((key) => {
        if (key === selectedMentoringYear || key.startsWith(selectedMentoringYear + '-')) {
          menteesByYear[key].forEach((m) => uniqueMentees.set(m.id, m))
        }
      })
      // Apply year-based school info transformation
      result = Array.from(uniqueMentees.values()).map(m => {
        const schoolInfo = getSchoolInfoForYear(m, selectedMentoringYear)
        return {
          ...m,
          displayUniversity: schoolInfo.university,
          displayDepartment: schoolInfo.department
        }
      })
    }
    
    // 대학 필터 적용 (use displayUniversity for filtering)
    if (selectedUniversity !== 'all') {
      result = result.filter(m => m.displayUniversity === selectedUniversity)
    }
    
    // 검색어 필터 적용 (search in both original and display values)
    if (menteeSearchTerm.trim()) {
      const term = menteeSearchTerm.toLowerCase().trim()
      result = result.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.displayUniversity.toLowerCase().includes(term) ||
        m.displayDepartment.toLowerCase().includes(term)
      )
    }
    
    // 정렬: 참여연차 많은 순 → 이름 가나다순
    result.sort((a, b) => {
      const aYears = a.participationYears.length
      const bYears = b.participationYears.length
      if (aYears !== bYears) return bYears - aYears
      return a.name.localeCompare(b.name, 'ko')
    })
    
    return result
  }, [selectedMentoringYear, selectedUniversity, menteeSearchTerm, mentees, menteesByYear])

  // 대학별 통계 (using displayUniversity)
  const universityStats = useMemo(() => {
    const stats = new Map<string, number>()
    filteredMentees.forEach((m) => {
      stats.set(m.displayUniversity, (stats.get(m.displayUniversity) || 0) + 1)
    })
    return Array.from(stats.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'ko'))
  }, [filteredMentees])

  const [publicationStats, setPublicationStats] = useState<{label: string, count: number}[]>([
    {label: 'SCIE', count: 0}, {label: 'SSCI', count: 0}, {label: 'A&HCI', count: 0},
    {label: 'ESCI', count: 0}, {label: 'Scopus', count: 0}, {label: 'Other Int\'l', count: 0},
    {label: 'Int\'l Conf', count: 0}, {label: 'KCI', count: 0}, {label: 'Dom. Conf', count: 0},
  ])

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
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
        setPublicationStats([
          {label: 'SCIE', count: stats.scie},
          {label: 'SSCI', count: stats.ssci},
          {label: 'A&HCI', count: stats.ahci},
          {label: 'ESCI', count: stats.esci},
          {label: 'Scopus', count: stats.scopus},
          {label: 'Other Int\'l', count: stats.otherIntl},
          {label: 'Int\'l Conf', count: stats.intlConf},
          {label: 'KCI', count: stats.kci},
          {label: 'Dom. Conf', count: stats.domConf},
        ])
      })
      .catch(console.error)
  }, [])

  // citationStats imported from @/data/director-common.ts

  const journals = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'journal')
  }, [activitiesData])

  const sessionChairs = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'chair')
  }, [activitiesData])

  const committees = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'committee')
  }, [activitiesData])

  const conferenceReviewers = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'conference')
  }, [activitiesData])

  const conferences = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'conference' || a.category === 'chair' || a.category === 'committee')
  }, [activitiesData])

  const displayedJournals = useMemo(() => {
    return showAllJournals ? journals : journals.slice(0, 20)
  }, [journals, showAllJournals])

  const displayedConferences = useMemo(() => {
    return showAllConferences ? conferences : conferences.slice(0, 20)
  }, [conferences, showAllConferences])

  return (
    <div className="flex flex-col bg-white">
      {/* Banner - 통일된 스타일 */}
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
          {/* Left Column: Profile Card & Quick Info */}
          <aside className="lg:w-380 shrink-0">
        {/* Profile Card */}
            <div 
              ref={profileCardRef}
              className="transition-transform duration-100"
              style={{ transform: `translateY(${profileTop}px)` }}
            >
              {/* Tab Navigation - Desktop: above profile card */}
              <div className="hidden lg:flex items-center gap-6 mb-12">
                <Link
                  to="/members/director"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                >
                  <User size={14} />
                  Profile
                </Link>
                <Link
                  to="/members/director/academic"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                >
                  <BookOpen size={14} />
                  Academics
                </Link>
                <Link
                  to="/members/director/activities"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-md shadow-primary/25"
                >
                  <Activity size={14} />
                  Activities
                </Link>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-20 md:p-24 shadow-sm">
              <div className="flex flex-col items-center text-center mb-24 md:mb-32">
                <div className="w-140 h-180 md:w-180 md:h-232 bg-gray-100 rounded-2xl overflow-hidden mb-16 md:mb-24 shadow-inner border border-gray-50">
                  <img
                    src={directorImg}
                alt="Prof. Insu Choi"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-64">👨‍🏫</div>'
                }}
              />
            </div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">
                  Insu Choi<span className="text-sm md:text-base font-medium text-gray-400 ml-4">, Ph.D.</span>
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-medium">최인수</p>
              </div>

              <div className="flex flex-col gap-16 md:gap-20">
                <div className="flex items-start gap-12 group">
                  <div className="size-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Briefcase size={16}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">Position</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Director</p>
                    <p className="text-[10px] md:text-xs text-gray-500">FINDS Lab</p>
                  </div>
                </div>

                <div className="flex items-start gap-12 group">
                  <div className="size-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Building size={16}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">Affiliation</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Assistant Professor</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Gachon University</p>
                  </div>
                </div>

                <div className="flex items-start gap-12 group">
                  <div className="size-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <MapPin size={16}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">Office</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">Room 304, Gachon Hall</p>
                    <p className="text-[10px] md:text-xs text-gray-500">가천대학교 글로벌캠퍼스 가천관 304호</p>
                  </div>
                </div>

                <div className="flex items-start gap-12 group">
                  <div className="size-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Mail size={16}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">E-mail</p>
                    <div className="flex items-center gap-8">
                      <a href={`mailto:${directorEmail}`} className="select-text text-xs md:text-sm font-semibold text-primary hover:underline break-all">
                        {directorEmail}
                      </a>
                      <button
                        onClick={handleCopyEmail}
                        className="size-24 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors shrink-0"
                        title="Copy email"
                      >
                        {emailCopied ? (
                          <Check size={12} className="text-green-500"/>
                        ) : (
                          <Copy size={12} className="text-gray-400"/>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-12 group">
                  <div className="size-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#D6B14D]/10 group-hover:text-[#D6B14D] transition-colors shrink-0">
                    <Phone size={16}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">Phone</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">031-750-0614</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 md:gap-12 mt-24 md:mt-32">
                <button
                  onClick={() => showModal({
                    title: '',
                    maxWidth: '800px',
                    children: <ResumeModal />
                  })}
                  className="flex items-center justify-center gap-6 py-12 bg-primary text-white text-xs md:text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  View Resume <ExternalLink size={14}/>
                </button>
                <a
                  href="https://scholar.google.com/citations?user=p9JwRLwAAAAJ&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-6 py-12 bg-primary text-xs md:text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
                  style={{ color: 'white' }}
                >
                  Scholar <ExternalLink size={14}/>
                </a>
              </div>
            </div>
            </div>
          </aside>

          {/* Right Column: Activities Only */}
          <main className="flex-1 flex flex-col gap-40 md:gap-56 min-w-0">
            {/* Honors & Awards */}
            {honorsData && Object.keys(honorsData).length > 0 && (
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('honorsAwards')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Honors & Awards</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.honorsAwards ? 'rotate-180' : ''}`}/>
              </button>

              {expandedSections.honorsAwards && (
                <div className="border-t border-gray-100 p-20 md:p-24">
                  <div className="space-y-12">
                    {Object.keys(honorsData).sort((a, b) => Number(b) - Number(a)).map((year) => {
                      const items = honorsData[year]
                      const awards = items.filter((item) => item.type === 'award')
                      const honors = items.filter((item) => item.type === 'honor')
                      const isExpanded = expandedYears.has(year)
                      const currentYear = new Date().getFullYear()
                      const isCurrentYear = Number(year) === currentYear

                      return (
                        <div key={year} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleYear(year)}
                            className={`w-full flex items-center justify-between px-16 py-14 transition-colors ${
                              isCurrentYear 
                                ? 'bg-[#FFF3CC] hover:bg-[#FFEB99]' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-12 flex-wrap">
                              <span className={`text-lg font-bold ${isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-800'}`}>{year}</span>
                              {isCurrentYear && (
                                <span className="px-8 py-2 bg-[#D6B14D] text-white text-[10px] md:text-xs font-semibold rounded-full">NEW</span>
                              )}
                              <span className="px-10 py-4 bg-white rounded-full text-[10px] font-medium shadow-sm">
                                <span className="font-bold" style={{color: '#D6B14D'}}>{honors.length}</span>
                                <span className="text-gray-500"> {honors.length === 1 ? 'Honor' : 'Honors'}</span>
                                <span className="text-gray-300"> · </span>
                                <span className="font-bold" style={{color: '#AC0E0E'}}>{awards.length}</span>
                                <span className="text-gray-500"> {awards.length === 1 ? 'Award' : 'Awards'}</span>
                              </span>
                            </div>
                            <ChevronDown 
                              size={18} 
                              className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="flex flex-col">
                              {items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-12 p-16 bg-white border-t border-gray-100"
                                >
                                  <div
                                    className={`w-36 h-36 rounded-lg flex items-center justify-center flex-shrink-0 mt-2 ${
                                      item.type === 'honor' ? 'bg-[#FFF3CC]' : 'bg-[#FFBAC4]/20'
                                    }`}
                                  >
                                    {item.type === 'honor' ? (
                                      <Medal className="w-18 h-18 text-[#D6B14D]" />
                                    ) : (
                                      <Trophy className="w-18 h-18 text-[#AC0E0E]" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm md:text-base font-bold text-gray-800 mb-4">{item.title}</h4>
                                      <p className="text-xs md:text-sm text-gray-600 font-medium mb-4">{item.event}</p>
                                      <p className="text-xs md:text-sm text-gray-500 font-medium">{item.organization}</p>
                                      <p className="md:hidden text-[10px] text-gray-400 mt-4">{isDateRange(item.date) ? formatHonorDate(item.date) : `${year}-${formatHonorDate(item.date)}`}</p>
                                    </div>
                                    <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">
                                      {isDateRange(item.date) ? formatHonorDate(item.date) : `${year}-${formatHonorDate(item.date)}`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
            )}

            {/* Off-Campus Activities */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('activities')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Off-Campus Activities</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.activities ? 'rotate-180' : ''}`}/>
              </button>

              {expandedSections.activities && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 p-20 md:p-24 border-t border-gray-100">
                {activities.filter(a => !a.hidden).map((act) => (
                  <button
                    key={act.name}
                    onClick={() => showModal({
                      maxWidth: '400px',
                      children: (
                        <div className="text-center">
                          {/* Logo */}
                          <div className="size-80 bg-gray-50 rounded-xl p-12 flex items-center justify-center mx-auto mb-16">
                            <img loading="lazy" decoding="async" src={act.logo} alt={act.name} className="w-full h-full object-contain"/>
                          </div>

                          {/* Name */}
                          <h3 className="text-base font-bold text-primary mb-6">{act.name}</h3>
                          {act.fullName && (
                            <p className="text-xs text-gray-500 mb-2">{act.fullName}</p>
                          )}
                          {act.fullNameKo && (
                            <p className="text-xs text-gray-500 font-bold mb-6">{act.fullNameKo}</p>
                          )}

                          {/* Generation */}
                          {act.generation && (
                            <p className="text-gray-600 font-bold text-xs mb-16">{act.generation}</p>
                          )}

                          {/* Membership */}
                          {act.membership.length > 0 && (
                            <div className="border-t border-gray-100 pt-16 space-y-6">
                              {act.membership.map((r, idx) => (
                                <div key={idx} className="flex items-center justify-between px-12 py-10 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-bold text-gray-700">{r.role}</span>
                                  <span className="text-[10px] text-gray-500">{r.period}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Leadership */}
                          {act.leadership.length > 0 && (
                            <div className="mt-16 pt-16 border-t border-gray-100">
                              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-10">Leadership</h4>
                              <div className="space-y-6">
                                {act.leadership.map((r, idx) => (
                                  <div key={idx} className="flex items-center justify-between px-12 py-10 bg-primary/5 rounded-lg border border-primary/10">
                                    <span className="text-xs font-bold text-primary">{r.role}</span>
                                    <span className="text-[10px] text-gray-500">{r.period}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Instagram */}
                          {act.instagram && (
                            <div className="mt-16 pt-16 border-t border-gray-100">
                              <a
                                href={act.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-8 px-16 py-10 bg-[#D6B14D] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                              >
                                <Instagram size={14} />
                                Instagram
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    className="flex items-center gap-16 bg-white border border-gray-100 rounded-xl p-20 hover:shadow-lg hover:border-[#D6B14D]/30 transition-all group text-left"
                  >
                    <div className="size-56 bg-gray-50 rounded-xl p-8 flex items-center justify-center group-hover:bg-primary/5 transition-colors shrink-0">
                      <img loading="lazy" decoding="async" src={act.logo} alt={act.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-primary">{act.name}</h4>
                      {act.fullName && <p className="text-xs text-gray-500 mt-2 truncate">{act.fullName}</p>}
                      {act.fullNameKo && <p className="text-xs text-gray-400 font-semibold truncate">{act.fullNameKo}</p>}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#D6B14D] transition-colors shrink-0"/>
                  </button>
                ))}
                </div>
              )}
            </section>

            {/* Mentoring Program Tooltip (fixed position, outside scroll) */}
            {programTooltip && (
              <div
                className="fixed px-12 py-8 bg-gray-900 text-white text-[10px] rounded-lg pointer-events-none shadow-2xl border border-gray-700/50"
                style={{left: programTooltip.x, top: programTooltip.y, zIndex: 99999}}
              >
                <span className="font-bold text-[#D6B14D] block">{programTooltip.name}</span>
                {programTooltip.org && <span className="block text-gray-400 mt-1">{programTooltip.org}</span>}
              </div>
            )}

            {/* Mentoring Program */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('mentoringProgram')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Mentoring & Tutoring Program</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.mentoringProgram ? 'rotate-180' : ''}`}/>
              </button>

              {expandedSections.mentoringProgram && (
                <div className="border-t border-gray-100">
                {/* Header with Stats */}
                <div className="bg-gray-50/50 px-20 md:px-32 py-24 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-primary">{mentees.length}</p>
                      <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-4">Total Mentees & Tutees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold" style={{color: '#D6A076'}}>13</p>
                      <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-4">Years Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold" style={{color: '#AC0E0E'}}>
                        {menteesByYear['2026']?.length || 0}
                      </p>
                      <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-4">Current Mentees & Tutees</p>
                    </div>
                  </div>
                </div>

                {/* Year Distribution */}
                <div className="px-20 md:px-32 pt-16">
                  <p className="text-[10px] font-bold text-gray-400">Year Distribution</p>
                </div>

                {/* Year Filter */}
                <div className="px-20 md:px-32 py-16 border-b border-gray-100 flex items-center gap-8 md:gap-12 overflow-x-auto">
                  <button
                    onClick={() => setSelectedMentoringYear('all')}
                    className={`px-12 md:px-16 py-6 md:py-8 rounded-full text-xs md:text-xs font-bold transition-all shrink-0 flex flex-col items-center ${
                      selectedMentoringYear === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-5 rounded-full text-[10px] font-bold ${
                      selectedMentoringYear === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>{mentees.length}</span>
                  </button>
                  {mentoringYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedMentoringYear(selectedMentoringYear === year ? 'all' : year)}
                      className={`px-12 md:px-16 py-6 md:py-8 rounded-full text-xs md:text-xs font-bold transition-all shrink-0 flex flex-col items-center ${
                        selectedMentoringYear === year
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {year}
                      <span className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-5 rounded-full text-[10px] font-bold ${
                        selectedMentoringYear === year
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>{getMenteeCountByYear(year)}</span>
                    </button>
                  ))}
                </div>

                {/* University Distribution - Clickable Filter */}
                {universityStats.length > 0 && (
                  <div className="px-20 md:px-32 py-16 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-12">
                      <p className="text-[10px] font-bold text-gray-400">Affiliation Distribution</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:gap-8">
                      {universityStats.map(([univ, count]) => (
                        <button
                          key={univ}
                          onClick={() => setSelectedUniversity(selectedUniversity === univ ? 'all' : univ)}
                          className={`px-10 md:px-12 py-6 md:py-8 rounded-lg text-xs md:text-xs font-medium transition-all flex items-center justify-between gap-4 ${
                            selectedUniversity === univ
                              ? 'text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-[#D6B14D]/50 hover:bg-[#D6B14D]/5'
                          }`}
                          style={selectedUniversity === univ ? {backgroundColor: '#E8889C'} : {}}
                        >
                          <span className="truncate">{univ}</span>
                          <span className="flex items-center gap-2 shrink-0">
                            <span className={selectedUniversity === univ ? 'font-bold' : 'font-bold'} style={{color: selectedUniversity === univ ? 'white' : '#E8889C'}}>{count}</span>
                            {selectedUniversity === univ && <X size={12}/>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Filters - Below Affiliation Distribution */}
                {(selectedMentoringYear !== 'all' || selectedUniversity !== 'all') && (
                  <div className="px-20 md:px-32 py-12 border-b border-gray-100 bg-primary/5">
                    <div className="flex items-center gap-8 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-500 leading-none">
                        {(selectedMentoringYear !== 'all' && selectedUniversity !== 'all') ? 'Active Filters' : 'Active Filter'}
                      </span>
                      {selectedMentoringYear !== 'all' && (
                        <button
                          onClick={() => setSelectedMentoringYear('all')}
                          className="inline-flex items-center justify-center gap-4 px-10 py-4 rounded-full text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all leading-none"
                        >
                          <span>{selectedMentoringYear}</span>
                          <X size={10} />
                        </button>
                      )}
                      {selectedUniversity !== 'all' && (
                        <button
                          onClick={() => setSelectedUniversity('all')}
                          className="inline-flex items-center justify-center gap-4 px-10 py-4 rounded-full text-xs font-medium text-white hover:opacity-90 transition-all leading-none"
                          style={{backgroundColor: '#E8889C'}}
                        >
                          <span>{selectedUniversity}</span>
                          <X size={10} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMentoringYear('all')
                          setSelectedUniversity('all')
                        }}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700 underline ml-auto"
                      >
                        Reset All
                      </button>
                    </div>
                  </div>
                )}

                {/* Mentee Search */}
                <div className="px-20 md:px-32 py-16 border-b border-gray-100">
                  <div className="relative">
                    <Search size={16} className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentees by name, university, or department..."
                      value={menteeSearchTerm}
                      onChange={(e) => setMenteeSearchTerm(e.target.value)}
                      className="w-full pl-36 pr-12 py-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Mentee List */}
                <div className="max-h-400 overflow-y-auto" style={{overflowX: "clip"}}>
                  {filteredMentees.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {filteredMentees.map((mentee) => (
                        <div
                          key={mentee.id}
                          className="px-20 md:px-32 py-12 md:py-16 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between md:flex-row">
                            <div className="flex items-center gap-12 md:gap-16">
                              <div className="size-36 md:size-40 rounded-full flex items-center justify-center shrink-0" style={{backgroundColor: 'rgba(255,183,197,0.2)'}}>
                                <span className="text-sm md:text-base font-bold" style={{color: 'rgb(172,14,14)'}}>{mentee.participationYears.length}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">{mentee.name}</p>
                                <p className="text-xs md:text-xs text-gray-500 truncate">
                                  {mentee.displayUniversity} · {mentee.displayDepartment} · {mentee.entryYear}학번
                                </p>
                              </div>
                            </div>
                            <div className="hidden md:flex items-center gap-8 md:gap-12 shrink-0">
                              <div className="flex gap-4 flex-wrap justify-end">
                                {mentee.participationYears.map((py) => {
                                  const year = typeof py === 'string' ? py : py.year
                                  const program = typeof py === 'string' ? '' : py.program
                                  return (
                                    <span
                                      key={year}
                                      className={`relative px-6 md:px-8 py-2 rounded text-[10px] font-bold ${program ? 'cursor-help' : ''} ${
                                        year === '2026'
                                          ? ''
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                      style={year === '2026' ? {backgroundColor: 'rgba(255,183,197,0.3)', color: 'rgb(172,14,14)'} : {}}
                                      onMouseEnter={(e) => { if (program) { const rect = e.currentTarget.getBoundingClientRect(); const info = parseProgramInfo(program); setProgramTooltip({name: info.name, org: info.org, x: rect.left, y: rect.bottom + 6}); }}}
                                      onMouseLeave={() => setProgramTooltip(null)}
                                    >
                                      {year}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                          {/* Mobile year badges - below info */}
                          <div className="flex md:hidden gap-4 flex-wrap mt-8 ml-48">
                            {mentee.participationYears.map((py) => {
                              const year = typeof py === 'string' ? py : py.year
                              const program = typeof py === 'string' ? '' : py.program
                              return (
                                <span
                                  key={year}
                                  className={`relative px-6 py-2 rounded text-[10px] font-bold ${program ? 'cursor-help' : ''} ${
                                    year === '2026'
                                      ? ''
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                  style={year === '2026' ? {backgroundColor: 'rgba(255,183,197,0.3)', color: 'rgb(172,14,14)'} : {}}
                                  onMouseEnter={(e) => { if (program) { const rect = e.currentTarget.getBoundingClientRect(); const info = parseProgramInfo(program); setProgramTooltip({name: info.name, org: info.org, x: rect.left, y: rect.bottom + 6}); }}}
                                  onMouseLeave={() => setProgramTooltip(null)}
                                >
                                  {year}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-40 text-center text-gray-400">
                      <User size={40} className="mx-auto mb-12 opacity-30"/>
                      <p className="text-sm mb-12">No mentees found for this filter combination</p>
                      {(selectedMentoringYear !== 'all' || selectedUniversity !== 'all') && (
                        <button
                          onClick={() => {
                            setSelectedMentoringYear('all')
                            setSelectedUniversity('all')
                          }}
                          className="px-16 py-8 rounded-full text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-20 md:px-32 py-12 md:py-16 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-xs md:text-xs text-gray-500">
                    Showing <span className="font-bold text-gray-700">{filteredMentees.length}</span> mentee{filteredMentees.length !== 1 ? 's' : ''}
                    {selectedMentoringYear !== 'all' && <span className="text-primary"> in {selectedMentoringYear}</span>}
                    {selectedUniversity !== 'all' && <span className="text-primary"> from {selectedUniversity}</span>}
                  </p>
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
          <div className="absolute bottom-56 right-0 flex flex-col gap-8 mb-8">
            <Link
              to="/members/director"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-gray-200 whitespace-nowrap bg-white text-gray-600 hover:bg-gray-50"
            >
              <User size={13} />
              Profile
            </Link>
            <Link
              to="/members/director/academic"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-gray-200 whitespace-nowrap bg-white text-gray-600 hover:bg-gray-50"
            >
              <BookOpen size={13} />
              Academics
            </Link>
            <Link
              to="/members/director/activities"
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-primary/20 whitespace-nowrap bg-primary text-white"
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

export default memo(MembersDirectorActivitiesTemplate)
