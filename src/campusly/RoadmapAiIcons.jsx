// Realistic glowing AI pictures (chip, brain, robot, chart, code, AI core) floating behind the course road.
import { assetUrl } from '@/lib/asset-url'
import chip from '@/assets/roadmap-ai/ai-chip.webp.asset.json'
import brain from '@/assets/roadmap-ai/ai-brain.webp.asset.json'
import robot from '@/assets/roadmap-ai/ai-robot.webp.asset.json'
import dashboard from '@/assets/roadmap-ai/ai-dashboard.webp.asset.json'
import code from '@/assets/roadmap-ai/ai-code.webp.asset.json'
import network from '@/assets/roadmap-ai/ai-network.webp.asset.json'

const ICONS = { chip, brain, robot, dashboard, code, network }

// Placement: y as % of the map height, side of the map, size in px. Alternates sides down the road.
export const AI_ICON_LAYOUT = [
  { icon: 'chip', y: 2, side: 'right', size: 130 },
  { icon: 'brain', y: 9, side: 'left', size: 132 },
  { icon: 'network', y: 17, side: 'left', size: 118 },
  { icon: 'robot', y: 22, side: 'right', size: 116 },
  { icon: 'dashboard', y: 31, side: 'left', size: 132 },
  { icon: 'code', y: 38, side: 'right', size: 112 },
  { icon: 'network', y: 46, side: 'left', size: 112 },
  { icon: 'chip', y: 54, side: 'right', size: 118 },
  { icon: 'brain', y: 62, side: 'right', size: 124 },
  { icon: 'code', y: 69, side: 'left', size: 108 },
  { icon: 'robot', y: 77, side: 'left', size: 110 },
  { icon: 'dashboard', y: 84, side: 'right', size: 124 },
  { icon: 'chip', y: 91, side: 'left', size: 112 },
  { icon: 'network', y: 95, side: 'right', size: 108 },
]

export default function RoadmapAiIcons() {
  return (
    <div className="roadmap-ai-icons" aria-hidden="true">
      {AI_ICON_LAYOUT.map(({ icon, y, side, size }, i) => (
        <span
          key={`${icon}-${i}`}
          className={`roadmap-ai-icon is-${side} is-${icon}`}
          style={{ '--ai-y': `${y}%`, '--ai-size': `${size}px`, '--ai-delay': `${(i % 5) * -1.1}s`, '--ai-tilt': `${i % 2 ? 5 : -5}deg` }}
        >
          <img src={assetUrl(ICONS[icon].url)} alt="" loading="lazy" decoding="async" draggable="false"/>
        </span>
      ))}
    </div>
  )
}
