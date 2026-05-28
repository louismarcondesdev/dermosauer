import type { Conversation, NichoPerformance, FrequenciaItem, Panorama } from '@/types'
import { ScoreChart } from './score-chart'
import { NichoChart } from './nicho-chart'
import { ErrosChart } from './erros-chart'

interface ChartsRowProps {
  conversations: Conversation[]
  panorama: Panorama
  nichos: NichoPerformance[]
  erros: FrequenciaItem[]
}

export function ChartsRow({ conversations, panorama, nichos, erros }: ChartsRowProps) {
  const avgScore = panorama.score_medio
    ? Number(panorama.score_medio).toFixed(1)
    : '—'

  return (
    <div
      className="grid gap-3.5 mb-7"
      style={{ gridTemplateColumns: '260px 1fr 1fr' }}
    >
      <ScoreChart conversations={conversations} avgScore={avgScore} />
      <NichoChart nichos={nichos} />
      <ErrosChart erros={erros} />
    </div>
  )
}
