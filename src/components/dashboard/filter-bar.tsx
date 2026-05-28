import type { ConversationFilters } from '@/types'
import { NICHO_LABELS } from '@/lib/constants'

interface FilterBarProps {
  filters: ConversationFilters
  onChange: (filters: ConversationFilters) => void
  nichoOptions: string[]
  totalFiltered: number
}

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  color: '#A1A1AA',
  fontSize: 13,
  padding: '9px 14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 200ms',
} as React.CSSProperties

export function FilterBar({ filters, onChange, nichoOptions, totalFiltered }: FilterBarProps) {
  const set = (patch: Partial<ConversationFilters>) =>
    onChange({ ...filters, ...patch })

  return (
    <div className="flex gap-2.5 items-center flex-wrap mb-6">
      <div
        className="flex items-center gap-2 flex-1 min-w-[220px]"
        style={{ ...INPUT_STYLE, padding: '9px 14px' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#3A3A3A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Buscar por nome ou produto…"
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#A1A1AA', fontSize: 13, width: '100%' }}
        />
      </div>

      <select
        value={filters.nicho}
        onChange={(e) => set({ nicho: e.target.value })}
        style={INPUT_STYLE}
        onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,106,0,0.3)' }}
        onBlur={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
      >
        <option value="">Todos os nichos</option>
        {nichoOptions.map((n) => (
          <option key={n} value={n} style={{ background: '#0D0D0D' }}>
            {NICHO_LABELS[n] || n}
          </option>
        ))}
      </select>

      <select
        value={filters.score}
        onChange={(e) => set({ score: e.target.value })}
        style={INPUT_STYLE}
        onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,106,0,0.3)' }}
        onBlur={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
      >
        <option value="">Todos os scores</option>
        <option value="5">Score 5 — Excelente</option>
        <option value="4">Score 4 — Bom</option>
        <option value="3">Score 3 — Regular</option>
        <option value="2">Score 2 — Ruim</option>
        <option value="1">Score 1 — Crítico</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => set({ status: e.target.value })}
        style={INPUT_STYLE}
        onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,106,0,0.3)' }}
        onBlur={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
      >
        <option value="">Todos</option>
        <option value="convertido">Convertidos</option>
        <option value="perdido">Perdidos</option>
        <option value="compliance">Compliance</option>
      </select>

      <span style={{ fontFamily: 'var(--font-dmmono)', fontSize: 12, color: '#3A3A3A', marginLeft: 'auto' }}>
        {totalFiltered} atendimento{totalFiltered !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
