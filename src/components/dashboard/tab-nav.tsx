'use client'

export type TabId = 'visao-geral' | 'funil' | 'qualidade' | 'clientes' | 'produtos' | 'compliance' | 'plano'

const TABS: { id: TabId; label: string }[] = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'funil',        label: 'Funil de Vendas' },
  { id: 'qualidade',    label: 'Qualidade' },
  { id: 'clientes',     label: 'Clientes' },
  { id: 'produtos',     label: 'Produtos & Nichos' },
  { id: 'compliance',   label: 'Compliance' },
  { id: 'plano',        label: 'Plano de Ação' },
]

interface TabNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <div
      className="flex overflow-x-auto mb-10"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative pb-3.5 mr-7 text-[14px] font-medium whitespace-nowrap cursor-pointer shrink-0 transition-colors"
            style={{
              color: isActive ? '#FFFFFF' : '#4A4A4A',
              background: 'transparent',
              border: 'none',
              padding: '0 0 14px 0',
              marginRight: 28,
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#A1A1AA'
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#4A4A4A'
            }}
          >
            {t.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                  background: '#FF6A00',
                  boxShadow: '0 0 8px rgba(255,106,0,0.6)',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
