'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import type { NichoPerformance } from '@/types'
import { NICHO_LABELS, NICHO_CHART_COLORS } from '@/lib/constants'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface NichoChartProps {
  nichos: NichoPerformance[]
}

export function NichoChart({ nichos }: NichoChartProps) {
  const sorted = [...nichos]
    .sort((a, b) => b.total_conversas - a.total_conversas)
    .slice(0, 10)

  return (
    <div className="bg-ds-surface border border-ds-border rounded-lg p-[22px]">
      <div className="font-disp font-bold text-sm text-ds-text mb-4">
        Conversas por Nicho
      </div>
      <div style={{ height: 200 }}>
        <Bar
          data={{
            labels: sorted.map((d) => NICHO_LABELS[d.nicho] || d.nicho),
            datasets: [
              {
                data: sorted.map((d) => d.total_conversas),
                backgroundColor: NICHO_CHART_COLORS.slice(0, sorted.length),
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          }}
          options={{
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4A4A4A', font: { size: 11 } } },
              y: { grid: { display: false }, ticks: { color: '#4A4A4A', font: { size: 11 } } },
            },
            animation: { duration: 600 },
          }}
        />
      </div>
    </div>
  )
}
