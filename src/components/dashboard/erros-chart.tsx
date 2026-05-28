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
import type { FrequenciaItem } from '@/types'
import { ERRO_LABELS } from '@/lib/constants'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface ErrosChartProps {
  erros: FrequenciaItem[]
}

export function ErrosChart({ erros }: ErrosChartProps) {
  return (
    <div className="bg-ds-surface border border-ds-border rounded-lg p-[22px]">
      <div className="font-disp font-bold text-sm text-ds-text mb-4">
        Principais Erros Identificados
      </div>
      <div style={{ height: 200 }}>
        <Bar
          data={{
            labels: erros.map((d) => ERRO_LABELS[d.categoria] || d.categoria),
            datasets: [
              {
                data: erros.map((d) => d.frequencia),
                backgroundColor: 'rgba(255,106,0,0.55)',
                borderColor: '#FF6A00',
                borderRadius: 6,
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
