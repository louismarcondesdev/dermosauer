'use client'

import type { DashboardData, Conversation, ConversationFilters } from '@/types'
import { useState, useMemo } from 'react'
import { KpiGrid } from '../kpi-grid'
import { ChartsRow } from '../charts-row'
import { FilterBar } from '../filter-bar'
import { ConvGrid } from '../conv-grid'
import { ConvModal } from '../conv-modal'

export function TabVisaoGeral({ data }: { data: DashboardData }) {
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [filters, setFilters] = useState<ConversationFilters>({
    search: '',
    nicho: '',
    score: '',
    status: '',
  })

  const nichoOptions = useMemo(
    () => [...new Set(data.conversations.map((d) => d.nicho).filter(Boolean))].sort() as string[],
    [data.conversations],
  )

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase()
    return data.conversations.filter((d) => {
      if (q) {
        const text = [d.contato, d.resumo, ...(d.produtos_solicitados ?? [])].join(' ').toLowerCase()
        if (!text.includes(q)) return false
      }
      if (filters.nicho && d.nicho !== filters.nicho) return false
      if (filters.score && String(d.score_qualidade) !== filters.score) return false
      if (filters.status === 'convertido' && !d.conversao_realizada) return false
      if (filters.status === 'perdido' && !d.orcamento_perdido) return false
      if (filters.status === 'compliance' && !d.medicamento_controlado) return false
      return true
    })
  }, [data.conversations, filters])

  return (
    <>
      <Section>KPIs</Section>
      <KpiGrid panorama={data.panorama} />

      <Section>Análise Visual</Section>
      <ChartsRow
        conversations={data.conversations}
        panorama={data.panorama}
        nichos={data.nichos}
        erros={data.erros}
      />

      <Section className="mt-2">Atendimentos Individuais</Section>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        nichoOptions={nichoOptions}
        totalFiltered={filtered.length}
      />
      <ConvGrid conversations={filtered} onSelect={setSelected} />
      <ConvModal conv={selected} onClose={() => setSelected(null)} />
    </>
  )
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-disp font-bold text-[13px] uppercase tracking-[1.5px] text-ds-muted mb-3.5 ${className ?? ''}`}>
      {children}
    </div>
  )
}
