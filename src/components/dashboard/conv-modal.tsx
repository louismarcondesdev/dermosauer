'use client'

import * as Dialog from '@radix-ui/react-dialog'
import type { Conversation } from '@/types'
import { fmtBRL } from '@/lib/formatters'
import { NICHO_LABELS, SCORE_LABEL, SCORE_COLORS, NICHO_COLORS } from '@/lib/constants'

interface ConvModalProps {
  conv: Conversation | null
  onClose: () => void
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-ds-muted mb-2.5">
        {label}
      </div>
      {children}
    </div>
  )
}

export function ConvModal({ conv: d, onClose }: ConvModalProps) {
  if (!d) return null

  const score = d.score_qualidade ?? 0
  const scoreColor = SCORE_COLORS[score] ?? '#F5F5F5'
  const nichoColor = NICHO_COLORS[d.nicho ?? ''] ?? '#666666'

  const metricas: [string, React.ReactNode][] = [
    ['Tom do Atendente', d.tom_atendente || '—'],
    ['Tempo 1ª Resposta', d.tempo_primeira_resposta_humana_min != null ? `${d.tempo_primeira_resposta_humana_min}min` : '—'],
    ['Resolveu no 1º Contato', d.resolucao_primeiro_contato ? 'Sim' : 'Não'],
    ['Promessa Não Cumprida', d.promessa_nao_cumprida ? '⚠️ Sim' : 'Não'],
    ['Erro Operacional', d.erro_operacional ? '⚠️ Sim' : 'Não'],
    ['Cliente Recorrente', d.cliente_recorrente ? '✓ Sim' : 'Não'],
    ['Follow-up pós-orçamento', d.follow_up_pos_orcamento ? '✓ Sim' : 'Não'],
    ['Receituário Correto', d.receituario_solicitado_corretamente === null ? 'N/A' : d.receituario_solicitado_corretamente ? '✓ Sim' : '✗ Não'],
  ]

  return (
    <Dialog.Root open={!!d} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', animation: 'fade-in .2s ease' }}
        >
          <Dialog.Content
            className="w-full max-w-[780px] max-h-[90vh] overflow-y-auto bg-ds-surface border border-ds-b2 rounded-xl outline-none"
            style={{ animation: 'slide-up .25s ease' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-ds-surface border-b border-ds-border px-6 py-5 flex items-start justify-between gap-4 rounded-t-xl">
              <div className="flex-1">
                <Dialog.Title className="font-disp font-extrabold text-xl tracking-tight text-ds-text">
                  {d.contato || '—'}
                </Dialog.Title>
                <div className="flex gap-2.5 mt-1.5 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-ds-border bg-ds-s3"
                    style={{ color: nichoColor }}
                  >
                    {NICHO_LABELS[d.nicho ?? ''] || d.nicho || '—'}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: `${scoreColor}18`, color: scoreColor }}
                  >
                    Score {score} — {SCORE_LABEL[score] || '—'}
                  </span>
                  {d.tipo_demanda && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-ds-s3 text-ds-m2">
                      {d.tipo_demanda}
                    </span>
                  )}
                  {d.periodo && (
                    <span className="text-[11px] text-ds-muted font-mono">{d.periodo}</span>
                  )}
                </div>
              </div>
              <Dialog.Close
                className="w-[34px] h-[34px] rounded-lg shrink-0 bg-ds-s2 border border-ds-border text-ds-muted text-lg flex items-center justify-center hover:border-ds-danger hover:text-ds-danger transition-colors"
                aria-label="Fechar"
              >
                ✕
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="px-6 py-6 flex flex-col gap-[22px]">
              {d.medicamento_controlado && d.alerta_compliance && (
                <div className="bg-[var(--warn-dim)] border border-ds-warn/25 rounded-DEFAULT p-4 flex gap-3 items-start text-[13px] text-ds-warn">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div><strong>Alerta de Compliance</strong><br />{d.alerta_compliance}</div>
                </div>
              )}

              {d.analise_especialistas && (
                <Section label="Análise de Especialistas">
                  <div className="bg-ds-s2 border border-ds-border border-l-[3px] border-l-ds-accent rounded-DEFAULT px-[18px] py-4 text-[13px] leading-[1.7] text-ds-m2">
                    {d.analise_especialistas}
                  </div>
                </Section>
              )}

              <Section label="Dados Financeiros">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Orçado', value: fmtBRL(d.valor_orcamento), color: '#666666' },
                    { label: 'Convertido', value: fmtBRL(d.valor_convertido), color: '#FF6A00' },
                    {
                      label: 'Status',
                      value: d.conversao_realizada ? '✓ Convertido' : d.orcamento_perdido ? '✗ Perdido' : '—',
                      color: d.orcamento_perdido ? '#A1A1AA' : '#FF6A00',
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-ds-s2 border border-ds-border rounded-DEFAULT p-4">
                      <div className="text-[10px] text-ds-muted font-semibold uppercase tracking-wide mb-1">{label}</div>
                      <div className="font-mono text-lg font-medium" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>
                {d.motivo_perda && (
                  <p className="mt-2 text-xs text-ds-danger">
                    Motivo da perda: <strong>{d.motivo_perda.replace(/_/g, ' ')}</strong>
                  </p>
                )}
              </Section>

              {!!d.acertos_atendimento?.length && (
                <Section label="✅ Acertos no Atendimento">
                  <div className="flex flex-wrap gap-1.5">
                    {d.acertos_atendimento.map((a, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--ok-dim)] text-ds-ok border border-ds-ok/20"
                      >
                        ✓ {a.descricao || a.categoria}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {!!d.erros_atendimento?.length && (
                <Section label="❌ Oportunidades de Melhoria">
                  <div className="flex flex-wrap gap-1.5">
                    {d.erros_atendimento.map((e, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--danger-dim)] text-ds-danger border border-ds-danger/20"
                      >
                        ✗ {e.descricao || e.categoria}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {!!d.produtos_solicitados?.length && (
                <Section label="Produtos Solicitados">
                  <div className="flex flex-wrap gap-1.5">
                    {d.produtos_solicitados.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-ds-s3 text-ds-m2 border border-ds-border"
                      >
                        💊 {p}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              <Section label="Métricas do Atendimento">
                <div className="grid grid-cols-2 gap-2.5">
                  {metricas.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center px-3.5 py-2.5 bg-ds-s2 border border-ds-border rounded-DEFAULT"
                    >
                      <span className="text-xs text-ds-muted">{key}</span>
                      <span className="font-mono text-xs font-medium text-ds-m2">{value}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {d.cliente_insatisfeito && d.motivo_insatisfacao && (
                <div className="bg-[var(--danger-dim)] border border-ds-danger/25 rounded-DEFAULT p-4 flex gap-3 items-start text-[13px] text-ds-danger">
                  <span className="text-xl shrink-0">😞</span>
                  <div><strong>Cliente Insatisfeito</strong><br />{d.motivo_insatisfacao}</div>
                </div>
              )}

              {d.descricao_erro_operacional && (
                <div className="bg-[var(--warn-dim)] border border-ds-warn/25 rounded-DEFAULT p-4 flex gap-3 items-start text-[13px] text-ds-warn">
                  <span className="text-xl shrink-0">🔧</span>
                  <div><strong>Erro Operacional</strong><br />{d.descricao_erro_operacional}</div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
