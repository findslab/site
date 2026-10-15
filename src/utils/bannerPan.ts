// PC 배너 상하 탐색 + 은은한 3D 시차 효과
//
// 배너 이미지는 가로로 긴 원본(2560×1088)을 화면 높이에 맞춰 잘라 보여 주므로 위·아래가 일부 가려진다.
// 마우스를 배너 위에서 움직이면 커서 위치를 따라 이미지가 천천히 따라오며,
//  - 세로: 커서 높이에 맞춰 가려진 위/아래를 보여 주고
//  - 가로: 반대 방향으로 아주 조금 밀려 깊이감(시차)을 주며
//  - 기울기·확대: 1도 안팎으로 살짝 기울고 조금 다가와, 3D 장면을 들여다보는 느낌을 준다.
// 움직임은 매 프레임 목표값을 향해 부드럽게 감속하는 방식(관성)이라 휙휙 튀지 않는다.
// 마우스가 배너를 벗어나면 같은 방식으로 천천히 원래 자리로 돌아간다.
//
// 대상: data-pan 속성이 붙은 배경 이미지 요소 (부모 요소가 배너 영역)
// 마우스·트랙패드가 있는 기기에서만 동작하고, 모션 줄이기 설정을 켠 경우에는 동작하지 않는다.

const EDGE = 0.14 // 배너 위·아래 14% 구간은 끝까지 이동한 것으로 본다
const FOLLOW = 0.055 // 프레임당 목표값을 따라가는 비율 (작을수록 묵직하고 느림)
const SHIFT_X = 2.2 // 가로 시차 이동폭 (%)
const TILT_X = 1.1 // 상하 기울기 (deg)
const TILT_Y = 1.6 // 좌우 기울기 (deg)
const SCALE_REST = 1.05 // 평소 (기존 md:scale-105 와 동일)
const SCALE_HOVER = 1.085 // 마우스를 올렸을 때 살짝 다가오는 정도

type V = {x: number; y: number; rx: number; ry: number; s: number}
type State = {home: V; cur: V; target: V; active: boolean}

const states = new WeakMap<HTMLElement, State>()
const tracked = new Set<HTMLElement>()
let started = false
let raf = 0

const parsePos = (pos: string): {x: number; y: number} => {
  const [a = '50%', b = '50%'] = (pos || '50% 50%').split(' ')
  return {x: parseFloat(a) || 50, y: parseFloat(b) || 50}
}

const stateOf = (el: HTMLElement): State => {
  let st = states.get(el)
  if (!st) {
    const p = parsePos(el.style.backgroundPosition)
    const home: V = {x: p.x, y: p.y, rx: 0, ry: 0, s: SCALE_REST}
    st = {home, cur: {...home}, target: {...home}, active: false}
    states.set(el, st)
    // 기존 CSS 전환 효과(2초 transform 전환)와 겹치지 않도록 직접 제어한다
    el.style.transition = 'none'
    el.style.willChange = 'transform, background-position'
  }
  return st
}

const apply = (el: HTMLElement, v: V) => {
  el.style.backgroundPosition = `${v.x.toFixed(2)}% ${v.y.toFixed(2)}%`
  el.style.transform = `perspective(1400px) rotateX(${v.rx.toFixed(3)}deg) rotateY(${v.ry.toFixed(3)}deg) scale(${v.s.toFixed(4)})`
}

const tick = () => {
  raf = 0
  let moving = false
  tracked.forEach((el) => {
    if (!el.isConnected) { tracked.delete(el); return }
    const st = states.get(el)
    if (!st) return
    const c = st.cur, t = st.target
    let done = true
    ;(['x', 'y', 'rx', 'ry', 's'] as const).forEach((k) => {
      const d = t[k] - c[k]
      if (Math.abs(d) > (k === 's' ? 0.0002 : 0.01)) { c[k] += d * FOLLOW; done = false } else c[k] = t[k]
    })
    apply(el, c)
    if (!done) moving = true
    else if (!st.active) tracked.delete(el)
  })
  if (moving) raf = requestAnimationFrame(tick)
}

const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }

export function initBannerPan() {
  if (started || typeof window === 'undefined') return
  started = true

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let px = -1, py = -1, pending = 0

  const update = () => {
    pending = 0
    if (!canHover.matches || reduced.matches) return
    document.querySelectorAll<HTMLElement>('[data-pan]').forEach((el) => {
      const box = el.parentElement?.getBoundingClientRect()
      if (!box || el.offsetParent === null) return // 화면에 안 보이는(모바일용) 요소는 건너뜀
      const inside = px >= box.left && px <= box.right && py >= box.top && py <= box.bottom
      const st = stateOf(el)
      if (inside) {
        const mx = (px - box.left) / box.width - 0.5 // -0.5 ~ 0.5
        const r = (py - box.top) / box.height
        const ty = Math.min(1, Math.max(0, (r - EDGE) / (1 - 2 * EDGE)))
        const my = ty - 0.5
        st.target = {
          x: st.home.x - mx * SHIFT_X * 2,
          y: ty * 100,
          rx: -my * TILT_X * 2,
          ry: mx * TILT_Y * 2,
          s: SCALE_HOVER,
        }
        st.active = true
      } else if (st.active) {
        st.target = {...st.home}
        st.active = false
      } else return
      tracked.add(el)
      kick()
    })
  }

  const schedule = () => { if (!pending) pending = requestAnimationFrame(update) }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    px = e.clientX; py = e.clientY
    schedule()
  }, {passive: true})
  // 스크롤로 배너가 커서 아래를 지나갈 때도 갱신
  window.addEventListener('scroll', schedule, {passive: true})
  document.addEventListener('pointerleave', () => { px = py = -1; schedule() })
}
