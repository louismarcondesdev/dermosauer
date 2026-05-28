'use client'

import { useMemo } from 'react'
import type { DashboardData } from '@/types'
import { NICHO_LABELS } from '@/lib/constants'
import { fmtDate } from '@/lib/formatters'

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

type RiskLevel = 'alto' | 'medio' | 'ok'

function classifyRisk(alerta: string | null): RiskLevel {
  if (!alerta) return 'ok'
  const a = alerta.toLowerCase()
  const keywords = ['sem receita', 'sem solicitação', 'inadequado', 'sem verificação', 'sem evidência', 'liberou', 'sem solicitar']
  if (keywords.some(k => a.includes(k))) return 'alto'
  if (a.includes('corretamente') || a.includes('adequadamente') || a.includes('solicitada')) return 'ok'
  return 'medio'
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: string }> = {
  alto: { label: 'Risco Alto', color: '#FF6A00', bg: 'rgba(255,106,0,0.08)', border: 'rgba(255,106,0,0.18)', icon: '🚨' },
  medio: { label: 'Atenção', color: '#A1A1AA', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', icon: '⚠️' },
  ok: { label: 'Conforme', color: '#FF7A1A', bg: 'rgba(255,106,0,0.08)', border: 'rgba(255,106,0,0.18)', icon: '✅' },
}

export function TabCompliance({ data }: { data: DashboardData }) {
  const { conversations } = data

  const complianceData = useMemo(() => {
    const todos = conversations.filter(c => c.medicamento_controlado || c.alerta_compliance)
    const comAlerta = todos.filter(c => c.alerta_compliance)
    const classified = comAlerta.map(c => ({ ...c, risk: classifyRisk(c.alerta_compliance) }))
    const altoRisco = classified.filter(c => c.risk === 'alto')
    const atencao = classified.filter(c => c.risk === 'medio')
    const conforme = classified.filter(c => c.risk === 'ok')
    const semReceita = conversations.filter(c =>
      c.receituario_solicitado_corretamente === false && c.medicamento_controlado
    )
    return { todos, comAlerta, classified, altoRisco, atencao, conforme, semReceita }
  }, [conversations])

  const porNicho = useMemo(() => {
    const map: Record<string, number> = {}
    complianceData.todos.forEach(c => {
      const nicho = c.nicho || 'Não informado'
      map[nicho] = (map[nicho] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [complianceData.todos])

  const { classified } = complianceData

  return (
    <div className="space-y-7">
      <div>
        <Section>KPIs de Compliance</Section>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }}>
          <Kpi label="Total com Controlado" value={complianceData.todos.length} sub="atendimentos" color="#A1A1AA" />
          <Kpi label="Alto Risco" value={complianceData.altoRisco.length} sub="controlado sem receita" color="#FF6A00" />
          <Kpi label="Em Atenção" value={complianceData.atencao.length} sub="verificar protocolo" color="#FF6A00" />
          <Kpi label="Conformes" value={complianceData.conforme.length} sub="receita solicitada" color="#FF6A00" />
          <Kpi label="Receita Não Solicitada" value={complianceData.semReceita.length} sub="ocorrências registradas" color="#FF6A00" />
          <Kpi label="Taxa Conformidade" value={complianceData.comAlerta.length ? `${(complianceData.conforme.length / complianceData.comAlerta.length * 100).toFixed(0)}%` : '—'} sub="dos alertas registrados" color="#FF6A00" />
        </div>
      </div>

      {complianceData.altoRisco.length > 0 && (
        <div>
          <Section>🚨 Alertas de Alto Risco</Section>
          <div className="space-y-2">
            {complianceData.altoRisco.map(c => (
              <div key={c.id} className="rounded-lg p-4" style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.18)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-semibold text-sm text-ds-text">{c.contato || '—'}</span>
                    <span className="ml-2 text-[11px] text-ds-muted font-mono">{fmtDate(c.processado_em)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.nicho && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ds-s2 text-ds-muted border border-ds-border">
                        {NICHO_LABELS[c.nicho] || c.nicho}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(255,106,0,0.12)] text-[#FF6A00] border border-[rgba(255,106,0,0.18)]">
                      🚨 Alto Risco
                    </span>
                  </div>
                </div>
                <p className="text-[12px]" style={{ color: '#A1A1AA' }}>{c.alerta_compliance}</p>
                {c.resumo && <p className="text-[11px] text-ds-muted mt-1.5 line-clamp-2">{c.resumo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {complianceData.atencao.length > 0 && (
        <div>
          <Section>⚠️ Casos para Atenção</Section>
          <div className="space-y-2">
            {complianceData.atencao.map(c => (
              <div key={c.id} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <span className="font-semibold text-sm text-ds-text">{c.contato || '—'}</span>
                    <span className="ml-2 text-[11px] text-ds-muted font-mono">{fmtDate(c.processado_em)}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(255,255,255,0.06)] text-[#A1A1AA] border border-[rgba(255,255,255,0.08)] shrink-0">⚠️ Atenção</span>
                </div>
                <p className="text-[12px]" style={{ color: '#A1A1AA' }}>{c.alerta_compliance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Distribuição por Nível de Risco</div>
          {[
            { label: 'Alto Risco', count: complianceData.altoRisco.length, config: RISK_CONFIG.alto },
            { label: 'Em Atenção', count: complianceData.atencao.length, config: RISK_CONFIG.medio },
            { label: 'Conforme', count: complianceData.conforme.length, config: RISK_CONFIG.ok },
          ].map(({ label, count, config }) => {
            const pct = complianceData.comAlerta.length ? (count / complianceData.comAlerta.length * 100) : 0
            return (
              <div key={label} className="mb-3">
                <div className="flex items-center justify-between mb-1 text-[12px]">
                  <span className="flex items-center gap-1.5"><span>{config.icon}</span><span style={{ color: config.color }}>{label}</span></span>
                  <span className="font-mono font-bold" style={{ color: config.color }}>{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: config.color }} />
                </div>
              </div>
            )
          })}
          <div className="mt-4 pt-4 border-t border-ds-border">
            <div className="text-[11px] text-ds-muted space-y-1.5">
              <div className="flex justify-between">
                <span>Total com controlado:</span>
                <span className="font-mono font-medium text-ds-warn">{complianceData.todos.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Com alerta registrado:</span>
                <span className="font-mono font-medium text-ds-m2">{complianceData.comAlerta.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Sem alerta (controlado implícito):</span>
                <span className="font-mono font-medium text-ds-m2">{complianceData.todos.length - complianceData.comAlerta.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 card-premium">
          <div className="font-disp font-bold text-sm text-ds-text mb-4">Controlados por Nicho</div>
          <div className="space-y-2.5">
            {porNicho.map(([nicho, count]) => {
              const pct = complianceData.todos.length ? (count / complianceData.todos.length * 100) : 0
              return (
                <div key={nicho}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-ds-m2">{NICHO_LABELS[nicho] || nicho}</span>
                    <span className="font-mono" style={{ color: '#FF6A00' }}>{count}</span>
                  </div>
                  <div className="rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#A1A1AA' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {complianceData.conforme.length > 0 && (
        <div>
          <Section>✅ Atendimentos Conformes — Boas Práticas</Section>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {complianceData.conforme.slice(0, 6).map(c => (
              <div key={c.id} className="rounded-DEFAULT p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-semibold text-[12px] text-ds-text mb-1">{c.contato || '—'}</div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#71717A' }}>{c.alerta_compliance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg p-5" style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-disp font-bold text-sm mb-3" style={{ color: '#FF6A00' }}>📋 Protocolo de Compliance — Referência</div>
        <div className="grid gap-3 text-[12px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { icon: '1', text: 'Sempre solicitar receita ANTES de informar o valor ou confirmar disponibilidade de controlado' },
            { icon: '2', text: 'RDC 471/2021 — Verificação e registro do receituário é obrigatório para psicotrópicos' },
            { icon: '3', text: 'Nunca liberar controlado "fiado" de receita, mesmo para cliente habitual' },
            { icon: '4', text: 'Antibióticos de uso restrito também requerem verificação de prescrição médica' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,106,0,0.12)', color: '#FF6A00' }}>{icon}</div>
              <p className="text-ds-muted leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {classified.length > 0 && (
        <div>
          <Section>Todos os Alertas de Compliance</Section>
          <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.4)' }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-ds-s2 border-b border-ds-border">
                  {['Risco', 'Cliente', 'Nicho', 'Alerta', 'Data'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classified.map(c => {
                  const cfg = RISK_CONFIG[c.risk]
                  return (
                    <tr key={c.id} className="border-b border-ds-border transition-colors last:border-0">
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ds-text">{c.contato || '—'}</td>
                      <td className="px-4 py-3 text-ds-muted">{NICHO_LABELS[c.nicho ?? ''] || c.nicho || '—'}</td>
                      <td className="px-4 py-3 text-ds-muted max-w-[300px]"><span className="line-clamp-2">{c.alerta_compliance}</span></td>
                      <td className="px-4 py-3 font-mono text-ds-muted">{fmtDate(c.processado_em)}</td>
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
