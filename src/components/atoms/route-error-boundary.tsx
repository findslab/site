import {Component, type ErrorInfo, type ReactNode} from 'react'

// 페이지 로딩·렌더링 중 오류가 나도 흰 화면으로 멈추지 않게 하는 안전장치.
//
// 1) 새 버전 배포 직후, 예전 화면을 열어 둔 상태에서 다른 메뉴를 누르면
//    이미 지워진 예전 파일을 불러오려다 실패한다. 이 경우 한 번만 자동으로 새로고침해 새 버전을 받는다.
// 2) 그 밖의 오류는 흰 화면 대신 안내 문구와 [새로고침]/[홈으로] 버튼을 보여 준다.

const RELOAD_KEY = 'finds:chunk-reload'

export const isChunkLoadError = (err: unknown) => {
  const msg = String((err as Error)?.message || err || '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \d+ failed|Unable to preload CSS/i.test(msg)
}

// 같은 주소에서 무한 새로고침이 되지 않도록 30초 안에는 한 번만 시도
export const reloadOnceForNewVersion = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // 저장소를 못 쓰는 환경이면 그냥 한 번 새로고침
  }
  window.location.reload()
  return true
}

type Props = {children: ReactNode; resetKey?: string}
type State = {error: Error | null}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = {error: null}

  static getDerivedStateFromError(error: Error): State {
    return {error}
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnceForNewVersion()) return
    console.error('[RouteErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    // 다른 메뉴로 이동하면 오류 상태를 풀어 준다
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({error: null})
  }

  render() {
    if (!this.state.error) return this.props.children
    const base = import.meta.env.BASE_URL || '/'
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-20">
        <div className="max-w-[420px] w-full text-center border border-gray-100 rounded-2xl px-24 py-32 shadow-sm">
          <div className="mx-auto mb-16 w-40 h-40 rounded-full bg-[#FFF9E6] flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-[#D6B14D]" />
          </div>
          <p className="text-base font-bold text-gray-900 mb-6">페이지를 불러오지 못했습니다</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-20">
            홈페이지가 방금 업데이트되었을 수 있습니다.<br/>새로고침하면 최신 화면이 열립니다.
          </p>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => window.location.reload()}
              className="px-16 py-8 rounded-full bg-[#D6B14D] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              새로고침
            </button>
            <a href={base} className="px-16 py-8 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              홈으로
            </a>
          </div>
        </div>
      </div>
    )
  }
}
