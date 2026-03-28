import "../../assets/css/common.css";
import "../../assets/css/theme.css";
import "../../assets/css/font.css";

import {Route, Routes, useLocation, Navigate, Link} from "react-router-dom";
import {lazy, Suspense, useEffect, memo, useRef, useState} from "react";
import { Music, Play, Pause, X, Home as HomeIcon, SkipBack, SkipForward, Minimize2, Maximize2, ListMusic } from 'lucide-react'
import { useMusicPlayerStore } from '@/store/musicPlayer'

const Home = lazy(() => import('../home').then((module) => ({ default: module.Home })));
const Publications = lazy(() => import('../publications').then((module) => ({ default: module.Publications })));
const Projects = lazy(() => import('../projects').then((module) => ({ default: module.Projects })));
const AboutIntroduction = lazy(() => import('../about/introduction').then((module) => ({ default: module.AboutIntroduction })));
const AboutResearch = lazy(() => import('../about/research').then((module) => ({ default: module.AboutResearch })));
const AboutHonors = lazy(() => import('../about/honors').then((module) => ({ default: module.AboutHonors })));
const AboutLocation = lazy(() => import('../about/location').then((module) => ({ default: module.AboutLocation })));
const MembersDirector = lazy(() => import('../members/director').then((module) => ({ default: module.MembersDirector })));
const MembersDirectorPortfolio = lazy(() => import('../members/director-portfolio').then((module) => ({ default: module.MembersDirectorPortfolio })));
const MembersDirectorPortfolioAcademic = lazy(() => import('../members/director-portfolio-academic').then((module) => ({ default: module.MembersDirectorPortfolioAcademic })));
const MembersDirectorPortfolioActivities = lazy(() => import('../members/director-portfolio-activities').then((module) => ({ default: module.MembersDirectorPortfolioActivities })));
const MembersDirectorActivities = lazy(() => import('../members/director-activities').then((module) => ({ default: module.default })));
const MembersDirectorAcademic = lazy(() => import('../members/director-academic').then((module) => ({ default: module.MembersDirectorAcademic })));
const MembersCurrent = lazy(() => import('../members/current').then((module) => ({ default: module.MembersCurrent })));
const MembersAlumni = lazy(() => import('../members/alumni').then((module) => ({ default: module.MembersAlumni })));
const MembersDetail = lazy(() => import('../members/detail').then((module) => ({ default: module.MembersDetail })));
const ArchivesNews = lazy(() => import('../archives/news').then((module) => ({ default: module.ArchivesNews })));
const ArchivesNotice = lazy(() => import('../archives/notice').then((module) => ({ default: module.ArchivesNotice })));
const ArchivesGallery = lazy(() => import('../archives/gallery').then((module) => ({ default: module.ArchivesGallery })));
const ArchivesPlaylist = lazy(() => import('../archives/playlist').then((module) => ({ default: module.ArchivesPlaylist })));

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: {
        videoId: string;
        playerVars?: Record<string, number | string>;
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number; target: YTPlayer }) => void;
        };
      }) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
}

const GlobalMusicPlayer = memo(() => {
  const { 
    playlist, currentIndex, isPlaying, isMinimized, isLoaded,
    setPlaylist, setIsLoaded, setCurrentIndex, nextTrack, prevTrack, togglePlay, toggleMinimize, setIsPlaying
  } = useMusicPlayerStore()
  
  const playerRef = useRef<YTPlayer | null>(null)
  const [trackInfo, setTrackInfo] = useState<{ artist: string; title: string }[]>([])
  const [playerReady, setPlayerReady] = useState(false)
  const lastVideoIdRef = useRef<string | null>(null)
  const shouldAutoPlayRef = useRef(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const queueRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Helper functions for prev/next with auto-play
  const handlePrevTrack = () => {
    shouldAutoPlayRef.current = true
    prevTrack()
    setIsPlaying(true)
  }

  const handleNextTrack = () => {
    shouldAutoPlayRef.current = true
    nextTrack()
    setIsPlaying(true)
  }

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      const baseUrl = import.meta.env.BASE_URL || '/'
      fetch(`${baseUrl}data/playlist/ischoi.json`)
        .then(res => res.json())
        .then(data => {
          const items = data.items.map((item: { url: string; artist?: string; title?: string }) => {
            // youtu.be/VIDEO_ID 또는 youtube.com/watch?v=VIDEO_ID 형식 모두 지원
            let videoId = null
            if (item.url.includes('youtu.be/')) {
              videoId = item.url.split('youtu.be/')[1]?.split('?')[0] || null
            } else {
              const match = item.url.match(/[?&]v=([^&]+)/)
              videoId = match ? match[1] : null
            }
            return { videoId, artist: item.artist || 'Unknown Artist', title: item.title || 'Unknown Title' }
          }).filter((item: { videoId: string | null }) => item.videoId)
          
          if (data.shuffle && items.length > 1) {
            const first = items[0]
            const rest = items.slice(1)
            for (let i = rest.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [rest[i], rest[j]] = [rest[j], rest[i]]
            }
            items.splice(0, items.length, first, ...rest)
          }
          
          setTrackInfo(items.map((item: { artist: string; title: string }) => ({ artist: item.artist, title: item.title })))
          setPlaylist(items.map((item: { videoId: string }) => item.videoId))
          setIsLoaded(true)
        })
        .catch(err => console.error('Failed to load playlist:', err))
    }
  }, [isLoaded, setPlaylist, setIsLoaded])

  const currentVideoId = playlist[currentIndex]
  const currentTrack = trackInfo[currentIndex]
  const isPlaylistPage = location.pathname === '/archives/playlist'
  const isPortfolioPage = location.pathname.startsWith('/members/director/portfolio')
  const showFullPlayer = devMode && !isMinimized && !isCompact && !isHidden && playlist.length > 0 && !isPlaylistPage && isPortfolioPage

  // Initialize YouTube Player ONCE
  useEffect(() => {
    if (!currentVideoId || playerRef.current) return

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 100)
        return
      }

      playerRef.current = new window.YT.Player('yt-player', {
        videoId: currentVideoId,
        playerVars: { autoplay: isPlaying ? 1 : 0, controls: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => { setPlayerReady(true); lastVideoIdRef.current = currentVideoId },
          onStateChange: (event) => { 
            // 1 = playing, 2 = paused, 0 = ended
            if (event.data === 1) {
              setIsPlaying(true)
            } else if (event.data === 2) {
              setIsPlaying(false)
            } else if (event.data === 0) {
              // Track ended - auto-play next
              shouldAutoPlayRef.current = true
              nextTrack()
              setIsPlaying(true)
            }
          },
        },
      })
    }

    initPlayer()
  }, [currentVideoId])

  // Handle track changes - auto-play when using prev/next buttons
  useEffect(() => {
    if (!playerRef.current || !playerReady || !currentVideoId) return
    if (lastVideoIdRef.current === currentVideoId) return
    
    lastVideoIdRef.current = currentVideoId
    const shouldAutoPlay = shouldAutoPlayRef.current || isPlaying
    
    // Always load the video
    playerRef.current.loadVideoById(currentVideoId)
    
    // Auto-play after short delay if requested
    if (shouldAutoPlay) {
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.playVideo()
          setIsPlaying(true)
        }
        shouldAutoPlayRef.current = false
      }, 100)
    } else {
      shouldAutoPlayRef.current = false
    }
  }, [currentVideoId, playerReady, isPlaying, setIsPlaying])

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current || !playerReady) return
    if (isPlaying) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
  }, [isPlaying, playerReady])

  // Portfolio 페이지를 벗어나면 플레이어 정지
  useEffect(() => {
    if (!isPortfolioPage && isPlaying && playerRef.current) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
    }
  }, [isPortfolioPage, isPlaying, setIsPlaying])

  // Ctrl+J+L secret combo to toggle playlist
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase())
      if (keysPressed.current.has('j') && keysPressed.current.has('l')) {
        e.preventDefault()
        setDevMode(prev => !prev)
        setIsHidden(false)
      }
    }
    const onUp = (e: KeyboardEvent) => { keysPressed.current.delete(e.key.toLowerCase()) }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  const handleHidePlayer = () => {
    if (playerRef.current) playerRef.current.pauseVideo()
    setIsPlaying(false)
    setIsHidden(true)
  }

  const handlePlayFromQueue = (index: number) => {
    shouldAutoPlayRef.current = true
    setCurrentIndex(index)
    setIsPlaying(true)
    setShowQueue(false)
  }

  // Close queue on click outside
  useEffect(() => {
    if (!showQueue) return
    const handler = (e: MouseEvent) => {
      if (queueRef.current && !queueRef.current.contains(e.target as Node)) setShowQueue(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showQueue])

  // Auto-scroll to current track in queue
  useEffect(() => {
    if (showQueue && queueRef.current) {
      const activeItem = queueRef.current.querySelector('[data-active="true"]')
      if (activeItem) activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [showQueue, currentIndex])

  // 플레이어 안 보여줄 조건 - portfolio 페이지에서만 표시
  const hidePlayer = !devMode || isHidden || playlist.length === 0 || isPlaylistPage || !isPortfolioPage

  return (
    <>
      {/* Main UI - Hidden on mobile */}
      <div className="fixed bottom-20 right-20 z-[9999] hidden md:flex flex-col items-end gap-12">
        {location.pathname !== '/' && (
          <Link to="/" className="flex items-center justify-center w-32 h-32 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 hover:scale-105 transition-all duration-200" title="홈으로">
            <HomeIcon className="w-16 h-16" />
          </Link>
        )}
        
        {/* Minimized Button */}
        {!hidePlayer && isMinimized && (
          <div className="flex items-center gap-8">
            <button onClick={handleHidePlayer} className="flex items-center justify-center w-36 h-36 bg-gray-800 text-gray-400 rounded-full shadow-lg hover:bg-gray-700 hover:text-white transition-all duration-200 border border-gray-700/50" title="플레이리스트 숨기기">
              <X className="w-16 h-16" />
            </button>
            <button onClick={() => toggleMinimize()} className="group flex items-center gap-14 px-28 py-18 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(214,177,77,0.25)] transition-all duration-300 border border-gray-700/50 hover:scale-105">
              <div className="relative flex items-center justify-center w-52 h-52 rounded-full" style={{backgroundColor: 'rgba(214,177,77,0.12)', border: '2px solid rgba(214,177,77,0.25)'}}>
                <Music className="w-22 h-22" style={{color: 'rgb(214,177,77)'}} />
                {isPlaying && <span className="absolute -top-2 -right-2 w-14 h-14 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50 border-2 border-gray-900" />}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-wide" style={{color: 'rgb(214,177,77)'}}>FINDS</span>
                <span className="text-sm font-medium text-gray-400">Playlist</span>
              </div>
            </button>
          </div>
        )}
        
        {/* Compact UI */}
        {!hidePlayer && !isMinimized && isCompact && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-full shadow-2xl overflow-hidden border border-gray-700/50 flex items-center gap-6 pl-12 pr-8 py-8 w-[280px]">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Music size={16} style={{color: 'rgb(214,177,77)'}} />
                {isPlaying && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-[10px] font-semibold truncate" style={{color: 'rgb(214,177,77)'}}>{currentTrack?.artist}</p>
                <div className="overflow-hidden">
                  <p className={`text-xs text-white font-medium ${(currentTrack?.title?.length || 0) > 40 ? 'whitespace-nowrap animate-marquee' : 'truncate'}`}>
                    {currentTrack?.title}{(currentTrack?.title?.length || 0) > 40 ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${currentTrack?.title}` : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button onClick={handlePrevTrack} className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors"><SkipBack size={10} className="text-gray-400" /></button>
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                {isPlaying ? <Pause size={12} className="text-primary" /> : <Play size={12} className="text-primary ml-0.5" />}
              </button>
              <button onClick={handleNextTrack} className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors"><SkipForward size={10} className="text-gray-400" /></button>
              <button onClick={() => setIsCompact(false)} className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors" title="확장"><Maximize2 size={10} className="text-gray-400" /></button>
              <button onClick={toggleMinimize} className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors" title="닫기"><X size={10} className="text-gray-400" /></button>
            </div>
          </div>
        )}
        
        {/* Full Player - 항상 렌더링, CSS로만 표시/숨김 (DOM 이동 없음) */}
        <div 
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden w-[340px] border border-gray-800/50"
          style={{
            opacity: showFullPlayer ? 1 : 0,
            pointerEvents: showFullPlayer ? 'auto' : 'none',
            position: showFullPlayer ? 'relative' : 'absolute',
            left: showFullPlayer ? 'auto' : '-9999px',
            top: showFullPlayer ? 'auto' : '-9999px',
          }}
        >
          <div className="flex items-center justify-between px-20 py-16 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b border-gray-800/50">
            <div className="flex items-center gap-14">
              <div className="w-44 h-44 rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0" style={{background: 'linear-gradient(135deg, rgb(214,177,77) 0%, rgb(184,150,45) 100%)'}}>
                <Music className="w-20 h-20 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wider">FINDS</span>
                <span className="text-sm font-medium" style={{color: 'rgb(214,177,77)'}}>Playlist</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setShowQueue(!showQueue)} className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors border ${showQueue ? 'bg-[#D6B14D]/20 border-[#D6B14D]/50 text-[#D6B14D]' : 'bg-gray-800/80 border-gray-700/50 text-gray-400 hover:bg-gray-700'}`} title="재생목록"><ListMusic className="w-12 h-12" /></button>
              <button onClick={() => { setIsCompact(true); setShowQueue(false) }} className="w-28 h-28 rounded-full bg-gray-800/80 flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700/50" title="컴팩트"><Minimize2 className="w-12 h-12 text-gray-400" /></button>
              <button onClick={() => { toggleMinimize(); setShowQueue(false) }} className="w-28 h-28 rounded-full bg-gray-800/80 flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700/50" title="접기"><X className="w-12 h-12 text-gray-400" /></button>
            </div>
          </div>

          {/* Queue Panel */}
          {showQueue && (
            <div ref={queueRef} className="border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-sm">
              <div className="flex items-center justify-between px-20 py-12 border-b border-gray-800/30">
                <div className="flex items-center gap-10">
                  <span className="text-[11px] font-semibold tracking-wider" style={{color: '#D6B14D'}}>Queue</span>
                  <span className="px-8 py-2 rounded-full text-[10px] font-bold tabular-nums" style={{backgroundColor: 'rgba(214,177,77,0.12)', color: '#D6B14D'}}>{playlist.length}</span>
                </div>
                <button onClick={() => setShowQueue(false)} className="text-gray-600 hover:text-gray-400 transition-colors p-4"><X className="w-10 h-10" /></button>
              </div>
              <div className="max-h-[240px] overflow-y-auto overscroll-contain" style={{scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent'}}>
                {trackInfo.map((track, index) => {
                  const isCurrent = index === currentIndex
                  const isUpcoming = index > currentIndex
                  return (
                    <button
                      key={index}
                      onClick={() => handlePlayFromQueue(index)}
                      data-active={isCurrent ? 'true' : undefined}
                      className={`w-full flex items-center gap-12 px-20 py-10 text-left transition-all duration-150 group ${
                        isCurrent
                          ? 'bg-[#D6B14D]/10'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Track number / playing indicator */}
                      <div className="w-24 flex items-center justify-center shrink-0">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-center gap-[2px]">
                            <div className="w-[2px] h-8 rounded-full animate-pulse" style={{backgroundColor: '#D6B14D', animationDelay: '0ms'}} />
                            <div className="w-[2px] h-12 rounded-full animate-pulse" style={{backgroundColor: '#D6B14D', animationDelay: '150ms'}} />
                            <div className="w-[2px] h-6 rounded-full animate-pulse" style={{backgroundColor: '#D6B14D', animationDelay: '300ms'}} />
                          </div>
                        ) : isCurrent ? (
                          <Pause className="w-10 h-10" style={{color: '#D6B14D'}} />
                        ) : (
                          <>
                            <span className="text-[11px] text-gray-600 font-medium group-hover:hidden">{index + 1}</span>
                            <Play className="w-10 h-10 text-gray-500 hidden group-hover:block" />
                          </>
                        )}
                      </div>
                      {/* Artist + Title */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold truncate ${isCurrent ? 'text-white' : isUpcoming ? 'text-gray-300' : 'text-gray-500'}`}>
                          {track.title}
                        </p>
                        <p className={`text-[10px] truncate ${isCurrent ? 'text-[#D6B14D]' : 'text-gray-600'}`}>
                          {track.artist}
                        </p>
                      </div>
                      {/* Current indicator dot */}
                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full shrink-0" style={{backgroundColor: '#D6B14D', boxShadow: '0 0 8px rgba(214,177,77,0.5)'}} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentTrack && (
            <div className="px-16 py-12 border-b border-gray-800/50 overflow-hidden">
              <p className="text-xs font-bold tracking-wider mb-1" style={{color: 'rgb(214,177,77)'}}>{currentTrack.artist}</p>
              <div className="overflow-hidden">
                <p className={`text-white text-[15px] font-semibold ${currentTrack.title.length > 35 ? 'whitespace-nowrap animate-marquee' : 'truncate'}`}>
                  {currentTrack.title}{currentTrack.title.length > 35 ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${currentTrack.title}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Video Area - yt-player가 항상 여기에 있음 */}
          <div className="relative aspect-video bg-black">
            <div id="yt-player" style={{width: '100%', height: '100%'}} />
          </div>

          <div className="px-20 py-16 bg-gradient-to-t from-gray-950 to-gray-900 border-t border-gray-800/50">
            <div className="flex items-center justify-center gap-20 mb-12">
              <button onClick={handlePrevTrack} className="w-44 h-44 rounded-full bg-gray-800/60 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 border border-gray-700/30" title="Previous"><SkipBack className="w-20 h-20 text-gray-300" /></button>
              <button onClick={togglePlay} className="w-56 h-56 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 shadow-lg" style={{background: 'linear-gradient(135deg, rgb(214,177,77) 0%, rgb(184,150,45) 100%)', boxShadow: '0 4px 20px rgba(214,177,77,0.35)'}} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="w-24 h-24 text-white" /> : <Play className="w-24 h-24 text-white ml-2" />}
              </button>
              <button onClick={handleNextTrack} className="w-44 h-44 rounded-full bg-gray-800/60 flex items-center justify-center hover:bg-gray-700 transition-all duration-200 border border-gray-700/30" title="Next"><SkipForward className="w-20 h-20 text-gray-300" /></button>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-500 font-medium tracking-wide">{currentIndex + 1} <span className="text-gray-600 mx-1">/</span> {playlist.length}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})

export const App = () => {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      <GlobalMusicPlayer />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-6 h-6 border-2 border-[#D6B14D] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about/introduction" element={<AboutIntroduction />} />
          <Route path="/about/research" element={<AboutResearch />} />
          <Route path="/about/honors" element={<AboutHonors />} />
          <Route path="/about/location" element={<AboutLocation />} />
          <Route path="/members/director" element={<MembersDirector />} />
          <Route path="/members/director/portfolio/profile" element={<MembersDirectorPortfolio />} />
          <Route path="/members/director/portfolio/academic" element={<MembersDirectorPortfolioAcademic />} />
          <Route path="/members/director/portfolio/activities" element={<MembersDirectorPortfolioActivities />} />
          <Route path="/members/director/activities" element={<MembersDirectorActivities />} />
          <Route path="/members/director/academic" element={<MembersDirectorAcademic />} />
          <Route path="/members/current" element={<MembersCurrent />} />
          <Route path="/members/alumni" element={<MembersAlumni />} />
          <Route path="/members/detail/:id" element={<MembersDetail />} />
          <Route path="/archives/news" element={<ArchivesNews />} />
          <Route path="/archives/notice" element={<ArchivesNotice />} />
          <Route path="/archives/gallery" element={<ArchivesGallery />} />
          <Route path="/archives/playlist" element={<ArchivesPlaylist />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};
