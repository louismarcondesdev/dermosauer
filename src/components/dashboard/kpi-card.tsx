interface KpiCardProps {
  label: string
  value: string | number
  sub?: React.ReactNode
  variant?: string
}

const CARD_STYLE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 20,
  boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  padding: 28,
  transition: 'border-color 200ms, box-shadow 200ms',
}

export function KpiCard({ label, value, sub }: KpiCardProps) {
  const str = String(value ?? '—')
  const fontSize = str.length <= 5 ? 58 : str.length <= 8 ? 44 : str.length <= 12 ? 32 : str.length <= 16 ? 24 : 18

  return (
    <div
      style={CARD_STYLE}
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
      <div style={{ fontSize: 15, color: '#71717A', fontWeight: 500, marginBottom: 12, letterSpacing: '0.02em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize,
          fontWeight: 700,
          lineHeight: 1.05,
          color: '#FF6A00',
          letterSpacing: '-0.03em',
        }}
      >
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 14, color: '#4A4A4A', marginTop: 12, fontFamily: 'var(--font-dmmono)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
