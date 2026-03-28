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
  Home,
  Copy,
  Check,
  User,
  Activity,
  Award,
  Landmark,
  FlaskConical,
  Calendar,
  BookOpen,
  Search,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Folder,
  Factory,
  School,
  Crown,
  ShieldCheck,
  Compass,
  Microscope,
} from 'lucide-react'
import {useStoreModal} from '@/store/modal'
import type {AcademicActivitiesData, Publication} from '@/types/data'
import type {AuthorsData} from '@/types/data'
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

// Types
type Project = {
  titleEn: string
  titleKo: string
  period: string
  fundingAgency: string
  fundingAgencyKo?: string
  type: 'government' | 'industry' | 'institution' | 'academic'
  language?: 'ko' | 'en'
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
    advisors: [
      {name: 'Woo Chang Kim', url: 'https://scholar.google.com/citations?user=7NmBs1kAAAAJ&hl=en'}
    ],
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
    advisors: [
      {name: 'Woo Chang Kim', url: 'https://scholar.google.com/citations?user=7NmBs1kAAAAJ&hl=en'}
    ],
    leadership: [],
    awards: [{title: 'Best Master Thesis Award', org: 'Korean Institute of Industrial Engineers (KIIE, 대한산업공학회)'}],
    logo: logoKaist
  },
  {
    school: 'Kyung Hee University',
    period: '2018-02',
    degree: 'Bachelor of Engineering (B.E.)',
    field: 'Industrial and Management Systems Engineering',
    advisors: [
      {name: 'Jang Ho Kim', url: 'https://scholar.google.com/citations?user=uTiqWBMAAAAJ&hl=en'},
      {name: 'Myoung-Ju Park', url: 'https://scholar.google.com/citations?user=O8OYIzMAAAAJ&hl=en&oi=sra'}
    ],
    leadership: [
      {role: 'Head of Culture & Public Relations', context: '41st Student Council, College of Engineering', period: '2017-01 – 2017-11'},
      {role: 'President', context: '7th Student Council, Department of Industrial and Management Systems Engineering', period: '2016-01 – 2016-12'},
    ],
    awards: [{title: "Dean's Award for Academic Excellence", org: "College of Engineering, Kyung Hee University"}],
    honors: [{title: 'Valedictorian', org: '1st out of 86 students', gpa: '4.42', gpaMax: '4.5'}],
    logo: logoKyunghee
  },
]

// Static Data - Employment (sorted by start date, newest first)
const employment = [
  {position: 'Assistant Professor (Tenure-Track)', positionKo: '조교수', department: 'Big Data Business Management Major, Department of Finance & Big Data, College of Business', departmentKo: '경영대학 금융·빅데이터학부 빅데이터경영전공', organization: 'Gachon University', organizationKo: '가천대학교', period: '2026-03 – Present', logo: logoGcu, isCurrent: true},
  {position: 'Assistant Professor (Tenure-Track)', positionKo: '조교수', department: 'Division of Business Administration, College of Business', departmentKo: '경영대학 경영융합학부', organization: 'Dongduk Women\'s University', organizationKo: '동덕여자대학교', period: '2025-09 – 2026-02', logo: logoDwu, isCurrent: false},
  {position: 'Director', positionKo: '연구실장', department: '', departmentKo: '', organization: 'FINDS Lab', organizationKo: '', period: '2025-06 – Present', logo: logoFinds, isCurrent: true},
  {position: 'Postdoctoral Researcher', positionKo: '박사후연구원', department: 'Financial Technology Lab, Graduate School of Management of Technology', departmentKo: '기술경영전문대학원 금융기술연구실', organization: 'Korea University', organizationKo: '고려대학교', period: '2025-03 – 2025-08', logo: logoKorea, isCurrent: false},
  {position: 'Postdoctoral Researcher', positionKo: '박사후연구원', department: 'Financial Engineering Lab, Department of Industrial and Systems Engineering', departmentKo: '산업및시스템공학과 금융공학연구실', organization: 'Korea Advanced Institute of Science and Technology (KAIST)', organizationKo: '한국과학기술원', period: '2025-03 – 2025-08', logo: logoKaist, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Department of Electronic and Semiconductor Engineering, College of Engineering', departmentKo: '공과대학 전자반도체공학부 (舊 인공지능융합공학부)', organization: 'Kangnam University', organizationKo: '강남대학교', period: '2025-03 – 2026-02', logo: logoKangnam, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Digital Business Major, Division of Convergence Business, College of Global Business', departmentKo: '글로벌비즈니스대학 융합경영학부 디지털경영전공', organization: 'Korea University Sejong Campus', organizationKo: '고려대학교 세종캠퍼스', period: '2025-03 – 2026-02', logo: logoKorea, isCurrent: false},
  {position: 'Lecturer', positionKo: '강사', department: 'Department of Industrial and Management Systems Engineering', departmentKo: '산업경영공학과', organization: 'Kyung Hee University', organizationKo: '경희대학교', period: '2024-03 – 2024-08', logo: logoKyunghee, isCurrent: false},
  {position: 'Research Consultant', positionKo: '연구 컨설턴트', department: '', departmentKo: '', organization: 'WorldQuant Brain', organizationKo: '월드퀀트 브레인', period: '2022-06 – Present', logo: logoWorldquant, isCurrent: true},
  {position: 'Doctoral Technical Research Personnel', positionKo: '박사과정 전문연구요원', department: 'Department of Industrial and Systems Engineering', departmentKo: '산업및시스템공학과', organization: 'Korea Advanced Institute of Science and Technology (KAIST)', organizationKo: '한국과학기술원', period: '2022-03 – 2025-02', logo: logoKaist, isCurrent: false},
  {position: 'Intern', positionKo: '인턴', department: 'Data & Analytics Team', departmentKo: '데이터 애널리틱스 팀', organization: 'EY Consulting', organizationKo: 'EY컨설팅', period: '2020-03 – 2020-05', logo: logoEy, isCurrent: false},
  {position: 'Director', positionKo: '대표', department: '', departmentKo: '', organization: 'JL Creatives & Contents (JL C&C)', organizationKo: 'JL크리에이티브&콘텐츠', period: '2014-06 – Present', logo: logoJl, isCurrent: true},
]

// Static Data - Professional Affiliations, Citation Statistics, Research Interests
// Now imported from @/data/director-common.ts


// Collaboration Network Types
type PublicationBreakdown = {
  journal: number
  conference: number
  book: number
  report: number
  others: number
}

type CollabPublication = {
  title: string
  titleKo: string
  year: number
  venue: string
  venueKo: string
  type: string
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
  collabPubs: CollabPublication[]
  breakdown: PublicationBreakdown
  coworkRate: number
}

type NetworkLink = {
  source: string
  target: string
  weight: number
}

// Collaboration Network Component
const CollaborationNetwork = memo(() => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [coworkRateThreshold, setCoworkRateThreshold] = useState(2) // 0-100%, default 2%
  const [totalPubsCount, setTotalPubsCount] = useState(0)
  
  // 모바일/데스크탑에 따른 기본 zoom 값
  const getDefaultZoom = () => typeof window !== 'undefined' && window.innerWidth < 768 ? 1.6 : 1.0
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
        const minPubCount = coworkRateThreshold === 0 ? 1 : Math.max(1, Math.ceil(totalPubs * coworkRateThreshold / 100))
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
              // Inner ring - closer to center, evenly spaced (increased from 120 to 160)
              const angle = (2 * Math.PI * sortedIdx) / innerRingCount - Math.PI / 2
              const radius = 160
              x = centerX + Math.cos(angle) * radius
              y = centerY + Math.sin(angle) * radius
            } else {
              // Outer ring (increased from 200 to 240)
              const outerIdx = sortedIdx - innerRingCount
              const outerCount = total - innerRingCount
              if (outerCount > 0) {
                const angle = (2 * Math.PI * outerIdx) / outerCount - Math.PI / 2 + Math.PI / outerCount
                const radius = 240
                x = centerX + Math.cos(angle) * radius
                y = centerY + Math.sin(angle) * radius
              } else {
                // Fallback - place at random position in outer area
                const angle = Math.random() * 2 * Math.PI
                const radius = 240
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
            report: collabPubsList.filter(p => p.type === 'report').length,
            others: collabPubsList.filter(p => p.type === 'other' || (p.type !== 'journal' && p.type !== 'conference' && p.type !== 'book' && p.type !== 'report')).length,
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
            // Director 노드와는 더 큰 최소 거리 유지
            const minDist = (node.isDirector || other.isDirector) ? 100 : 80
            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.4
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
            min="0"
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

          {/* Links - Curved lines with gradient */}
          <g className="links">
            {links.map((link) => {
              const source = nodes.find((n) => n.id === link.source)
              const target = nodes.find((n) => n.id === link.target)
              if (!source || !target) return null
              
              // Calculate curved path
              const dx = target.x - source.x
              const dy = target.y - source.y
              const dr = Math.sqrt(dx * dx + dy * dy) * 0.8
              
              const isDirectorLink = source.isDirector || target.isDirector
              const strokeColor = isDirectorLink ? 'rgba(172,14,14,0.6)' : 'rgba(255,186,196,0.5)'
              const strokeWidth = Math.max(0.8, Math.min(2, link.weight * 0.4))
              
              return (
                <path
                  key={`${link.source}-${link.target}`}
                  d={`M${source.x},${source.y} Q${(source.x + target.x) / 2 + (dy * 0.1)},${(source.y + target.y) / 2 - (dx * 0.1)} ${target.x},${target.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={getLinkOpacity(link)}
                  strokeLinecap="round"
                  className="transition-opacity duration-200"
                />
              )
            })}
          </g>

          {/* Nodes - Director rendered last to appear on top */}
          <g className="nodes">
            {[...nodes].sort((a, b) => (a.isDirector ? 1 : 0) - (b.isDirector ? 1 : 0)).map((node) => {
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
                </g>
              )
            })}
          </g>

          {/* Labels - Rendered last to appear on top of everything */}
          <g className="labels">
            {[...nodes].sort((a, b) => (a.isDirector ? 1 : 0) - (b.isDirector ? 1 : 0)).map((node) => {
              const size = getNodeSize(node)
              return (
                <g
                  key={`label-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={getNodeOpacity(node)}
                  className="pointer-events-none"
                >
                  {/* Label background for readability */}
                  <text
                    y={size + 14}
                    textAnchor="middle"
                    fill="white"
                    stroke="white"
                    strokeWidth={node.isDirector ? 4 : 3}
                    strokeLinejoin="round"
                    fontSize={node.isDirector ? 12 : 8}
                    fontWeight={node.isDirector ? 700 : 600}
                    className="select-none"
                  >
                    {node.nameKo || node.name}
                  </text>
                  {/* Label text */}
                  <text
                    y={size + 14}
                    textAnchor="middle"
                    fill={node.isDirector ? '#D6B14D' : '#374151'}
                    fontSize={node.isDirector ? 12 : 8}
                    fontWeight={node.isDirector ? 700 : 600}
                    className="select-none"
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
                          <span className="size-4 rounded-full" style={{backgroundColor: '#D6B14D'}}/>
                          <span className="text-xs text-gray-600 flex-1">Journal Paper{node.breakdown.journal !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.journal}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full" style={{backgroundColor: '#AC0E0E'}}/>
                          <span className="text-xs text-gray-600 flex-1">Conference Proceeding{node.breakdown.conference !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.conference}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full" style={{backgroundColor: '#E8D688'}}/>
                          <span className="text-xs text-gray-600 flex-1">Book{node.breakdown.book !== 1 ? 's' : ''}</span>
                          <span className="text-xs font-bold text-gray-800">{node.breakdown.book}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="size-4 rounded-full" style={{backgroundColor: '#FFBAC4'}}/>
                          <span className="text-xs text-gray-600 flex-1">Report{node.breakdown.report !== 1 ? 's' : ''}</span>
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



export const MembersDirectorAcademicTemplate = () => {
  const [emailCopied, setEmailCopied] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [teachingSearchTerm, setTeachingSearchTerm] = useState('')
  const [expandedProjectYears, setExpandedProjectYears] = useState<string[]>([])
  const [activitiesData, setActivitiesData] = useState<AcademicActivitiesData | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    collaborationNetwork: true,
    publications: true,
    publicationStats: true,
    projectStats: true,
    academicService: true,
    editorialBoard: true,
    academicMemberships: true,
    programCommittee: true,
    sessionChair: true,
    journalReviewer: true,
    conferenceReviewer: true,
    projects: true,
    teaching: true,
    lecturer: true,
    teachingAssistant: true
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
      if (window.innerWidth < 1024) return
      
      const section = contentSectionRef.current
      const card = profileCardRef.current
      const sectionRect = section.getBoundingClientRect()
      const cardHeight = card.offsetHeight
      const navHeight = 16
      const bottomPadding = 32
      
      // 화면 중앙 위치 계산 (nav bar 아래 영역의 중앙)
      const availableHeight = window.innerHeight - navHeight
      const centerOffset = navHeight + (availableHeight - cardHeight) / 2
      
      // Section의 시작이 centerOffset 위로 올라가면 sticky 시작
      if (sectionRect.top <= centerOffset) {
        // Section의 끝이 card + centerOffset + padding 보다 작으면 bottom에 고정
        if (sectionRect.bottom <= cardHeight + centerOffset + bottomPadding) {
          setProfileTop(sectionRect.bottom - cardHeight - bottomPadding - sectionRect.top)
        } else {
          // 화면 중앙에 위치
          setProfileTop(centerOffset - sectionRect.top)
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
  const [pubStats, setPubStats] = useState<{label: string, count: number}[]>([
    {label: 'SCIE', count: 0}, {label: 'SSCI', count: 0}, {label: 'A&HCI', count: 0}, 
    {label: 'ESCI', count: 0}, {label: 'Scopus', count: 0}, {label: 'Other Int\'l', count: 0},
    {label: 'KCI', count: 0}, {label: 'Int\'l Conf', count: 0}, {label: 'Dom. Conf', count: 0}
  ])
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
    
    // Mobile: collapse some sections by default (but keep projects and academicService expanded)
    if (window.innerWidth < 768) {
      setExpandedSections(prev => ({
        ...prev,
        academicService: true
      }))
    }
    
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
              stats.scopus++  // Scopus Conference → Scopus에 카운트
              stats.intlConf++  // Scopus Conference → Int'l Conf에도 카운트 (중복 OK)
            } else if (indexing === 'International Conference') {
              stats.intlConf++
            } else if (indexing === 'Domestic Conference') {
              stats.domConf++
            }
          }
        })
        
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
    
    // Fetch Academic Activities
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

  // Group projects by year
  const projectsByYear = useMemo(() => {
    const filtered = projectSearchTerm.trim()
      ? projects.filter(p => 
          p.titleEn.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          p.titleKo.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          p.fundingAgency.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
          (p.fundingAgencyKo?.toLowerCase() || '').includes(projectSearchTerm.toLowerCase())
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

  // Project statistics for the stats card
  const projectStats = useMemo(() => {
    // Priority-based exclusive counting: PI > Lead > Visiting > Researcher
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
  }}, [projects])

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

  const journals = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'journal').sort((a, b) => a.name.localeCompare(b.name))
  }, [activitiesData])

  const editorialBoards = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'editorial')
  }, [activitiesData])

  const memberships = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'membership')
  }, [activitiesData])

  const committees = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'committee')
  }, [activitiesData])

  const sessionChairs = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'chair')
  }, [activitiesData])

  const conferenceReviewers = useMemo(() => {
    if (!activitiesData) return []
    return activitiesData.activities.filter(a => a.category === 'conference')
  }, [activitiesData])

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
          <aside className="lg:w-380 shrink-0">
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
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-md shadow-primary/25"
                >
                  <BookOpen size={14} />
                  Academics
                </Link>
                <Link
                  to="/members/director/activities"
                  className="flex-1 flex items-center justify-center gap-5 py-10 rounded-full text-sm font-semibold transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                >
                  <Activity size={14} />
                  Activities
                </Link>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-20 md:p-24 shadow-sm">
              <div className="flex flex-col items-center text-center mb-24 md:mb-32">
                <div className="w-140 h-180 md:w-180 md:h-232 bg-gray-100 rounded-2xl overflow-hidden mb-16 md:mb-24 shadow-inner border border-gray-50">
                  <img loading="lazy" decoding="async" src={directorImg} alt="Prof. Insu Choi" className="w-full h-full object-cover"/>
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">
                  Insu Choi
                  <span className="text-sm md:text-base font-medium text-gray-400 ml-4">, Ph.D.</span>
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
                        {emailCopied ? <Check size={12} className="text-green-500"/> : <Copy size={12} className="text-gray-400"/>}
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

          {/* Right Column */}
          <main className="flex-1 flex flex-col gap-40 md:gap-56 min-w-0">
            {/* Publications */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('publications')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Publications</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.publications ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.publications && (
                <div className="border-t border-gray-100 p-20 md:p-24">
                  <div className="text-center">
                    <Link to="/publications?author=Insu Choi" className="inline-flex items-center gap-6 px-20 py-10 rounded-full border border-[#D6B14D]/30 text-sm font-semibold hover:bg-[#FFF9E6] hover:border-[#D6B14D]/60 transition-all duration-300" style={{color: '#9A7D1F'}}>
                      View All Publications <ChevronRight size={14}/>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Collaboration Network */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('collaborationNetwork')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Collaboration Network</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.collaborationNetwork ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.collaborationNetwork && (
                <div className="border-t border-gray-100 p-20 md:p-24">
                  <CollaborationNetwork />
                </div>
              )}
            </section>


            {/* Academic Service */}
            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('academicService')}
                className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Academic Service</h3>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.academicService ? 'rotate-180' : ''}`}/>
              </button>
              {expandedSections.academicService && (
                <div className="border-t border-gray-100">
                  {/* Editorial Service */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => toggleSection('editorialBoard')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm md:text-base font-bold text-gray-900">Editorial Service</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.editorialBoard ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.editorialBoard && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20 space-y-8">
                        {editorialBoards.map((item) => (
                          <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-12 bg-white rounded-lg border border-gray-100 hover:border-[#D6B14D]/30 transition-colors gap-4 md:gap-8">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-gray-700">{item.name}</p>
                              {item.specialIssue && <p className="text-[10px] md:text-xs text-gray-400 mt-1">Special Issue: {item.specialIssue}</p>}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 shrink-0">
                              <div className="flex items-center gap-4">
                                <span className="px-6 py-2 bg-[#D6B14D] text-white text-[10px] md:text-xs font-bold rounded">{item.type}</span>
                                <span className="px-6 py-2 bg-[#FFBAC4] text-white text-[10px] md:text-xs font-bold rounded">{item.role}</span>
                              </div>
                              <span className="md:hidden text-[10px] text-gray-400 font-medium">{item.since} – Present</span>
                              <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">{item.since} – Present</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Academic Memberships */}
                  <div className="bg-gray-50/50 border-b border-gray-100">
                    <button
                      onClick={() => toggleSection('academicMemberships')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm md:text-base font-bold text-gray-900">Academic Memberships</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.academicMemberships ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.academicMemberships && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20 space-y-8">
                        {memberships.map((item) => (
                          <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-12 bg-white rounded-lg border border-gray-100 hover:border-[#D6B14D]/30 transition-colors gap-4 md:gap-8">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-semibold text-gray-700">{item.name}</p>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 shrink-0">
                              <span className="px-6 py-2 bg-[#FFBAC4] text-white text-[10px] md:text-xs font-bold rounded self-start md:self-auto">{item.type}</span>
                              <span className="md:hidden text-[10px] text-gray-400 font-medium">{item.since} – Present</span>
                              <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">{item.since} – Present</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Committee Members */}

                  {/* Program Committee */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => toggleSection('programCommittee')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm md:text-base font-bold text-gray-900">Program Committee</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.programCommittee ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.programCommittee && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20">
                        {committees.length > 0 ? (
                          <div className="flex flex-col gap-6">
                            {committees.map((comm) => (
                              <a key={comm.id} href={comm.url || '#'} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col md:flex-row md:items-center md:justify-between p-12 rounded-lg transition-all hover:shadow-md bg-white border border-gray-100 hover:border-[#D6B14D]/30 gap-4 md:gap-12">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-semibold text-gray-700">{comm.name}</p>
                                  {comm.name_ko && (
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-2">{comm.name_ko}</p>
                                  )}
                                  <span className="md:hidden block text-[10px] text-gray-400 font-medium mt-2">{comm.period || comm.since}</span>
                                </div>
                                <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">{comm.period || comm.since}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-xs text-gray-400">Coming soon...</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Session Chair */}
                  <div className="bg-gray-50/50 border-b border-gray-100">
                    <button
                      onClick={() => toggleSection('sessionChair')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm md:text-base font-bold text-gray-900">Session Chair</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.sessionChair ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.sessionChair && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20">
                        {sessionChairs.length > 0 ? (
                          <div className="flex flex-col gap-6">
                            {sessionChairs.map((chair) => (
                              <a key={chair.id} href={chair.url || '#'} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col md:flex-row md:items-center md:justify-between p-12 rounded-lg transition-all hover:shadow-md bg-white border border-gray-100 hover:border-[#D6B14D]/30 gap-4 md:gap-12">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-semibold text-gray-700">{chair.name}</p>
                                  {chair.name_ko && (
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-2">{chair.name_ko}</p>
                                  )}
                                  <span className="md:hidden block text-[10px] text-gray-400 font-medium mt-2">{chair.period || chair.since}</span>
                                </div>
                                <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">{chair.period || chair.since}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-xs text-gray-400">Coming soon...</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Journal Reviewer */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => toggleSection('journalReviewer')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm md:text-base font-bold text-gray-900">Journal Reviewer</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.journalReviewer ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.journalReviewer && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20">
                        <div className="flex flex-col gap-6">
                          {journals.map((journal) => (
                            <a key={journal.id} href={journal.url} target="_blank" rel="noopener noreferrer"
                              className="flex flex-col md:flex-row md:items-center md:justify-between p-12 rounded-lg transition-all hover:shadow-md bg-white border border-gray-100 hover:border-[#D6B14D]/30 gap-4 md:gap-8">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-semibold text-gray-700">{journal.name}</p>
                              </div>
                              <span className={`px-6 py-2 rounded text-[10px] md:text-xs font-bold self-start md:self-auto ${
                                journal.type === 'SCIE' || journal.type === 'SSCI' || journal.type === 'A&HCI' ? 'bg-[#D6B14D] text-white' :
                                journal.type === 'ESCI' || journal.type === 'SCOPUS' || journal.type === 'Scopus' ? 'bg-[#D6C360] text-white' :
                                journal.type === 'KCI' ? 'bg-[#64748b] text-white' :
                                'bg-[#94a3b8] text-white'
                              }`}>{journal.type}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conference Reviewer */}
                  <div className="bg-gray-50/50">
                    <button
                      onClick={() => toggleSection('conferenceReviewer')}
                      className="w-full flex items-center justify-between p-16 md:p-20 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm font-bold text-gray-900">Conference Reviewer</p>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${expandedSections.conferenceReviewer ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.conferenceReviewer && (
                      <div className="px-16 md:px-20 pb-16 md:pb-20">
                        <div className="flex flex-col gap-6">
                          {conferenceReviewers.map((conf) => (
                            <a key={conf.id} href={conf.url || '#'} target="_blank" rel="noopener noreferrer"
                              className="flex flex-col md:flex-row md:items-center md:justify-between p-12 rounded-lg transition-all hover:shadow-md bg-white border border-gray-100 hover:border-[#D6B14D]/30 gap-4 md:gap-8">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">{conf.name}</span>
                                <span className="md:hidden text-[10px] text-gray-400 font-medium mt-2">{conf.period || conf.since}</span>
                              </div>
                              <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">
                                {conf.period || conf.since}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>


            {/* Projects */}
            {projects.length > 0 && (
              <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('projects')}
                  className="w-full flex items-center justify-between p-20 md:p-24 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Projects</h3>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedSections.projects ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.projects && (
                <div className="p-20 md:p-24 border-t border-gray-100">
                {/* Search */}
                <div className="relative mb-16">
                  <Search size={16} className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className="w-full pl-36 pr-12 py-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Year-grouped projects */}
                <div className="space-y-12">
                  {projectYears.map(year => {
                    const yearProjects = projectsByYear[year]
                    const govCount = yearProjects.filter(p => p.type === 'government').length
                    const indCount = yearProjects.filter(p => p.type === 'industry').length
                    const instCount = yearProjects.filter(p => p.type === 'institution').length
                    const acadCount = yearProjects.filter(p => p.type === 'academic').length
                    const currentYear = new Date().getFullYear()
                    const isCurrentYear = Number(year) === currentYear
                    
                    return (
                    <div key={year} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleProjectYear(year)}
                        className={`w-full flex items-center justify-between p-16 transition-colors ${
                          isCurrentYear ? 'bg-[#FFF3CC] hover:bg-[#FFEB99]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-8 md:gap-12 flex-wrap">
                          <span className={`text-base md:text-lg font-bold ${isCurrentYear ? 'text-[#9A7D1F]' : 'text-gray-900'}`}>{year}</span>
                          {/* PC: Full name with Project/Projects */}
                          <span className="hidden sm:inline-flex px-10 md:px-12 py-4 md:py-5 bg-white rounded-full text-[10px] md:text-xs font-medium shadow-sm">
                            <span className="font-bold text-[#D6B14D]">{govCount}</span>
                            <span className="text-gray-500">&nbsp;Government {govCount === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#AC0E0E]">{indCount}</span>
                            <span className="text-gray-500">&nbsp;Industry {indCount === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#E8D688]">{instCount}</span>
                            <span className="text-gray-500">&nbsp;Institutional {instCount === 1 ? 'Project' : 'Projects'}</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#E8889C]">{acadCount}</span>
                            <span className="text-gray-500">&nbsp;Research {acadCount === 1 ? 'Project' : 'Projects'}</span>
                          </span>
                          {/* Mobile: 1-line abbreviations */}
                          <span className="sm:hidden inline-flex items-center px-8 py-4 bg-white rounded-lg text-[9px] font-medium shadow-sm">
                            <span className="font-bold text-[#D6B14D]">{govCount}</span>
                            <span className="text-gray-500">&nbsp;Gov.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#AC0E0E]">{indCount}</span>
                            <span className="text-gray-500">&nbsp;Ind.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#E8D688]">{instCount}</span>
                            <span className="text-gray-500">&nbsp;Inst.</span>
                            <span className="text-gray-300">&nbsp;·&nbsp;</span>
                            <span className="font-bold text-[#E8889C]">{acadCount}</span>
                            <span className="text-gray-500">&nbsp;Res.</span>
                          </span>
                        </div>
                        {expandedProjectYears.includes(year) ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </button>
                      {expandedProjectYears.includes(year) && (
                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                          {projectsByYear[year].map((project, index) => {
                            const typeIcons = {
                              government: Landmark,
                              industry: Building,
                              institution: School,
                              academic: Briefcase,
                            }
                            const typeLabels: Record<string, string> = {
                              government: 'Government',
                              industry: 'Industry',
                              institution: 'Institutional',
                              academic: 'Research',
                            }
                            const typeBorderColors: Record<string, string> = {
                              government: 'border-[#D6B14D]',
                              industry: 'border-[#AC0E0E]',
                              institution: 'border-[#E8D688]',
                              academic: 'border-[#E8889C]',
                            }
                            const typeTextColors: Record<string, string> = {
                              government: 'text-[#9A7D1F]',
                              industry: 'text-[#AC0E0E]',
                              institution: 'text-[#B8962D]',
                              academic: 'text-[#E8889C]',
                            }
                            const typeBgColors: Record<string, string> = {
                              government: 'bg-[#D6B14D]',
                              industry: 'bg-[#AC0E0E]',
                              institution: 'bg-[#E8D688]',
                              academic: 'bg-[#E8889C]',
                            }
                            const Icon = typeIcons[project.type]
                            // Determine status
                            const endDateStr = project.period.split('–')[1]?.trim()
                            const endDate = endDateStr
                            const isOngoing = endDateStr === 'Present' || endDateStr === '현재' || (endDateStr ? new Date(endDateStr) >= new Date() : false)
                            // Determine director's role
                            const getDirectorRole = () => {
                              if (project.roles.principalInvestigator === '최인수') return 'Principal Investigator'
                              if (project.roles.leadResearcher === '최인수') return 'Lead Researcher'
                              if (project.roles.visitingResearcher === '최인수') return 'Visiting Researcher'
                              if (project.roles.researchers?.includes('최인수')) return 'Researcher'
                              return 'Researcher'
                            }
                            const roleColor: Record<string, string> = {
                              'Principal Investigator': 'bg-gray-900 text-white',
                              'Lead Researcher': 'bg-gray-600 text-white',
                              'Researcher': 'bg-gray-400 text-white'
                            }
                            const directorRole = getDirectorRole()
                            return (
                              <div key={index} className="hover:bg-gray-50/50 transition-all relative overflow-hidden">
                                {/* Mobile: Full-width top bar - solid color with Type | Role format */}
                                <div className="md:hidden flex items-center justify-between px-12 py-8 border-b border-gray-50" style={{
                                  background: project.type === 'government' ? '#D6B14D' :
                                    project.type === 'industry' ? '#AC0E0E' :
                                    project.type === 'institution' ? '#E8D688' :
                                    project.type === 'academic' ? '#E8889C' :
                                    '#6B7280'
                                }}>
                                  <div className="flex items-center gap-8">
                                    {/* Type | Role Label */}
                                    <span className={`text-[9px] font-bold tracking-wide ${
                                      project.type === 'institution' ? 'text-white' : 'text-white'
                                    }`}>
                                      {typeLabels[project.type]} Project
                                    </span>
                                    <span className={`w-px h-12 ${project.type === 'institution' ? 'bg-white/50' : 'bg-white/50'}`} />
                                    <span className={`text-[9px] font-bold tracking-wide ${
                                      project.type === 'institution' ? 'text-white' : 'text-white'
                                    }`}>
                                      {directorRole}
                                    </span>
                                  </div>
                                  {/* Right side: Status badge */}
                                  <span className={`px-8 py-3 rounded text-[9px] font-bold ${
                                    isOngoing ? 'bg-white/90 text-[#D6B14D]' : 'bg-white/70 text-gray-500'
                                  }`}>
                                    {isOngoing ? 'Ongoing' : 'Completed'}
                                  </span>
                                </div>
                                
                                <div className="p-12 md:p-16">
                                <div className="flex items-start gap-10 md:gap-14">
                                  {/* Left badge - Type + Status - Desktop only */}
                                  <div className="hidden md:flex flex-col items-center shrink-0 w-60">
                                    <div className={`w-full py-5 rounded-lg text-center ${typeBgColors[project.type]} shadow-sm`}>
                                      <Icon size={12} className="inline mb-1 text-white" />
                                      <span className="block text-[9px] font-bold tracking-wide text-white">
                                        {typeLabels[project.type]}
                                      </span>
                                    </div>
                                    <div className={`w-full mt-3 py-3 text-center rounded-md ${
                                      isOngoing ? 'bg-[#FFF9E6] border border-[#FFEB99]' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                      <span className={`text-[9px] font-bold ${
                                        isOngoing ? 'text-[#D6B14D]' : 'text-gray-400'
                                      }`}>
                                        {isOngoing ? 'Ongoing' : 'Completed'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    {/* Role badge - Desktop only (mobile shows in top banner) */}
                                    <span className={`hidden md:inline-flex px-6 py-2 text-[9px] font-bold rounded-full mb-6 ${roleColor[directorRole] || 'bg-gray-500 text-white'}`}>
                                      {directorRole}
                                    </span>
                                    
                                    {/* Title + Period (Desktop: Period on right) */}
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-16">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm md:text-base font-bold text-gray-900 whitespace-pre-line">{project.titleKo}</p>
                                        <p className="text-xs md:text-sm text-gray-600 mt-3 whitespace-pre-line">{project.titleEn}</p>
                                        <p className="text-xs md:text-sm text-gray-500 mt-3 whitespace-pre-line"><span className="font-bold">{project.language === 'ko' && project.fundingAgencyKo ? project.fundingAgencyKo : project.fundingAgency}</span></p>
                                        {/* Mobile: Period as text */}
                                        <p className="md:hidden text-[10px] text-gray-400 font-medium mt-4">{project.period}</p>
                                      </div>
                                      {/* PC: Period badge - right aligned */}
                                      <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 shadow-sm shrink-0 whitespace-nowrap">
                                        {project.period}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                </div>
                              </div>
                            )
                          })}
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

                {/* Search */}
                <div className="relative mb-16">
                  <Search size={16} className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={teachingSearchTerm}
                    onChange={(e) => setTeachingSearchTerm(e.target.value)}
                    className="w-full pl-36 pr-12 py-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Lecturer Section */}
                {lecturerCourses.length > 0 && (
                  <div className="mb-24 border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('lecturer')}
                      className="w-full flex items-center justify-between px-16 py-12 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm font-bold text-gray-900">Lecturer</p>
                        <span className="px-8 py-2 bg-[#D6B14D] text-gray-900 text-[10px] font-bold rounded-full">{lecturerSemesters}</span>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${expandedSections.lecturer ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.lecturer && (
                    <div className="space-y-12 p-16">
                      {lecturerCourses.map((course, index) => {
                        // Get school logo
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
                              if (school.includes('Korea University') || school === 'Korea University') return '고려대학교'
                              return school
                            }
                            const schoolLogo = getSchoolLogo(course.school)
                        
                        return (
                        <div key={index} className="bg-white border border-gray-100 rounded-xl p-16 md:p-20 hover:shadow-md hover:border-[#D6B14D]/30 transition-all">
                          <div className="flex items-start gap-12 md:gap-16">
                            <div className="size-36 md:size-40 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#D6B14D]/30 bg-white overflow-hidden">
                              {schoolLogo ? (
                                <img loading="lazy" decoding="async" src={schoolLogo} alt={course.school} className="w-[70%] h-[70%] object-contain" />
                              ) : (
                                <BookOpen size={18} style={{color: '#D6B14D'}} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-6 mb-8">
                                {course.periods.map((period, i) => (
                                  <span key={i} className="px-8 py-2 bg-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-full">
                                    {period}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs md:text-sm font-semibold text-gray-700">{course.courseNameKo || course.courseName}</p>
                              {course.courseNameKo && course.courseName !== course.courseNameKo && (
                                <p className="text-[10px] md:text-xs text-gray-500 mt-2">{course.courseName}</p>
                              )}
                              <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-4">{getSchoolKo(course.school)}</p>
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                    )}
                  </div>
                )}

                {/* Teaching Assistant Section */}
                {taCourses.length > 0 && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('teachingAssistant')}
                      className="w-full flex items-center justify-between px-16 py-12 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-8">
                        <p className="text-sm font-bold text-gray-900">Teaching Assistant</p>
                        <span className="px-8 py-2 text-white text-[10px] font-bold rounded-full" style={{backgroundColor: '#E8889C'}}>{taSemesters}</span>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${expandedSections.teachingAssistant ? 'rotate-180' : ''}`}/>
                    </button>
                    {expandedSections.teachingAssistant && (
                    <div className="space-y-12 p-16">
                      {taCourses.map((course, index) => {
                        // Get school logo
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
                              if (school.includes('Korea University') || school === 'Korea University') return '고려대학교'
                              return school
                            }
                            const schoolLogo = getSchoolLogo(course.school)
                        
                        return (
                        <div key={index} className="bg-white border border-gray-100 rounded-xl p-16 md:p-20 hover:shadow-md hover:shadow-[#E8889C]/10 hover:border-[#E8889C]/30 transition-all">
                          <div className="flex items-start gap-12 md:gap-16">
                            <div className="size-36 md:size-40 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#E8889C]/30 bg-white overflow-hidden">
                              {schoolLogo ? (
                                <img loading="lazy" decoding="async" src={schoolLogo} alt={course.school} className="w-[70%] h-[70%] object-contain" />
                              ) : (
                                <BookOpen size={18} style={{color: '#E8889C'}} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-6 mb-8">
                                {course.periods.map((period, i) => (
                                  <span key={i} className="px-8 py-2 text-[10px] md:text-xs font-bold rounded-full" style={{backgroundColor: 'rgba(232,135,155,0.15)', color: '#E8889C'}}>
                                    {period}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs md:text-sm font-semibold text-gray-700">
                                {(course.courseNameKo || course.courseName).split('<').map((part, i) => (
                                  i === 0 ? part : <span key={i} className="inline-block">&lt;{part}</span>
                                ))}
                              </p>
                              {course.courseNameKo && course.courseName !== course.courseNameKo && (
                                <p className="text-[10px] md:text-xs text-gray-500 mt-2">{course.courseName}</p>
                              )}
                              <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-4">{getSchoolKo(course.school)}</p>
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                    )}
                  </div>
                )}
                </div>
                )}
              </section>
            )}
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
              className="flex items-center gap-8 px-14 py-10 rounded-full text-xs font-bold shadow-lg border border-primary/20 whitespace-nowrap bg-primary text-white"
            >
              <BookOpen size={13} />
              Academics
            </Link>
            <Link
              to="/members/director/activities"
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

export default memo(MembersDirectorAcademicTemplate)
