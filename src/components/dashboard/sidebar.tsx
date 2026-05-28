'use client'

import type { TabId } from './tab-nav'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'visao-geral',
    label: 'Visão Geral',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'funil',
    label: 'Funil de Vendas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    ),
  },
  {
    id: 'qualidade',
    label: 'Qualidade',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'produtos',
    label: 'Produtos & Nichos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'plano',
    label: 'Plano de Ação',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={2.5} />
        <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={2.5} />
        <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={2.5} />
      </svg>
    ),
  },
]

interface SidebarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-50"
      style={{
        width: 72,
        background: '#050505',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Logo */}
      <div
        className="h-[68px] flex items-center justify-center shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] tracking-tight select-none"
          style={{
            background: 'linear-gradient(135deg, #FF6A00 0%, #FF7A1A 100%)',
            color: '#050505',
            boxShadow: '0 0 20px rgba(255,106,0,0.3)',
          }}
        >
          DS
        </div>
      </div>

      {/* Nav icons */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-1 overflow-y-auto">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              title={tab.label}
              className="relative flex items-center justify-center rounded-xl cursor-pointer transition-all"
              style={{
                width: 44,
                height: 44,
                color: isActive ? '#FF6A00' : '#4A4A4A',
                background: isActive ? 'rgba(255,106,0,0.08)' : 'transparent',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = '#A1A1AA'
                  el.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = '#4A4A4A'
                  el.style.background = 'transparent'
                }
              }}
            >
              {/* Active glow indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{
                    width: 3,
                    height: 22,
                    background: '#FF6A00',
                    boxShadow: '0 0 8px rgba(255,106,0,0.7), 0 0 16px rgba(255,106,0,0.3)',
                  }}
                />
              )}
              {tab.icon}
            </button>
          )
        })}
      </nav>

      {/* Bottom icons */}
      <div
        className="flex flex-col items-center pb-5 pt-4 gap-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <button
          className="flex items-center justify-center rounded-xl cursor-pointer transition-all"
          style={{ width: 44, height: 44, color: '#333333', transition: 'all 200ms' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#A1A1AA'
            el.style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.color = '#333333'
            el.style.background = 'transparent'
          }}
          title="Configurações"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
