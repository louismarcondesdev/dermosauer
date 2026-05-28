import type { Panorama } from '@/types'
import { fmtBRL } from '@/lib/formatters'
import { KpiCard } from './kpi-card'

interface KpiGridProps {
  panorama: Panorama
}

export function KpiGrid({ panorama: p }: KpiGridProps) {
  const taxa =
    p.pipeline_r$ && p.receita_r$
      ? `${((p.receita_r$ / p.pipeline_r$) * 100).toFixed(0)}% taxa conversão`
      : 'taxa conversão —'

  return (
    <div className="grid gap-3.5 mb-7" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
      <KpiCard
        label="Atendimentos"
        value={p.total_conversas ?? '—'}
        sub="analisados"
        variant="accent"
      />
      <KpiCard
        label="Score Médio"
        value={p.score_medio ? Number(p.score_medio).toFixed(1) : '—'}
        sub={<>{p.atendimentos_bons ?? 0} bons · {p.atendimentos_criticos ?? 0} críticos</>}
        variant="ok"
      />
      <KpiCard
        label="Receita Gerada"
        value={p.receita_r$ ? fmtBRL(p.receita_r$) : '—'}
        sub={p.ticket_medio_r$ ? `ticket médio ${fmtBRL(p.ticket_medio_r$)}` : 'ticket médio —'}
        variant="ok"
      />
      <KpiCard
        label="Receita Perdida"
        value={p.perdas_r$ ? fmtBRL(p.perdas_r$) : '—'}
        sub={taxa}
        variant="danger"
      />
      <KpiCard
        label="Resp. Média"
        value={p.tempo_resposta_medio_min ? Math.round(p.tempo_resposta_medio_min) : '—'}
        sub="min 1ª resposta"
        variant="accent"
      />
      <KpiCard
        label="Alertas"
        value={p.alertas_compliance ?? '—'}
        sub="compliance"
        variant="warn"
      />
    </div>
  )
}
