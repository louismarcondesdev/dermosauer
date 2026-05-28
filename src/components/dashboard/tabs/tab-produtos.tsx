'use client'

import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import type { DashboardData } from '@/types'
import { fmtBRL } from '@/lib/formatters'
import { NICHO_LABELS, NICHO_COLORS } from '@/lib/constants'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 16 }}>{children}</div>
  )
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

export function TabProdutos({ data }: { data: DashboardData }) {
  const { conversations, nichos, produtos } = data

  const nichoStats = useMemo(() => {
    return [...nichos]
      .filter(n => n['receita_r$'] != null || n.total_conversas > 0)
      .sort((a, b) => (b['receita_r$'] ?? 0) - (a['receita_r$'] ?? 0))
  }, [nichos])

  const topProdutos = produtos.slice(0, 15)

  const produtosComControlado = useMemo(() => {
    const set = new Set<string>()
    conversations.filter(c => c.medicamento_controlado).forEach(c => {
      (c.produtos_solicitados || []).forEach(p => set.add(p))
    })
    return Array.from(set).slice(0, 8)
  }, [conversations])

  const nichoOportunidades = useMemo(() => {
    return nichoStats.filter(n => {
      const perdas = n.perdas || 0
      const total = n.total_conversas || 1
      return perdas / total > 0.2 && total >= 3
    })
  }, [nichoStats])

  const totalReceita = nichoStats.reduce((s, n) => s + (n['receita_r$'] ?? 0), 0)

  const chartColors = topProdutos.map((_, i) => {
    const palette = ['#FF6A00', '#FF7A1A', '#A1A1AA', '#A1A1AA', '#A1A1AA', '#FF7A1A', '#A1A1AA', '#FF8533', '#A1A1AA', '#A1A1AA']
    return palette[i % palette.length] + '99'
  })

  return (
    <div className="space-y-7">
      <div>
        <Section>KPIs de Produtos & Nichos</Section>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}>
          <Kpi label="Nichos Ativos" value={nichoStats.length} sub="segmentos distintos" color="#FF6A00" />
          <Kpi label="Nicho Top Receita" value={NICHO_LABELS[nichoStats[0]?.nicho] || nichoStats[0]?.nicho || '—'} sub={fmtBRL(nichoStats[0]?.['receita_r$'])} color="#FF6A00" />
          <Kpi label="Maior Ticket Médio" value={fmtBRL(Math.max(...nichoStats.filter(n => n['ticket_medio_r$']).map(n => n['ticket_medio_r$']!)))} sub={NICHO_LABELS[nichoStats.find(n => n['ticket_medio_r$'] === Math.max(...nichoStats.filter(x => x['ticket_medio_r$']).map(x => x['ticket_medio_r$']!)))?.nicho ?? ''] ?? '—'} color="#A1A1AA" />
          <Kpi label="Produtos Distintos" value={topProdutos.length} sub="mais solicitados" color="#A1A1AA" />
          <Kpi label="Nichos c/ Alta Perda" value={nichoOportunidades.length} sub=">20% taxa perda" color="#FF6A00" />
          <Kpi label="Produto #1" value={topProdutos[0]?.produto || '—'} sub={`${topProdutos[0]?.frequencia ?? 0} solicitações`} color="#A1A1AA" />
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Top 15 Produtos Solicitados</div>
          {topProdutos.length > 0 ? (
            <Bar
              data={{
                labels: topProdutos.map(p => p.produto),
                datasets: [{
                  data: topProdutos.map(p => p.frequencia),
                  backgroundColor: topProdutos.map(() => 'rgba(255,106,0,0.55)'),
                  borderRadius: 6,
                }],
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} solicitações` } } },
                scales: {
                  x: { ticks: { color: '#4A4A4A' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                  y: { ticks: { color: '#4A4A4A', font: { size: 10 } }, grid: { display: false } },
                },
              }}
            />
          ) : <div className="text-ds-muted text-sm">Sem dados</div>}
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Receita por Nicho</div>
          <Bar
            data={{
              labels: nichoStats.slice(0, 10).map(n => NICHO_LABELS[n.nicho] || n.nicho),
              datasets: [{
                data: nichoStats.slice(0, 10).map(n => n['receita_r$'] ?? 0),
                backgroundColor: 'rgba(255,106,0,0.55)',
                borderColor: '#FF6A00',
                borderRadius: 6,
              }],
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` R$ ${Number(ctx.raw).toFixed(2)}` } } },
              scales: {
                x: { ticks: { color: '#4A4A4A' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: '#4A4A4A', font: { size: 10 } }, grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      <div>
        <Section>Matriz de Performance por Nicho</Section>
        <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.4)' }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-ds-border bg-ds-s2">
                {['Nicho', 'Atend.', 'Conv.', 'Taxa Conv.', 'Receita', 'Ticket Médio', 'Recorrentes', 'Score Médio', 'Perdas'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nichoStats.map((n) => {
                const color = NICHO_COLORS[n.nicho] || '#666666'
                const taxa = n.total_conversas ? (n.conversoes / n.total_conversas * 100) : 0
                const recTaxa = n.total_conversas ? (n.recorrentes / n.total_conversas * 100) : 0
                return (
                  <tr key={n.nicho} className="border-b border-ds-border transition-colors last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="font-medium text-ds-m2">{NICHO_LABELS[n.nicho] || n.nicho}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ds-muted">{n.total_conversas}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: '#FF6A00' }}>{n.conversoes}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-ds-s2 rounded-full h-1.5 w-12 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${taxa}%`, background: taxa >= 50 ? '#FF6A00' : '#71717A' }} />
                        </div>
                        <span className="font-mono text-[11px]" style={{ color: taxa >= 50 ? '#FF6A00' : '#71717A' }}>{taxa.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold" style={{ color: '#FF6A00' }}>{n['receita_r$'] ? fmtBRL(n['receita_r$']) : '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-ds-m2">{n['ticket_medio_r$'] ? fmtBRL(n['ticket_medio_r$']) : '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px]" style={{ color: recTaxa >= 70 ? '#FF6A00' : '#666666' }}>{n.recorrentes} ({recTaxa.toFixed(0)}%)</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: n.score_medio >= 4 ? '#FF6A00' : n.score_medio >= 3 ? '#FF7A1A' : '#A1A1AA' }}>{Number(n.score_medio).toFixed(1)}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: n.perdas > 0 ? '#FF6A00' : '#71717A' }}>{n.perdas}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-ds-s2 border-t border-ds-border">
                <td className="px-3 py-2.5 font-bold text-ds-text text-[11px]">TOTAL</td>
                <td className="px-3 py-2.5 font-mono font-bold text-ds-text">{nichoStats.reduce((s, n) => s + n.total_conversas, 0)}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-ds-ok">{nichoStats.reduce((s, n) => s + n.conversoes, 0)}</td>
                <td className="px-3 py-2.5 font-mono font-bold text-ds-accent">{nichoStats.length > 0 ? ((nichoStats.reduce((s, n) => s + n.conversoes, 0) / nichoStats.reduce((s, n) => s + n.total_conversas, 0)) * 100).toFixed(0) : 0}%</td>
                <td className="px-3 py-2.5 font-mono font-bold" style={{ color: '#FF6A00' }} colSpan={5}>{fmtBRL(totalReceita)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {nichoOportunidades.length > 0 && (
        <div>
          <Section>Nichos com Alta Taxa de Perda — Oportunidades</Section>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {nichoOportunidades.map(n => {
              const color = NICHO_COLORS[n.nicho] || '#666666'
              const perdaTaxa = n.total_conversas ? (n.perdas / n.total_conversas * 100) : 0
              return (
                <div key={n.nicho} className="rounded-lg p-4" style={{ background: '#0D0D0D', border: '1px solid rgba(255,106,0,0.2)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-disp font-bold text-sm" style={{ color }}>{NICHO_LABELS[n.nicho] || n.nicho}</span>
                    <span className="text-ds-danger font-mono text-sm font-bold">{perdaTaxa.toFixed(0)}% perda</span>
                  </div>
                  <div className="text-[12px] text-ds-muted space-y-1">
                    <div>{n.perdas} de {n.total_conversas} atendimentos perdidos</div>
                    <div>Score médio: <span className="font-mono">{Number(n.score_medio).toFixed(1)}</span></div>
                    {n['receita_r$'] && <div>Receita realizada: <span className="font-mono">{fmtBRL(n['receita_r$'])}</span></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {produtosComControlado.length > 0 && (
        <div>
          <Section>Produtos com Medicamento Controlado</Section>
          <div className="flex flex-wrap gap-2">
            {produtosComControlado.map((p, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-ds-warn/10 text-ds-warn border border-ds-warn/25">
                ⚠️ {p}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-ds-muted mt-2">Estes produtos foram solicitados em atendimentos com alerta de medicamento controlado. Verificação de receituário obrigatória.</p>
        </div>
      )}

      <div>
        <Section>Distribuição de Receita por Nicho</Section>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {nichoStats.filter(n => n['receita_r$']).map(n => {
            const color = NICHO_COLORS[n.nicho] || '#666666'
            const pct = totalReceita > 0 ? ((n['receita_r$'] ?? 0) / totalReceita * 100) : 0
            return (
              <div key={n.nicho} className="p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold" style={{ color }}>{NICHO_LABELS[n.nicho] || n.nicho}</span>
                  <span className="font-mono text-[11px] text-ds-muted">{pct.toFixed(1)}%</span>
                </div>
                <div className="rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="font-mono text-sm font-bold" style={{ color: '#FF6A00' }}>{fmtBRL(n['receita_r$'])}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
