import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Home, Music2, X, Minimize2, Maximize2, Play, Pause, List, LayoutGrid, SkipBack, SkipForward } from 'lucide-react'

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

// 화면 크기 체크 hook
const useIsPC = () => {
  const [isPC, setIsPC] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  
  useEffect(() => {
    const handleResize = () => setIsPC(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return isPC
}

// YouTube Player State Constants
const YT_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
}

// YouTube Player 인터페이스 (로컬)
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
}

interface PlaylistItem {
  artist: string;
  title: string;
  date: string;
  thumbnail?: string;
  youtubeUrl: string;
  videoId: string;
}

interface RawPlaylistItem {
  url: string;
  artist?: string;
  title?: string;
  date?: string;
}

export const ArchivesPlaylistTemplate = () => {
  const isPC = useIsPC()
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentVideo, setCurrentVideo] = useState<PlaylistItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isApiReady, setIsApiReady] = useState(false)
  const [showListPanel, setShowListPanel] = useState(true) // 기본값: 리스트 뷰
  const playerRef = useRef<YTPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const contentAnimation = useScrollAnimation()
  
  // Refs for accessing current state in callbacks
  const playlistsRef = useRef<PlaylistItem[]>([])
  const currentIndexRef = useRef<number>(-1)
  
  // Keep refs in sync with state
  useEffect(() => {
    playlistsRef.current = playlists
  }, [playlists])
  
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // PC가 아니면 홈으로 리다이렉트
  if (!isPC) {
    return <Navigate to="/" replace />
  }

  // YouTube IFrame API 로드
  useEffect(() => {
    if (window.YT) {
      setIsApiReady(true)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true)
    }

    return () => {
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [])
  
  // Play next track function - use loadVideoById for smoother transition
  const playNextTrack = useCallback(() => {
    const currentPlaylists = playlistsRef.current
    const currentIdx = currentIndexRef.current
    
    if (currentPlaylists.length === 0) return
    
    const nextIndex = (currentIdx + 1) % currentPlaylists.length
    const nextVideo = currentPlaylists[nextIndex]
    
    if (nextVideo?.videoId) {
      // If player exists, use loadVideoById for smoother transition with autoplay
      if (playerRef.current) {
        playerRef.current.loadVideoById(nextVideo.videoId)
        // Explicitly call playVideo after a short delay to ensure autoplay
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo()
          }
        }, 200)
        setIsPlaying(true)
      } else {
        // No player exists, destroy and let useEffect create new one
        setIsPlaying(true)
      }
      setCurrentVideo(nextVideo)
      setCurrentIndex(nextIndex)
    }
  }, [])
  
  // Play previous track function - use loadVideoById for smoother transition
  const playPrevTrack = useCallback(() => {
    const currentPlaylists = playlistsRef.current
    const currentIdx = currentIndexRef.current
    
    if (currentPlaylists.length === 0) return
    
    const prevIndex = currentIdx <= 0 ? currentPlaylists.length - 1 : currentIdx - 1
    const prevVideo = currentPlaylists[prevIndex]
    
    if (prevVideo?.videoId) {
      // If player exists, use loadVideoById for smoother transition with autoplay
      if (playerRef.current) {
        playerRef.current.loadVideoById(prevVideo.videoId)
        // Explicitly call playVideo after a short delay to ensure autoplay
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo()
          }
        }, 200)
        setIsPlaying(true)
      } else {
        // No player exists, let useEffect create new one
        setIsPlaying(true)
      }
      setCurrentVideo(prevVideo)
      setCurrentIndex(prevIndex)
    }
  }, [])

  // YouTube Player 초기화 - only creates player once
  const playerInitializedRef = useRef<boolean>(false)
  
  useEffect(() => {
    // Only run when API is ready
    if (!isApiReady) return
    
    // Skip if player is already initialized
    if (playerInitializedRef.current) return
    
    // Skip if no video selected yet or no container
    if (!currentVideo || !playerContainerRef.current) return
    
    // Mark as initialized to prevent recreation
    playerInitializedRef.current = true

    const currentVideoId = currentVideo.videoId
    
    // 플레이어 컨테이너 초기화
    const container = playerContainerRef.current
    container.innerHTML = '<div id="youtube-player"></div>'

    // 새 플레이어 생성 with autoplay
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: currentVideoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo()
          setIsPlaying(true)
        },
        onStateChange: (event) => {
          if (event.data === YT_STATE.PLAYING) {
            setIsPlaying(true)
          } else if (event.data === YT_STATE.PAUSED) {
            setIsPlaying(false)
          } else if (event.data === YT_STATE.ENDED) {
            setIsPlaying(false)
            // Auto-play next track
            playNextTrack()
          }
        },
      },
    })
  }, [isApiReady, currentVideo, playNextTrack])
  
  // Separate cleanup effect for unmount only
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      playerInitializedRef.current = false
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return
    
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying])

  useEffect(() => {
    const fetchPlaylists = async () => {
      const baseUrl = import.meta.env.BASE_URL || '/'
      try {
        const response = await fetch(`${baseUrl}data/playlist/ischoi.json`)
        const text = await response.text()
        const cleaned = text.replace(/,(\s*[}\]])/g, '$1')
        const data = JSON.parse(cleaned)

        // 데이터 형식 변환
        const items = data.items.map((item: RawPlaylistItem) => {
          // YouTube URL에서 비디오 ID 추출 (youtube.com/watch?v= 또는 youtu.be/ 형식 지원)
          let videoId = ''
          if (item.url.includes('youtu.be/')) {
            videoId = item.url.split('youtu.be/')[1]?.split('?')[0] || ''
          } else if (item.url.includes('v=')) {
            videoId = item.url.split('v=')[1]?.split('&')[0] || ''
          }
          return {
            artist: item.artist || 'Unknown Artist',
            title: item.title || 'Unknown Title',
            date: item.date || '',
            thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
            youtubeUrl: item.url,
            videoId: videoId
          }
        })

        setPlaylists(items)
      } catch (err) {
        console.error('Failed to load playlists:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [])

  const handlePlayVideo = (item: PlaylistItem, index: number) => {
    if (item.videoId) {
      // If player exists, use loadVideoById for smoother transition with autoplay
      if (playerRef.current && playerInitializedRef.current) {
        playerRef.current.loadVideoById(item.videoId)
        // Explicitly call playVideo after a short delay to ensure autoplay
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo()
          }
        }, 200)
      }
      setCurrentVideo(item)
      setCurrentIndex(index)
      setIsMinimized(false)
      setIsPlaying(true)
    }
  }

  const handleClosePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    playerInitializedRef.current = false
    setCurrentVideo(null)
    setIsMinimized(false)
    setIsPlaying(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Minimal Compact Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-1480 mx-auto px-12 md:px-20">
          <div className="flex items-center justify-between h-40 md:h-48">
            {/* Home Button */}
            <Link 
              to="/" 
              className="flex items-center gap-6 px-10 py-6 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 rounded-lg transition-all text-xs font-semibold"
              title="FINDS Lab 홈으로"
            >
              <Home size={14} />
              <span className="hidden sm:inline">FINDS Lab</span>
            </Link>
            
            {/* Title + View Toggle */}
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-4">
                <Music2 size={14} className="text-primary" />
                <span className="text-xs md:text-xs font-bold text-gray-900">Playlist</span>
                <span className="text-[10px] text-gray-400">{playlists.length} tracks</span>
              </div>
              
              {/* View Toggle Button */}
              <button 
                onClick={() => setShowListPanel(!showListPanel)}
                className={`flex items-center gap-4 px-10 py-5 rounded-full transition-all text-xs font-semibold border ${
                  showListPanel 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#D6B14D] hover:text-[#D6B14D]'
                }`}
                title={showListPanel ? "그리드 보기로 전환" : "리스트 보기로 전환"}
              >
                {showListPanel ? <LayoutGrid size={12} /> : <List size={12} />}
                <span>{showListPanel ? 'Grid' : 'List'}</span>
              </button>
            </div>
            
            {/* Spacer for balance */}
            <div className="w-60 sm:w-80" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-1480 mx-auto w-full px-12 md:px-16 py-16 md:py-24 ${currentVideo ? 'pb-[200px] md:pb-[240px]' : ''}`}>
        {loading ? (
          <div className="flex items-center justify-center py-48">
            <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : playlists.length > 0 ? (
          showListPanel ? (
            /* List View - Red Dot Design Quality */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* List Header */}
              <div className="grid grid-cols-[40px_1fr_1fr_100px] md:grid-cols-[48px_1fr_1fr_120px] gap-12 md:gap-16 px-16 md:px-24 py-12 md:py-14 bg-gray-50 border-b border-gray-100">
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">#</div>
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Title</div>
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Artist</div>
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Date</div>
              </div>
              
              {/* List Items */}
              <div className="divide-y divide-gray-50">
                {playlists.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handlePlayVideo(item, index)}
                    className={`grid grid-cols-[40px_1fr_1fr_100px] md:grid-cols-[48px_1fr_1fr_120px] gap-12 md:gap-16 px-16 md:px-24 py-12 md:py-14 cursor-pointer transition-all group ${
                      currentVideo?.videoId === item.videoId 
                        ? 'bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Number / Now Playing */}
                    <div className="flex items-center justify-center">
                      {currentVideo?.videoId === item.videoId ? (
                        isPlaying ? (
                          <div className="flex items-center gap-[2px]">
                            <div className="w-[3px] h-10 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-[3px] h-14 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-[3px] h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <Pause size={14} className="text-primary" />
                        )
                      ) : (
                        <span className="text-xs md:text-sm text-gray-400 group-hover:hidden">{index + 1}</span>
                      )}
                      {currentVideo?.videoId !== item.videoId && (
                        <Play size={14} className="text-primary hidden group-hover:block" />
                      )}
                    </div>
                    
                    {/* Title with Thumbnail */}
                    <div className="flex items-center gap-12 min-w-0">
                      <img 
                        src={item.thumbnail?.replace('maxresdefault', 'default')} 
                        alt=""
                        className="w-36 h-36 md:w-40 md:h-40 object-cover rounded-md flex-shrink-0"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src.includes('maxresdefault')) {
                            target.src = target.src.replace('maxresdefault', 'hqdefault')
                          }
                        }}
                      />
                      <span className={`text-xs md:text-sm font-semibold truncate ${
                        currentVideo?.videoId === item.videoId ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    
                    {/* Artist */}
                    <div className="flex items-center">
                      <span className="text-xs md:text-sm text-gray-500 truncate">{item.artist}</span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-end">
                      <span className="text-[10px] md:text-xs text-gray-400">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 md:gap-16">
            {playlists.map((item, index) => (
              <div
                key={index}
                onClick={() => handlePlayVideo(item, index)}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${
                  currentVideo?.videoId === item.videoId 
                    ? 'border-[#D6B14D] ring-2 ring-[#D6B14D]/20' 
                    : 'border-gray-100 hover:border-[#D6B14D]/30'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (target.src.includes('maxresdefault')) {
                          target.src = target.src.replace('maxresdefault', 'hqdefault')
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Music2 className="w-24 h-24 text-primary/30" />
                    </div>
                  )}
                  {/* Now Playing indicator */}
                  {currentVideo?.videoId === item.videoId && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {isPlaying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                          <div className="w-2 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                        </div>
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center">
                          <Pause size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Info - 아티스트 먼저, 제목 아래 */}
                <div className="p-12 md:p-14">
                  <p className="text-xs md:text-xs text-gray-500 mb-4 truncate font-bold">
                    {item.artist}
                  </p>
                  <h3 className="text-xs md:text-xs font-bold text-gray-900 group-hover:text-[#D6B14D] transition-colors line-clamp-2 leading-relaxed">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          )
        ) : (
          <div className="bg-white rounded-xl p-32 md:p-48 text-center">
            <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-16">
              <Music2 className="w-24 h-24 md:w-28 md:h-28 text-gray-300" />
            </div>
            <p className="text-sm md:text-base font-semibold text-gray-900 mb-6">
              플레이리스트 준비 중
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              아직 등록된 영상이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Player */}
      {currentVideo && (
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-gray-900 shadow-2xl z-50 transition-all duration-300 ${
            isMinimized ? 'h-[60px]' : 'h-auto'
          }`}
        >
          {/* Player Header - Always visible */}
          <div className="flex items-center justify-between px-12 md:px-20 py-8 border-b border-gray-700/50">
            <div className="flex items-center gap-12 flex-1 min-w-0">
              {/* Thumbnail - only in minimized mode */}
              {isMinimized && (
                <img 
                  src={currentVideo.thumbnail?.replace('maxresdefault', 'default')} 
                  alt={currentVideo.title}
                  className="w-40 h-40 object-cover rounded-md"
                />
              )}
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] md:text-xs truncate">{currentVideo.artist}</p>
                <h2 className="text-white font-semibold text-xs md:text-sm truncate">{currentVideo.title}</h2>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-8">
              {/* Previous track button */}
              <button
                onClick={playPrevTrack}
                className="p-8 text-gray-400 hover:text-white transition-colors"
                title="이전 곡"
              >
                <SkipBack size={18} />
              </button>
              {/* Play/Pause button - especially important in minimized mode */}
              <button
                onClick={togglePlayPause}
                className="p-8 text-gray-400 hover:text-white transition-colors"
                title={isPlaying ? "일시정지" : "재생"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              {/* Next track button */}
              <button
                onClick={playNextTrack}
                className="p-8 text-gray-400 hover:text-white transition-colors"
                title="다음 곡"
              >
                <SkipForward size={18} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-8 text-gray-400 hover:text-white transition-colors"
                title={isMinimized ? "확대" : "최소화"}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={handleClosePlayer}
                className="p-8 text-gray-400 hover:text-red-400 transition-colors"
                title="닫기"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* YouTube Player Container */}
          <div 
            ref={playerContainerRef}
            className={`${isMinimized ? 'h-0 overflow-hidden' : 'aspect-video max-h-[50vh]'} [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full`}
          />
        </div>
      )}
    </div>
  )
}

export default memo(ArchivesPlaylistTemplate)
