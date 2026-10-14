// PC 배너 상하 탐색
// 배너 이미지는 가로로 긴 원본(2560×1088)을 화면 높이에 맞춰 잘라 보여 주므로 위·아래가 일부 가려진다.
// 마우스를 배너 위에서 위아래로 움직이면 커서 높이에 맞춰 이미지가 부드럽게 위아래로 이동해
// 가려진 부분까지 볼 수 있게 한다. 마우스가 배너를 벗어나면 원래 위치로 돌아간다.
//
// 대상: data-pan 속성이 붙은 배경 이미지 요소 (부모 요소가 배너 영역)
// 마우스·트랙패드가 있는 기기에서만 동작하고, 모션 줄이기 설정을 켠 경우에는 동작하지 않는다.

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
const EDGE = 0.12 // 배너 위·아래 12% 구간은 끝까지 이동한 것으로 본다

let started = false

export function initBannerPan() {
  if (started || typeof window === 'undefined') return
  started = true

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

  const active = new Set<HTMLElement>()
  let frame = 0
  let lastX = 0
  let lastY = 0

  const prepare = (el: HTMLElement) => {
    if (el.dataset.panReady) return
    el.dataset.panReady = '1'
    el.dataset.panHome = el.style.backgroundPosition || '50% 50%'
    el.style.transition = `transform 2000ms ease, background-position 900ms ${EASE}`
  }

  const restore = (el: HTMLElement) => {
    el.style.backgroundPosition = el.dataset.panHome || '50% 50%'
  }

  const update = () => {
    frame = 0
    if (!canHover.matches || reduced.matches) return
    const els = document.querySelectorAll<HTMLElement>('[data-pan]')
    els.forEach((el) => {
      const box = el.parentElement?.getBoundingClientRect()
      if (!box || el.offsetParent === null) return // 화면에 안 보이는(모바일용) 요소는 건너뜀
      const inside = lastX >= box.left && lastX <= box.right && lastY >= box.top && lastY <= box.bottom
      if (inside) {
        prepare(el)
        const r = (lastY - box.top) / box.height
        const t = Math.min(1, Math.max(0, (r - EDGE) / (1 - 2 * EDGE)))
        const x = (el.dataset.panHome || '50% 50%').split(' ')[0]
        el.style.backgroundPosition = `${x} ${(t * 100).toFixed(1)}%`
        active.add(el)
      } else if (active.has(el)) {
        restore(el)
        active.delete(el)
      }
    })
    // 페이지 이동 등으로 사라진 요소 정리
    active.forEach((el) => { if (!el.isConnected) active.delete(el) })
  }

  const schedule = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    lastX = e.clientX
    lastY = e.clientY
    if (!frame) frame = requestAnimationFrame(update)
  }

  window.addEventListener('pointermove', schedule, { passive: true })
  // 스크롤로 배너가 커서 아래를 지나갈 때도 갱신
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update) }, { passive: true })
  document.addEventListener('pointerleave', () => { active.forEach(restore); active.clear() })
}
