'use client'

import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import type { DashboardData } from '@/types'
import { ERRO_LABELS, SCORE_COLORS } from '@/lib/constants'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const ACERTO_LABEL: Record<string, string> = {
  transparencia_prazo: 'Transparência no prazo',
  ofereceu_entrega: 'Ofereceu entrega',
  conversao_eficiente: 'Conversão eficiente',
  resposta_rapida: 'Resposta rápida',
  entrega_gratuita: 'Entrega gratuita',
  proatividade_comercial: 'Proatividade comercial',
  follow_up_realizado: 'Follow-up realizado',
  tom_acolhedor: 'Tom acolhedor',
}

const TOM_COLORS: Record<string, string> = {
  excelente: '#FF6A00',
  bom: '#FF7A1A',
  neutro: '#A1A1AA',
}

function Kpi({ label, value, sub, color: _color }: { label: string; value: string | number; sub?: string; color?: string }) {
  const str = String(value ?? '—')
  const fontSize = str.length <= 5 ? 58 : str.length <= 8 ? 44 : str.length <= 12 ? 32 : str.length <= 16 ? 24 : 18
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        padding: 28,
        transition: 'border-color 200ms, box-shadow 200ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.09)'
        el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.05)'
        el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)'
      }}
    >
      <div style={{ fontSize: 15, color: '#71717A', fontWeight: 500, marginBottom: 12, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{ fontSize, fontWeight: 700, lineHeight: 1.05, color: '#FF6A00', letterSpacing: '-0.03em' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 14, color: '#4A4A4A', marginTop: 12, fontFamily: 'var(--font-dmmono)' }}>{sub}</div>}
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 16 }}>{children}</div>
  )
}

export function TabQualidade({ data }: { data: DashboardData }) {
  const { conversations, erros, acertos, panorama } = data

  const tomStats = useMemo(() => {
    const grupos: Record<string, { total: number; conv: number; scoreSum: number; tempoSum: number; tempoCount: number }> = {}
    conversations.forEach(c => {
      const tom = c.tom_atendente || 'desconhecido'
      if (!grupos[tom]) grupos[tom] = { total: 0, conv: 0, scoreSum: 0, tempoSum: 0, tempoCount: 0 }
      grupos[tom].total++
      if (c.conversao_realizada) grupos[tom].conv++
      if (c.score_qualidade) grupos[tom].scoreSum += c.score_qualidade
      if (c.tempo_primeira_resposta_humana_min != null) {
        grupos[tom].tempoSum += c.tempo_primeira_resposta_humana_min
        grupos[tom].tempoCount++
      }
    })
    return Object.entries(grupos).sort((a, b) => b[1].total - a[1].total)
  }, [conversations])

  const tempoStats = useMemo(() => {
    const buckets = [
      { label: '≤5min', min: 0, max: 5, conv: 0, total: 0 },
      { label: '6–15min', min: 6, max: 15, conv: 0, total: 0 },
      { label: '16–30min', min: 16, max: 30, conv: 0, total: 0 },
      { label: '31–60min', min: 31, max: 60, conv: 0, total: 0 },
      { label: '>60min', min: 61, max: Infinity, conv: 0, total: 0 },
    ]
    conversations.forEach(c => {
      if (c.tempo_primeira_resposta_humana_min == null) return
      const b = buckets.find(b => c.tempo_primeira_resposta_humana_min! >= b.min && c.tempo_primeira_resposta_humana_min! <= b.max)
      if (b) {
        b.total++
        if (c.conversao_realizada) b.conv++
      }
    })
    return buckets
  }, [conversations])

  const flags = useMemo(() => {
    const total = conversations.length
    const c1 = conversations.filter(c => c.resolucao_primeiro_contato).length
    const pnc = conversations.filter(c => c.promessa_nao_cumprida).length
    const eo = conversations.filter(c => c.erro_operacional).length
    const fu = conversations.filter(c => c.follow_up_pos_orcamento).length
    return { total, c1, pnc, eo, fu }
  }, [conversations])

  const criticas = useMemo(() =>
    conversations.filter(c => c.score_qualidade != null && c.score_qualidade <= 2).slice(0, 6),
    [conversations]
  )

  const errosTop = erros.slice(0, 8)
  const acertosTop = acertos.slice(0, 8)

  return (
    <div className="space-y-7">
      <div>
        <Section>KPIs de Qualidade</Section>
        <div className="grid gap-3.5 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}>
          <Kpi label="Score Médio" value={panorama.score_medio ? Number(panorama.score_medio).toFixed(1) : '—'} sub={`${panorama.atendimentos_bons ?? 0} bons · ${panorama.atendimentos_criticos ?? 0} críticos`} color="#FF6A00" />
          <Kpi label="Resolução 1º Contato" value={`${flags.total ? (flags.c1 / flags.total * 100).toFixed(0) : 0}%`} sub={`${flags.c1} de ${flags.total}`} color="#FF6A00" />
          <Kpi label="Follow-up Realizado" value={`${flags.total ? (flags.fu / flags.total * 100).toFixed(0) : 0}%`} sub={`${flags.fu} atendimentos`} color="#A1A1AA" />
          <Kpi label="Erros Operacionais" value={panorama.erros_operacionais ?? flags.eo} sub="detectados" color="#FF6A00" />
          <Kpi label="Promessas Quebradas" value={panorama.promessas_nao_cumpridas ?? flags.pnc} sub="não cumpridas" color="#FF6A00" />
          <Kpi label="Resp. Média" value={panorama.tempo_resposta_medio_min ? Math.round(panorama.tempo_resposta_medio_min) : '—'} sub="min 1ª resposta" color="#A1A1AA" />
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Performance por Tom de Atendimento</div>
          <div className="space-y-3">
            {tomStats.map(([tom, s]) => {
              const color = TOM_COLORS[tom] ?? '#666666'
              const taxa = s.total ? (s.conv / s.total * 100) : 0
              const score = s.total ? (s.scoreSum / s.total).toFixed(1) : '—'
              const tempo = s.tempoCount ? Math.round(s.tempoSum / s.tempoCount) : null
              return (
                <div key={tom} className="bg-ds-s2 border border-ds-border rounded-DEFAULT p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm capitalize" style={{ color }}>{tom}</span>
                    <span className="font-mono text-xs text-ds-muted">{s.total} atend.</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="text-center">
                      <div className="font-mono font-bold text-lg leading-none" style={{ color }}>{score}</div>
                      <div className="text-ds-muted mt-0.5">score</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-lg leading-none" style={{ color: '#FF6A00' }}>{taxa.toFixed(0)}%</div>
                      <div className="text-ds-muted mt-0.5">conversão</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-lg leading-none text-ds-accent">{tempo ?? '—'}min</div>
                      <div className="text-ds-muted mt-0.5">1ª resp.</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Conversão por Tempo de Resposta</div>
          <Bar
            data={{
              labels: tempoStats.map(b => b.label),
              datasets: [
                { label: 'Total', data: tempoStats.map(b => b.total), backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderRadius: 4 },
                { label: 'Convertidos', data: tempoStats.map(b => b.conv), backgroundColor: 'rgba(255,106,0,0.55)', borderColor: '#FF6A00', borderWidth: 1, borderRadius: 4 },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { labels: { color: '#666666', font: { size: 11 } } } },
              scales: {
                x: { ticks: { color: '#4A4A4A', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: '#4A4A4A' }, grid: { color: 'rgba(255,255,255,0.04)' } },
              },
            }}
          />
          <p className="text-[11px] text-ds-muted mt-2">Resposta rápida ≤5min tem melhor taxa de conversão e engajamento</p>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">✅ Acertos Frequentes</div>
          {acertosTop.length > 0 ? (
            <div className="space-y-2">
              {acertosTop.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-ds-border last:border-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(255,106,0,0.15)', color: '#FF6A00' }}>{a.frequencia}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-ds-m2">{ACERTO_LABEL[a.categoria] || a.categoria}</div>
                    {a.exemplo && <div className="text-[11px] text-ds-muted truncate">{a.exemplo}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-ds-muted text-sm">Sem dados</div>}
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">❌ Erros Frequentes</div>
          {errosTop.length > 0 ? (
            <div className="space-y-2">
              {errosTop.map((e, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-ds-border last:border-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: '#A1A1AA' }}>{e.frequencia}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-ds-m2">{ERRO_LABELS[e.categoria] || e.categoria}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-ds-muted text-sm">Sem dados</div>}
        </div>
      </div>

      {criticas.length > 0 && (
        <div>
          <Section>Conversas Críticas (Score ≤2)</Section>
          <div className="space-y-2">
            {criticas.map(c => {
              const scoreColor = SCORE_COLORS[c.score_qualidade ?? 1]
              return (
                <div key={c.id} className="bg-ds-surface border border-ds-border rounded-lg p-4 flex gap-4 items-start hover:border-ds-b2 transition-colors">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold font-disp"
                    style={{ background: `${scoreColor}20`, color: scoreColor }}
                  >
                    {c.score_qualidade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ds-text">{c.contato || '—'}</div>
                    <div className="text-[12px] text-ds-muted mt-0.5 line-clamp-2">{c.resumo}</div>
                    <div className="flex gap-3 mt-1.5 text-[11px] text-ds-muted">
                      {c.promessa_nao_cumprida && <span style={{ color: '#FF7A1A' }}>⚠ Promessa quebrada</span>}
                      {c.erro_operacional && <span style={{ color: '#A1A1AA' }}>✕ Erro operacional</span>}
                      {c.orcamento_perdido && <span style={{ color: '#71717A' }}>✗ Perdido</span>}
                      {c.nicho && <span>{c.nicho.replace(/_/g, ' ')}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <Section>Indicadores Operacionais</Section>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Promessas não cumpridas', value: flags.pnc, total: flags.total, color: '#FF7A1A', icon: '⚠️' },
            { label: 'Erros operacionais', value: flags.eo, total: flags.total, color: '#FF6A00', icon: '✕' },
            { label: 'Clientes insatisfeitos', value: panorama.clientes_insatisfeitos ?? 0, total: flags.total, color: '#A1A1AA', icon: '—' },
            { label: 'Sem follow-up', value: flags.total - flags.fu, total: flags.total, color: '#A1A1AA', icon: '○' },
          ].map(({ label, value, total, color, icon }) => {
            const pct = total ? (value / total * 100) : 0
            return (
              <div key={label} className="bg-ds-surface border border-ds-border rounded-lg p-4">
                <div className="text-xl mb-2">{icon}</div>
                <div className="font-disp font-extrabold text-2xl" style={{ color }}>{value}</div>
                <div className="text-[11px] text-ds-muted mt-0.5">{label}</div>
                <div className="mt-2 bg-ds-s2 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="text-[10px] text-ds-muted mt-1">{pct.toFixed(0)}% dos atend.</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
