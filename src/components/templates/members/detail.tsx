import {memo, useState, useEffect, useRef} from 'react'
import {Link} from 'react-router-dom'
import {
  Mail,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Home,
  ArrowLeft,
  Calendar,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import type {MemberData} from '@/types/data'

// Image Imports
import banner2 from '@/assets/images/banner/2.webp'

// Email Popup Component
const EmailPopup = ({ email, onClose, degree }: { email: string; onClose: () => void; degree?: string }) => {
  const [copied, setCopied] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendButtonColor = degree === 'undergrad' 
    ? 'bg-[#FFBAC4] hover:bg-[#FFBAC4]/90' 
    : degree === 'phd' || degree === 'phd-candidate' || degree === 'phd-student'
    ? 'bg-[#D6B14D] hover:bg-[#D6B14D]/90' 
    : degree === 'ms'
    ? 'bg-[#C41E3A] hover:bg-[#C41E3A]/90'
    : degree === 'combined'
    ? 'bg-[#D6A076] hover:bg-[#D6A076]/90'
    : 'bg-gray-500 hover:bg-gray-500/90'

  return (
    <div
      ref={popupRef}
      className="absolute top-full left-0 mt-8 bg-white border border-gray-200 rounded-xl shadow-lg p-12 z-50 min-w-220"
    >
      <p className="text-xs text-gray-500 mb-8">Email Address</p>
      <p className="text-sm font-medium text-gray-900 mb-12 break-all">{email}</p>
      <div className="flex gap-8">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-6 px-10 py-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={`mailto:${email}`}
          className={`flex-1 flex items-center justify-center gap-6 px-10 py-6 ${sendButtonColor} rounded-lg text-xs font-medium text-white transition-colors`}
        >
          <ExternalLink size={12} />
          Send
        </a>
      </div>
    </div>
  )
}

interface Props {
  memberId: string
}

export const MembersDetailTemplate = ({memberId}: Props) => {
  const [member, setMember] = useState<MemberData | null>(null)
  const [alumniProjects, setAlumniProjects] = useState<(string | { ko: string; en: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const baseUrl = import.meta.env.BASE_URL || '/'

  useEffect(() => {
    if (!memberId) return

    const safeJsonFetch = async (url: string) => {
      const response = await fetch(url)
      const text = await response.text()
      const cleaned = text.replace(/,(\s*[\}\]])/g, '$1')
      return JSON.parse(cleaned)
    }

    // Load member data
    safeJsonFetch(`${baseUrl}data/members/${memberId}.json`)
      .then((data: MemberData) => {
        setMember(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load member detail:', err)
        setLoading(false)
      })

    // Load alumni.json to get projects
    safeJsonFetch(`${baseUrl}data/alumni.json`)
      .then((alumniData: { members: Array<{ name: string; nameEn: string; projects?: string[] }> }) => {
        // Find matching alumni by name
        const matchingAlumni = alumniData.members.find(a => 
          memberId.toLowerCase().includes(a.nameEn?.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) || '')
        )
        if (matchingAlumni?.projects) {
          setAlumniProjects(matchingAlumni.projects)
        }
      })
      .catch(() => {
        // Silently fail - alumni data is optional
      })
  }, [memberId, baseUrl])

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="relative w-full h-200 md:h-332 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: `url(${banner2})`}}
          />
          <div className="absolute inset-0 bg-black/40"/>
          <div className="absolute inset-0" style={{backgroundColor: 'rgba(214, 177, 77, 0.08)'}} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading member profile...</div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <div className="relative w-full h-200 md:h-332 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: `url(${banner2})`}}
          />
          <div className="absolute inset-0 bg-black/40"/>
          <div className="absolute inset-0" style={{backgroundColor: 'rgba(214, 177, 77, 0.08)'}} />
          <div className="relative h-full flex items-center justify-center">
            <h1 className="text-2xl md:text-[36px] font-semibold text-white text-center">
              Member Profile
            </h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-80">
          <div className="text-gray-500 text-lg font-medium mb-16">Member not found</div>
          <Link
            to="/members/current"
            className="flex items-center gap-8 text-primary hover:underline"
          >
            <ArrowLeft size={16}/>
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

  const degreeColors: Record<string, string> = {
    phd: 'bg-[#D6B14D] text-white',
    'phd-candidate': 'bg-[#D6B14D] text-white',
    'phd-student': 'bg-[#D6B14D] text-white',
    combined: 'bg-[#D6A076] text-white',
    ms: 'bg-[#C41E3A] text-white',
    undergrad: 'bg-[#FFBAC4] text-white',
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <div className="relative w-full h-200 md:h-332 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: `url(${banner2})`}}
        />
        <div className="absolute inset-0 bg-black/40"/>
          <div className="absolute inset-0" style={{backgroundColor: 'rgba(214, 177, 77, 0.08)'}} />
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-2xl md:text-[36px] font-semibold text-white text-center">
            {member.name.en}
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-1480 mx-auto w-full px-16 md:px-20 py-20 md:py-40">
        <div className="flex items-center gap-8 md:gap-10 flex-wrap">
          <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
            <Home size={16}/>
          </Link>
          <span className="text-[#cdcdcd]">›</span>
          <Link to="/members/current" className="text-sm md:text-base text-gray-400 hover:text-primary transition-colors">
            Members
          </Link>
          <span className="text-[#cdcdcd]">›</span>
          <span className="text-sm md:text-base text-primary font-medium">{member.name.ko}</span>
        </div>
        {/* Mobile Back Button - Top */}
        <Link
          to="/members/current"
          className="lg:hidden flex items-center gap-8 mt-16 py-10 px-16 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors w-fit"
        >
          <ArrowLeft size={16}/>
          Back to Members
        </Link>
      </div>

      {/* Content */}
      <section className="max-w-1480 mx-auto w-full px-16 md:px-20 pb-60 md:pb-100">
        <div className="flex flex-col lg:flex-row gap-32 md:gap-60">
          {/* Left Sidebar - Profile Card */}
          <div className="w-full lg:w-320 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-24 md:p-32 sticky top-100">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-24">
                <div 
                  className="w-[140px] h-[180px] md:w-[154px] md:h-[198px] bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-20 border-4 border-gray-50 shadow-lg relative select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar.replace('/assets/img/', `${baseUrl}images/`).replace('/website/', `${baseUrl}`)}
                      alt={member.name.ko}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  ) : (
                    <span className="text-[60px] md:text-[80px]">👤</span>
                  )}
                  {/* Transparent overlay to prevent image interaction */}
                  {member.avatar && <div className="absolute inset-0" />}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{member.name.ko}</h2>
                <p className="text-sm md:text-base text-gray-500 mb-12">{member.name.en}</p>
                <span className={`inline-flex px-12 py-4 text-xs font-semibold rounded-full mb-8 ${degreeColors[member.degree] || 'bg-gray-100 text-gray-700'}`}>
                  {member.role.en}
                </span>
                {/* Period - plain text on mobile, badge on desktop */}
                <div className="md:hidden flex items-center gap-8 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400"/>
                  <span>{member.period.start} – {member.period.expected_graduation || 'Present'}</span>
                </div>
                <span className="hidden md:inline-flex items-center px-10 py-4 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap">
                  {member.period.start} – {member.period.expected_graduation || 'Present'}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-20"/>

              {/* Contact */}
              <div className="flex flex-col gap-12">
                {member.contact.email && (
                  <div className="relative">
                    <button
                      onClick={() => setShowEmailPopup(!showEmailPopup)}
                      className="flex items-center justify-center gap-8 px-16 py-10 rounded-xl text-sm font-medium transition-colors w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Mail size={16} />
                      <span>Email</span>
                    </button>
                    {showEmailPopup && (
                      <EmailPopup
                        email={member.contact.email}
                        onClose={() => setShowEmailPopup(false)}
                        degree={member.degree}
                      />
                    )}
                  </div>
                )}
                {member.social?.personal_website && (
                  <a
                    href={member.social.personal_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-10 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <Globe size={16} className="text-gray-400 shrink-0"/>
                    <span>Personal Website</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-12 mt-20 pt-20 border-t border-gray-100">
                {member.social?.github && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-36 h-36 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-primary hover:text-white transition-all"
                  >
                    <Github size={18}/>
                  </a>
                )}
                {member.social?.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-36 h-36 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-primary hover:text-white transition-all"
                  >
                    <Linkedin size={18}/>
                  </a>
                )}
                {member.social?.google_scholar && (
                  <a
                    href={member.social.google_scholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-36 h-36 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-primary hover:text-white transition-all"
                    title="Google Scholar"
                  >
                    <GraduationCap size={18}/>
                  </a>
                )}
              </div>

              {/* Back Button - PC only */}
              <Link
                to="/members/current"
                className="hidden lg:flex items-center justify-center gap-8 w-full mt-24 py-12 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={16}/>
                Back to Members
              </Link>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col gap-40 md:gap-60">
            {/* Research Interests */}
            <section>
              <div className="flex items-center gap-12 mb-20 md:mb-24">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Research Interests</h3>
              </div>
              <div className="flex flex-wrap gap-10">
                {member.research.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-16 py-10 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 font-medium hover:border-[#D6B14D]/30 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center gap-12 mb-20 md:mb-24">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Education</h3>
              </div>
              <div className="flex flex-col gap-16">
                {member.education.map((edu, idx) => (
                  <div key={idx} className="p-16 md:p-20 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-base font-bold text-gray-900">
                        {edu.school_en || edu.school}
                      </h4>
                      <p className="text-sm font-semibold text-gray-500">{edu.field_en || edu.field}</p>
                      <span className="text-xs font-medium mt-4 text-gray-500">
                        {edu.start} - {edu.end || edu.expected || 'Present'}
                      </span>
                      {(edu.doubleMajor || edu.minor) && (
                        <div className="flex flex-col gap-6 mt-8 pl-2 border-l-2 border-gray-200">
                          {edu.doubleMajor && (
                            <p className="text-sm font-medium text-gray-600 pl-10">
                              Double Major in <span className="font-semibold text-gray-700">{edu.doubleMajor}</span>
                            </p>
                          )}
                          {edu.minor && (
                            <p className="text-[13px] font-normal text-gray-400 pl-10">
                              Minor in {edu.minor}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects - 단일 project 또는 여러 projects 모두 지원 */}
            {(member.research.project || member.research.projects?.length || alumniProjects.length > 0) && (
              <section>
                <div className="flex items-center gap-12 mb-20 md:mb-24">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {(member.research.projects?.length || 0) + alumniProjects.length > 1 ? 'Projects' : 'Current Project'}
                  </h3>
                </div>
                <div className="flex flex-col gap-12">
                  {/* 단일 project 객체 */}
                  {member.research.project && (
                    <div className="p-20 md:p-24 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-base font-semibold text-gray-800 mb-4">{member.research.project.en}</p>
                      {member.research.project.ko && (
                        <p className="text-sm text-gray-400">{member.research.project.ko}</p>
                      )}
                    </div>
                  )}
                  {/* projects 배열 */}
                  {member.research.projects?.map((proj, idx) => (
                    <div key={idx} className="p-20 md:p-24 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-base font-semibold text-gray-800 mb-4">{proj.en}</p>
                      {proj.ko && (
                        <p className="text-sm text-gray-400">{proj.ko}</p>
                      )}
                    </div>
                  ))}
                  {/* alumni.json에서 가져온 projects (member JSON에 없는 경우에만) */}
                  {!member.research.project && !member.research.projects?.length && alumniProjects.map((proj, idx) => {
                    const isObject = typeof proj === 'object'
                    return (
                      <div key={idx} className="p-20 md:p-24 bg-gray-50 border border-gray-100 rounded-xl">
                        {isObject ? (
                          <>
                            <p className="text-base font-semibold text-gray-800 mb-4">{proj.en}</p>
                            <p className="text-sm text-gray-400">{proj.ko}</p>
                          </>
                        ) : (
                          <p className="text-base font-semibold text-gray-800">{proj}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(MembersDetailTemplate)
