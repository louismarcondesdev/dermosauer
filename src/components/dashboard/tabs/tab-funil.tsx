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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const MOTIVO_LABEL: Record<string, string> = {
  preco: 'Preço alto',
  sem_retorno: 'Sem retorno',
  concorrente: 'Concorrente',
  cliente_desistiu: 'Desistência',
  produto_indisponivel: 'Produto indisponível',
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

function FunnelStep({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 text-right text-[12px] text-ds-muted font-semibold shrink-0">{label}</div>
      <div className="flex-1 bg-ds-s2 rounded-full h-8 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center px-4 transition-all"
          style={{ width: `${pct}%`, background: color, minWidth: 40 }}
        >
          <span className="text-xs font-bold text-black/80">{value}</span>
        </div>
      </div>
      <div className="w-14 text-right font-mono text-[12px] shrink-0" style={{ color }}>
        {pct.toFixed(0)}%
      </div>
    </div>
  )
}

export function TabFunil({ data }: { data: DashboardData }) {
  const { conversations, motivos_perda, panorama } = data

  const funil = useMemo(() => {
    const total = conversations.length
    const comOrcamento = conversations.filter(c => c.valor_orcamento != null && c.valor_orcamento > 0).length
    const convertidos = conversations.filter(c => c.conversao_realizada).length
    const perdidos = conversations.filter(c => c.orcamento_perdido).length
    const receita = conversations.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const pipeline = conversations.reduce((s, c) => s + (c.valor_orcamento || 0), 0)
    const perdaTotal = motivos_perda.reduce((s, m) => s + Number(m['valor_perdido_r$'] || 0), 0)
    return { total, comOrcamento, convertidos, perdidos, receita, pipeline, perdaTotal }
  }, [conversations, motivos_perda])

  const followUp = useMemo(() => {
    const com = conversations.filter(c => c.follow_up_pos_orcamento)
    const sem = conversations.filter(c => !c.follow_up_pos_orcamento)
    const comConv = com.filter(c => c.conversao_realizada).length
    const semConv = sem.filter(c => c.conversao_realizada).length
    const comReceita = com.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const semReceita = sem.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    return {
      com: { total: com.length, conv: comConv, taxa: com.length ? (comConv / com.length * 100) : 0, receita: comReceita },
      sem: { total: sem.length, conv: semConv, taxa: sem.length ? (semConv / sem.length * 100) : 0, receita: semReceita },
    }
  }, [conversations])

  const recorrente = useMemo(() => {
    const rec = conversations.filter(c => c.cliente_recorrente)
    const novo = conversations.filter(c => !c.cliente_recorrente)
    const recReceita = rec.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    const novoReceita = novo.reduce((s, c) => s + (c.valor_convertido || 0), 0)
    return {
      rec: { total: rec.length, conv: rec.filter(c => c.conversao_realizada).length, receita: recReceita },
      novo: { total: novo.length, conv: novo.filter(c => c.conversao_realizada).length, receita: novoReceita },
    }
  }, [conversations])

  const motivoLabels = motivos_perda.map(m => MOTIVO_LABEL[m.motivo_perda] || m.motivo_perda)
  const motivoValues = motivos_perda.map(m => Number(m['valor_perdido_r$']))
  const motivoOcorr = motivos_perda.map(m => m.ocorrencias)

  const taxaConversao = funil.total ? (funil.convertidos / funil.total * 100) : 0
  const taxaFunil = funil.comOrcamento ? (funil.convertidos / funil.comOrcamento * 100) : 0

  return (
    <div className="space-y-7">
      <div>
        <Section>KPIs do Funil</Section>
        <div className="grid gap-3.5 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <Kpi label="Pipeline Total" value={fmtBRL(funil.pipeline)} color="#F5F5F5" />
          <Kpi label="Receita Gerada" value={fmtBRL(funil.receita)} sub={`ticket médio ${fmtBRL(panorama.ticket_medio_r$)}`} color="#FF6A00" />
          <Kpi label="Receita Perdida" value={fmtBRL(funil.perdaTotal)} sub={`${motivos_perda.reduce((s, m) => s + m.ocorrencias, 0)} orçamentos`} color="#FF6A00" />
          <Kpi label="Taxa Conversão" value={`${taxaConversao.toFixed(0)}%`} sub="de todos atend." color="#FF6A00" />
          <Kpi label="Conversão c/ Orc." value={`${taxaFunil.toFixed(0)}%`} sub="dos que orçaram" color="#FF8533" />
          <Kpi label="Perdas Evitáveis" value={motivos_perda.filter(m => m.motivo_perda === 'sem_retorno').reduce((s, m) => s + Number(m['valor_perdido_r$']), 0) > 0 ? fmtBRL(motivos_perda.filter(m => m.motivo_perda === 'sem_retorno').reduce((s, m) => s + Number(m['valor_perdido_r$']), 0)) : '—'} sub="sem retorno" color="#A1A1AA" />
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-5">Funil de Conversão</div>
          <div className="space-y-3">
            <FunnelStep label="Leads" value={funil.total} pct={100} color="#FF6A00" />
            <FunnelStep label="Com Orçamento" value={funil.comOrcamento} pct={funil.total ? funil.comOrcamento / funil.total * 100 : 0} color="#FF6A00" />
            <FunnelStep label="Convertidos" value={funil.convertidos} pct={funil.total ? funil.convertidos / funil.total * 100 : 0} color="#A1A1AA" />
            <FunnelStep label="Perdidos" value={funil.perdidos} pct={funil.total ? funil.perdidos / funil.total * 100 : 0} color="#FF6A00" />
          </div>
          <div className="mt-4 pt-4 border-t border-ds-border text-[11px] text-ds-muted space-y-1">
            <div>Leads sem orçamento: <strong className="text-ds-m2">{funil.total - funil.comOrcamento}</strong> — oportunidade de qualificação</div>
          </div>
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Motivos de Perda — por Valor</div>
          {motivos_perda.length > 0 ? (
            <Bar
              data={{
                labels: motivoLabels,
                datasets: [
                  { label: 'Valor Perdido (R$)', data: motivoValues, backgroundColor: '#FF6A0088', borderColor: '#FF6A00', borderWidth: 1, borderRadius: 4 },
                  { label: 'Ocorrências', data: motivoOcorr, backgroundColor: '#A1A1AA88', borderColor: '#A1A1AA', borderWidth: 1, borderRadius: 6, yAxisID: 'y1' },
                ],
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                plugins: { legend: { labels: { color: '#666666', font: { size: 11 } } }, tooltip: { callbacks: { label: (ctx) => ctx.datasetIndex === 0 ? ` R$ ${Number(ctx.raw).toFixed(2)}` : ` ${ctx.raw} caso(s)` } } },
                scales: {
                  x: { ticks: { color: '#4A4A4A' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                  y: { ticks: { color: '#4A4A4A', font: { size: 11 } }, grid: { display: false } },
                  y1: { display: false, position: 'right' as const },
                },
              }}
            />
          ) : <div className="text-ds-muted text-sm">Sem perdas registradas</div>}
        </div>
      </div>

      <div>
        <Section>Impacto do Follow-up na Conversão</Section>
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: 'Com Follow-up', d: followUp.com, color: '#FF6A00', icon: '✓' },
            { label: 'Sem Follow-up', d: followUp.sem, color: '#71717A', icon: '✗' },
          ].map(({ label, d, color, icon }) => (
            <div key={label} className="p-6 card-premium">
              <div className="flex items-center justify-between mb-3">
                <span className="font-disp font-bold text-sm text-ds-text">{label}</span>
                <span className="text-2xl font-disp font-extrabold" style={{ color }}>{d.taxa.toFixed(0)}%</span>
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  { k: 'Atendimentos', v: String(d.total) },
                  { k: 'Convertidos', v: `${d.conv} (${d.taxa.toFixed(0)}%)` },
                  { k: 'Receita Gerada', v: fmtBRL(d.receita) },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-ds-border last:border-0">
                    <span className="text-ds-muted">{k}</span>
                    <span className="font-mono font-medium text-ds-m2">{icon} {v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-[rgba(255,255,255,0.05)] border border-ds-warn/25 rounded-lg px-4 py-3 text-[12px] text-ds-warn">
          <strong>Oportunidade identificada:</strong> O follow-up aumenta a conversão em {(followUp.com.taxa - followUp.sem.taxa).toFixed(0)} pontos percentuais.
          {followUp.sem.total - followUp.sem.conv > 0 && (
            <> Existem <strong>{followUp.sem.total - followUp.sem.conv} atendimentos sem follow-up que não converteram</strong> — potencial de recuperação imediato.</>
          )}
        </div>
      </div>

      <div>
        <Section>Recorrentes vs Novos Clientes</Section>
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: 'Clientes Recorrentes', d: recorrente.rec, color: '#FF6A00' },
            { label: 'Clientes Novos', d: recorrente.novo, color: '#A1A1AA' },
          ].map(({ label, d, color }) => (
            <div key={label} className="p-6 card-premium">
              <div className="flex items-center justify-between mb-3">
                <span className="font-disp font-bold text-sm text-ds-text">{label}</span>
                <span className="text-2xl font-disp font-extrabold" style={{ color }}>{d.total}</span>
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  { k: 'Taxa conversão', v: d.total ? `${(d.conv / d.total * 100).toFixed(0)}%` : '—' },
                  { k: 'Receita total', v: fmtBRL(d.receita) },
                  { k: 'Ticket médio', v: d.conv ? fmtBRL(d.receita / d.conv) : '—' },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-ds-border last:border-0">
                    <span className="text-ds-muted">{k}</span>
                    <span className="font-mono font-medium text-ds-m2">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {motivos_perda.length > 0 && (
        <div>
          <Section>Detalhamento de Perdas</Section>
          <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.4)' }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-ds-border bg-ds-s2">
                  {['Motivo', 'Ocorrências', 'Valor Perdido', 'Ticket Médio Perdido', 'Ação Recomendada'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-ds-muted uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {motivos_perda.map((m) => {
                  const acoes: Record<string, string> = {
                    preco: 'Criar política de preço competitivo / desconto fidelidade',
                    sem_retorno: 'Implementar follow-up automático 24h após orçamento',
                    concorrente: 'Diferenciar com prazo, qualidade e atendimento',
                    cliente_desistiu: 'Reengajar com oferta especial',
                    produto_indisponivel: 'Ampliar portfólio ou oferecer substitutos',
                  }
                  return (
                    <tr key={m.motivo_perda} className="border-b border-ds-border transition-colors">
                      <td className="px-4 py-3 font-semibold text-ds-m2">{MOTIVO_LABEL[m.motivo_perda] || m.motivo_perda}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#A1A1AA' }}>{m.ocorrencias}x</td>
                      <td className="px-4 py-3 font-mono" style={{ color: '#FF6A00' }}>{fmtBRL(Number(m['valor_perdido_r$']))}</td>
                      <td className="px-4 py-3 font-mono text-ds-m2">{fmtBRL(Number(m['ticket_medio_perdido_r$']))}</td>
                      <td className="px-4 py-3 text-ds-muted">{acoes[m.motivo_perda] || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
