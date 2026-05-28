'use client'

import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { DashboardData } from '@/types'
import { fmtBRL } from '@/lib/formatters'
import { NICHO_LABELS } from '@/lib/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

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

export function TabClientes({ data }: { data: DashboardData }) {
  const { conversations } = data

  const stats = useMemo(() => {
    const recorrentes = conversations.filter(c => c.cliente_recorrente)
    const novos = conversations.filter(c => !c.cliente_recorrente)
    const totalReceita = conversations.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const receitaRec = recorrentes.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const receitaNovo = novos.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const convRec = recorrentes.filter(c => c.conversao_realizada).length
    const convNovo = novos.filter(c => c.conversao_realizada).length
    const ltvMedio = recorrentes.length > 0 ? receitaRec / recorrentes.length : 0
    return { recorrentes, novos, totalReceita, receitaRec, receitaNovo, convRec, convNovo, ltvMedio }
  }, [conversations])

  const topClientes = useMemo(() => {
    const map: Record<string, { receita: number; conversoes: number; nicho: string; recorrente: boolean; score: number; count: number }> = {}
    conversations.forEach(c => {
      const nome = c.contato || 'Desconhecido'
      if (!map[nome]) map[nome] = { receita: 0, conversoes: 0, nicho: c.nicho || '', recorrente: !!c.cliente_recorrente, score: 0, count: 0 }
      map[nome].receita += c.valor_convertido || 0
      if (c.conversao_realizada) map[nome].conversoes++
      if (c.score_qualidade) { map[nome].score += c.score_qualidade; map[nome].count++ }
    })
    return Object.entries(map)
      .filter(([, v]) => v.receita > 0)
      .sort((a, b) => b[1].receita - a[1].receita)
      .slice(0, 10)
  }, [conversations])

  const segmentos = useMemo(() => {
    const matrix = [
      { label: 'Recorrente + Follow-up', filter: (c: typeof conversations[0]) => !!c.cliente_recorrente && !!c.follow_up_pos_orcamento },
      { label: 'Recorrente sem Follow-up', filter: (c: typeof conversations[0]) => !!c.cliente_recorrente && !c.follow_up_pos_orcamento },
      { label: 'Novo + Follow-up', filter: (c: typeof conversations[0]) => !c.cliente_recorrente && !!c.follow_up_pos_orcamento },
      { label: 'Novo sem Follow-up', filter: (c: typeof conversations[0]) => !c.cliente_recorrente && !c.follow_up_pos_orcamento },
    ]
    return matrix.map(seg => {
      const group = conversations.filter(seg.filter)
      const conv = group.filter(c => c.conversao_realizada).length
      const receita = group.reduce((s, c) => s + (c.valor_convertido || 0), 0)
      return { label: seg.label, total: group.length, conv, taxa: group.length ? (conv / group.length * 100) : 0, receita }
    })
  }, [conversations])

  const recTaxa = stats.recorrentes.length ? (stats.convRec / stats.recorrentes.length * 100) : 0
  const novoTaxa = stats.novos.length ? (stats.convNovo / stats.novos.length * 100) : 0

  return (
    <div className="space-y-7">
      <div>
        <Section>KPIs de Clientes</Section>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}>
          <Kpi label="Clientes Recorrentes" value={stats.recorrentes.length} sub={`${(stats.recorrentes.length / (conversations.length || 1) * 100).toFixed(0)}% do total`} color="#FF6A00" />
          <Kpi label="Clientes Novos" value={stats.novos.length} sub={`${(stats.novos.length / (conversations.length || 1) * 100).toFixed(0)}% do total`} color="#A1A1AA" />
          <Kpi label="LTV Médio (Recorrente)" value={fmtBRL(stats.ltvMedio)} sub="receita / cliente rec." color="#FF6A00" />
          <Kpi label="Receita de Recorrentes" value={fmtBRL(stats.receitaRec)} sub={`${stats.totalReceita ? (stats.receitaRec / stats.totalReceita * 100).toFixed(0) : 0}% da receita total`} color="#FF8533" />
          <Kpi label="Conv. Recorrentes" value={`${recTaxa.toFixed(0)}%`} sub={`${stats.convRec} de ${stats.recorrentes.length}`} color="#FF6A00" />
          <Kpi label="Conv. Novos" value={`${novoTaxa.toFixed(0)}%`} sub={`${stats.convNovo} de ${stats.novos.length}`} color="#A1A1AA" />
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '240px 1fr' }}>
        <div className="bg-ds-surface border border-ds-border rounded-lg p-5 flex flex-col">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Base de Clientes</div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative" style={{ width: 180, height: 180 }}>
              <Doughnut
                data={{
                  labels: ['Recorrentes', 'Novos'],
                  datasets: [{
                    data: [stats.recorrentes.length, stats.novos.length],
                    backgroundColor: ['#FF6A00', 'rgba(255,255,255,0.08)'],
                    borderWidth: 0,
                    hoverOffset: 4,
                  }],
                }}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
                  },
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="font-disp font-extrabold text-[24px] leading-none text-ds-accent">
                  {(stats.recorrentes.length / (conversations.length || 1) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-ds-muted mt-0.5">recorrentes</div>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-[12px]">
            {[
              { label: 'Recorrentes', v: stats.recorrentes.length, color: '#FF6A00' },
              { label: 'Novos', v: stats.novos.length, color: '#71717A' },
            ].map(({ label, v, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: color }} /><span className="text-ds-muted">{label}</span></div>
                <span className="font-mono font-medium text-ds-m2">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Matriz de Segmentação de Clientes</div>
          <div className="overflow-hidden rounded-DEFAULT border border-ds-border">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-ds-s2 border-b border-ds-border">
                  {['Segmento', 'Atend.', 'Convertidos', 'Taxa Conv.', 'Receita'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentos.map((seg, i) => {
                  const colors = ['#FF6A00', '#FF7A1A', '#A1A1AA', '#71717A']
                  return (
                    <tr key={i} className="border-b border-ds-border transition-colors last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i] }} />
                          <span className="font-medium text-ds-m2">{seg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-ds-muted">{seg.total}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#FF6A00' }}>{seg.conv}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold" style={{ color: colors[i] }}>{seg.taxa.toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ds-m2">{fmtBRL(seg.receita)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 bg-[rgba(255,106,0,0.08)] border border-ds-accent/20 rounded-DEFAULT px-3 py-2.5 text-[11px] text-ds-accent">
            <strong>Insight:</strong> Recorrentes com follow-up geram {segmentos[0]?.receita && segmentos[1]?.receita ? `${((segmentos[0].receita / (segmentos[1].receita || 1) - 1) * 100).toFixed(0)}% mais receita` : 'mais receita'} que recorrentes sem follow-up.
          </div>
        </div>
      </div>

      <div>
        <Section>Top Clientes por Receita</Section>
        <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.4)' }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-ds-border bg-ds-s2">
                {['#', 'Cliente', 'Nicho', 'Conversões', 'Receita Total', 'Score Médio', 'Tipo'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topClientes.map(([nome, v], i) => (
                <tr key={nome} className="border-b border-ds-border transition-colors last:border-0">
                  <td className="px-4 py-3 font-mono text-ds-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-ds-text">{nome}</td>
                  <td className="px-4 py-3 text-ds-muted">{NICHO_LABELS[v.nicho] || v.nicho || '—'}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: '#FF6A00' }}>{v.conversoes}x</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#FF6A00' }}>{fmtBRL(v.receita)}</td>
                  <td className="px-4 py-3 font-mono text-ds-accent">{v.count ? (v.score / v.count).toFixed(1) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${v.recorrente ? 'bg-ds-accent/15 text-ds-accent' : 'bg-[#A1A1AA]/15 text-[#A1A1AA]'}`}>
                      {v.recorrente ? 'Recorrente' : 'Novo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <Section>Oportunidades de Fidelização</Section>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {[
            {
              icon: '🔄',
              titulo: 'Clientes sem follow-up',
              valor: conversations.filter(c => !c.follow_up_pos_orcamento && c.cliente_recorrente).length,
              desc: 'Clientes recorrentes que não receberam follow-up — risco de perda silenciosa',
              color: '#A1A1AA',
            },
            {
              icon: '🆕',
              titulo: 'Novos sem conversão',
              valor: conversations.filter(c => !c.cliente_recorrente && !c.conversao_realizada).length,
              desc: 'Novos clientes que não converteram — oportunidade de reengajamento',
              color: '#71717A',
            },
            {
              icon: '⚠',
              titulo: 'Em risco (Score ≤2)',
              valor: conversations.filter(c => (c.score_qualidade ?? 5) <= 2 && c.cliente_recorrente).length,
              desc: 'Clientes recorrentes com experiência ruim — risco de churn imediato',
              color: '#FF6A00',
            },
          ].map(({ icon, titulo, valor, desc, color }) => (
            <div key={titulo} className="p-6 card-premium">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-disp font-extrabold text-3xl" style={{ color }}>{valor}</div>
              <div className="font-semibold text-sm text-ds-text mt-1">{titulo}</div>
              <div className="text-[12px] text-ds-muted mt-1.5 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
