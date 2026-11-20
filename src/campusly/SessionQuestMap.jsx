import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Flag, MapPin, Sparkles, Trophy } from 'lucide-react'
import './session-quest.css'

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 73 + 11) % 100,
  y: (i * 37 + i * i * 7) % 100,
  size: 1 + ((i * 13) % 3),
  delay: ((i * 0.37) % 4).toFixed(2),
}))

export function buildQuestLayout(count, width) {
  const compact = width < 640
  const step = compact ? 150 : 172
  const top = compact ? 172 : 176
  const bottom = compact ? 176 : 190
  const leftX = Math.round(width * (compact ? 0.19 : 0.27))
  const rightX = Math.round(width * (compact ? 0.81 : 0.73))
  const stops = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? leftX : rightX,
    y: top + i * step,
  }))
  const height = top + Math.max(0, count - 1) * step + bottom
  const start = { x: Math.round(width / 2), y: 86 }
  const finish = { x: Math.round(width / 2), y: height - 74 }
  const points = [start, ...stops, finish]
  const curve = (a, b) => {
    const d = (b.y - a.y) * 0.55
    return ` C ${a.x} ${a.y + d}, ${b.x} ${b.y - d}, ${b.x} ${b.y}`
  }
  const pathTo = (n) => {
    let d = `M ${start.x} ${start.y}`
    for (let i = 1; i <= n; i += 1) d += curve(points[i - 1], points[i])
    return d
  }
  const midpoints = points.slice(0, -1).map((a, i) => ({
    x: (a.x + points[i + 1].x) / 2,
    y: (a.y + points[i + 1].y) / 2,
  }))
  return { compact, step, height, stops, start, finish, points, midpoints, fullPath: pathTo(points.length - 1), pathTo }
}

export default function SessionQuestMap({ moduleId, sessions, completed, moduleState, onOpenSession }) {
  const rootRef = useRef(null)
  const [width, setWidth] = useState(360)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const measure = () => setWidth(Math.max(300, Math.round(node.clientWidth)))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  const moduleDone = moduleState === 'Completed'
  const nextIndex = moduleDone ? -1 : sessions.findIndex((s) => s.num === completed + 1)
  const doneCount = sessions.filter((s) => s.done).length
  const layout = useMemo(() => buildQuestLayout(sessions.length, width), [sessions.length, width])
  const progressPoint = moduleDone || nextIndex < 0
    ? (doneCount === sessions.length ? layout.points.length - 1 : doneCount)
    : nextIndex + 1
  const progressPath = layout.pathTo(Math.max(0, progressPoint))

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const targets = node.querySelectorAll('.sq-stop')
    if (reduce || typeof IntersectionObserver === 'undefined') {
      targets.forEach((t) => t.classList.add('is-in'))
      setLive(true)
      return
    }
    const rootIo = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setLive(true)
        rootIo.disconnect()
      }
    }, { threshold: 0 })
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    rootIo.observe(node)
    targets.forEach((t) => io.observe(t))
    return () => {
      rootIo.disconnect()
      io.disconnect()
    }
  }, [moduleId, sessions.length, width])

  const pct = sessions.length ? Math.round((doneCount / sessions.length) * 100) : 0
  const pad = String(moduleId).padStart(2, '0')

  return (
    <div ref={rootRef} className={`sq-map${live ? ' is-live' : ''}${layout.compact ? ' is-compact' : ''}`} style={{ height: layout.height }}>
      <div className="sq-sky" aria-hidden="true">
        <span className="sq-aurora sq-aurora-a"/>
        <span className="sq-aurora sq-aurora-b"/>
        <span className="sq-aurora sq-aurora-c"/>
        {STARS.map((s, i) => (
          <i key={i} className="sq-star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}/>
        ))}
      </div>

      <div className="sq-hud">
        <span className="sq-hud-chip"><Sparkles size={13}/> Quest map · Module {pad}</span>
        <span className="sq-hud-score"><strong>{doneCount}</strong>/{sessions.length}<em>{pct}%</em></span>
      </div>

      <svg className="sq-road" width={width} height={layout.height} viewBox={`0 0 ${width} ${layout.height}`} aria-hidden="true">
        <defs>
          <linearGradient id="sq-progress-gradient" x1="0" y1={layout.start.y} x2="0" y2={layout.points[Math.max(1, progressPoint)].y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" className="sq-stop-cyan"/>
            <stop offset="50%" className="sq-stop-pink"/>
            <stop offset="100%" className="sq-stop-amber"/>
          </linearGradient>
          <filter id="sq-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path className="sq-road-shadow" d={layout.fullPath}/>
        <path className="sq-road-edge" d={layout.fullPath}/>
        <path className="sq-road-bed" d={layout.fullPath}/>
        <path className="sq-road-lane" d={layout.fullPath}/>
        {progressPoint > 0 && (
          <>
            <path className="sq-progress-glow" d={progressPath} pathLength="1000" filter="url(#sq-glow)"/>
            <path className="sq-progress" d={progressPath} pathLength="1000"/>
            <path className="sq-progress-flow" d={progressPath}/>
            {[0, 1.4, 2.8].map((begin) => (
              <circle key={begin} className="sq-comet" r="4.5">
                <animateMotion dur="4.2s" begin={`${begin}s`} repeatCount="indefinite" path={progressPath} rotate="auto"/>
              </circle>
            ))}
          </>
        )}
        {layout.midpoints.map((m, i) => (
          <circle key={i} className={`sq-mile${i < progressPoint ? ' is-lit' : ''}`} cx={m.x} cy={m.y} r="3.5"/>
        ))}
      </svg>

      <div className="sq-flag sq-start" style={{ left: layout.start.x, top: layout.start.y }}>
        <span className="sq-flag-icon"><Flag size={15}/></span>
        <span>Start</span>
      </div>

      <ol className="sq-stops" aria-label={`Sessions in Module ${moduleId}`}>
        {sessions.map((session, index) => {
          const isNext = index === nextIndex
          const status = session.done ? 'Completed' : isNext ? 'Up next' : 'Available'
          const pos = layout.stops[index]
          const onLeft = index % 2 === 0
          const title = session.topic.replace(/^Session \d+: /, '')
          const cardStyle = onLeft
            ? { left: pos.x + (layout.compact ? 40 : 52), right: layout.compact ? 8 : undefined }
            : { right: width - pos.x + (layout.compact ? 40 : 52), left: layout.compact ? 8 : undefined }
          return (
            <li
              key={session.num}
              className={`sq-stop ${onLeft ? 'is-left' : 'is-right'} ${session.done ? 'is-done' : isNext ? 'is-next' : 'is-open'}`}
              style={{ '--sq-delay': `${Math.min(index, 8) * 70}ms` }}
            >
              <button
                type="button"
                className="sq-stop-button"
                aria-label={`View session ${session.num}: ${title} (${status})`}
                aria-haspopup="dialog"
                onClick={() => onOpenSession({ ...session, status })}
              >
                <span className="sq-node" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
                  {isNext && (<><span className="sq-ring"/><span className="sq-ring sq-ring-2"/></>)}
                  <span className="sq-node-core">
                    <span className="sq-node-num">{String(session.num).padStart(2, '0')}</span>
                  </span>
                  {session.done && <span className="sq-node-check"><Check size={11} strokeWidth={3.4}/></span>}
                </span>
                {isNext && (
                  <span className="sq-here" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
                    <MapPin size={13}/> You are here
                  </span>
                )}
                <span className="sq-card" style={{ ...cardStyle, top: pos.y }}>
                  <span className="sq-card-kicker">
                    <span className="sq-card-dot"/>Session {String(session.num).padStart(2, '0')} · {status}
                  </span>
                  <strong className="sq-card-title">{title}</strong>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className={`sq-flag sq-finish${moduleDone ? ' is-won' : ''}`} style={{ left: layout.finish.x, top: layout.finish.y }}>
        <span className="sq-trophy"><Trophy size={22}/></span>
        <span className="sq-finish-copy">
          <strong>{moduleDone ? 'Module cleared!' : 'Module finish'}</strong>
          <em>{moduleDone ? 'Every session complete' : `${sessions.length - doneCount} sessions to go`}</em>
        </span>
      </div>
    </div>
  )
}
