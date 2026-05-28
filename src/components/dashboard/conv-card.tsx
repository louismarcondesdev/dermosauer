import type { Conversation } from '@/types'
import { fmtBRL, fmtDate } from '@/lib/formatters'
import { NICHO_LABELS, SCORE_COLORS, NICHO_COLORS } from '@/lib/constants'

interface ConvCardProps {
  conv: Conversation
  onClick: () => void
}

const BADGE = {
  background: 'rgba(255,106,0,0.12)',
  border: '1px solid rgba(255,106,0,0.18)',
  color: '#FF7A1A',
} as const

export function ConvCard({ conv: d, onClick }: ConvCardProps) {
  const score = d.score_qualidade ?? 0
  const scoreColor = SCORE_COLORS[score] ?? '#A1A1AA'
  const nichoLabel = NICHO_LABELS[d.nicho ?? ''] || d.nicho || '—'
  const nichoColor = NICHO_COLORS[d.nicho ?? ''] ?? '#71717A'
  const acertos = d.acertos_atendimento?.length ?? 0
  const erros = d.erros_atendimento?.length ?? 0

  const valueDisplay = d.valor_convertido
    ? { text: fmtBRL(d.valor_convertido), color: '#FF6A00' }
    : d.valor_orcamento
      ? { text: `${fmtBRL(d.valor_orcamento)} orç.`, color: '#A1A1AA' }
      : null

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col gap-3 cursor-pointer overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: '20px 20px 20px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.09)'
        el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.05)'
        el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Score left border accent */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
        style={{ background: scoreColor, boxShadow: `0 0 8px ${scoreColor}50` }}
      />

      <div className="flex justify-between items-start gap-2">
        <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, color: '#F5F5F5' }}>
          {d.contato || 'Contato desconhecido'}
        </div>
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: `${scoreColor}20`, color: scoreColor }}
        >
          {score}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
          style={{
            background: `${nichoColor}18`,
            color: nichoColor,
            border: `1px solid ${nichoColor}35`,
          }}
        >
          {nichoLabel}
        </span>
        {d.conversao_realizada && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={BADGE}>
            ✓ Convertido
          </span>
        )}
        {d.orcamento_perdido && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.08)' }}>
            ✗ Perdido
          </span>
        )}
        {d.medicamento_controlado && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={BADGE}>
            ⚠ Compliance
          </span>
        )}
      </div>

      {d.resumo && (
        <p
          style={{
            fontSize: 12,
            color: '#71717A',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {d.resumo}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: 11, color: '#3A3A3A', fontFamily: 'var(--font-dmmono)' }}>
            {d.periodo || fmtDate(d.processado_em)}
          </span>
          <div className="flex gap-3">
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FF6A00' }}>✓ {acertos} acertos</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A' }}>✗ {erros} erros</span>
          </div>
        </div>
        {valueDisplay && (
          <span style={{ fontFamily: 'var(--font-dmmono)', fontSize: 12, fontWeight: 600, color: valueDisplay.color }}>
            {valueDisplay.text}
          </span>
        )}
      </div>
    </div>
  )
}
