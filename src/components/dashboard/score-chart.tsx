'use client'

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { Conversation } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#4A4A4A', '#71717A', '#A1A1AA', '#FF7A1A', '#FF6A00']

interface ScoreChartProps {
  conversations: Conversation[]
  avgScore: string
}

export function ScoreChart({ conversations, avgScore }: ScoreChartProps) {
  const counts = [0, 0, 0, 0, 0]
  conversations.forEach((d) => {
    if (d.score_qualidade && d.score_qualidade >= 1 && d.score_qualidade <= 5) {
      counts[d.score_qualidade - 1]++
    }
  })

  return (
    <div className="bg-ds-surface border border-ds-border rounded-lg p-[22px]">
      <div className="font-disp font-bold text-sm text-ds-text mb-4">
        Distribuição de Score
      </div>
      <div className="relative flex items-center justify-center" style={{ height: 180 }}>
        <Doughnut
          data={{
            labels: ['Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5'],
            datasets: [{ data: counts, backgroundColor: COLORS, borderWidth: 0, hoverOffset: 4 }],
          }}
          options={{
            cutout: '72%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: (ctx) => ` Score ${ctx.dataIndex + 1}: ${ctx.raw} atend.` },
              },
            },
            animation: { animateScale: true },
          }}
        />
        <div className="absolute text-center pointer-events-none">
          <div className="font-disp font-extrabold text-[26px] leading-none tracking-tight text-ds-accent">
            {avgScore}
          </div>
          <div className="text-[10px] text-ds-muted font-semibold tracking-wide">MÉDIA</div>
        </div>
      </div>
    </div>
  )
}
