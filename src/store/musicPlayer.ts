import { create } from 'zustand'

interface MusicPlayerState {
  playlist: string[]
  currentIndex: number
  isPlaying: boolean
  isMinimized: boolean
  isLoaded: boolean
  setPlaylist: (playlist: string[]) => void
  setCurrentIndex: (index: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setIsMinimized: (isMinimized: boolean) => void
  setIsLoaded: (isLoaded: boolean) => void
  nextTrack: () => void
  prevTrack: () => void
  togglePlay: () => void
  toggleMinimize: () => void
}

export const useMusicPlayerStore = create<MusicPlayerState>((set, get) => ({
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  isMinimized: true,
  isLoaded: false,
  setPlaylist: (playlist) => set({ playlist }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  nextTrack: () => {
    const { playlist, currentIndex } = get()
    set({ currentIndex: (currentIndex + 1) % playlist.length, isPlaying: true })
  },
  prevTrack: () => {
    const { playlist, currentIndex } = get()
    set({ currentIndex: currentIndex === 0 ? playlist.length - 1 : currentIndex - 1, isPlaying: true })
  },
  togglePlay: () => {
    const { isPlaying, isMinimized } = get()
    set({ 
      isPlaying: !isPlaying,
      isMinimized: !isPlaying ? false : isMinimized 
    })
  },
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
}))
