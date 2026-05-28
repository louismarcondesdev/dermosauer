'use client'

interface HeaderProps {
  lastUpdated: string | null
  onRefresh: () => void
  isRefreshing: boolean
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              marginBottom: 10,
            }}
          >
            DermoSauer
          </h1>
          <p style={{ fontSize: 15, color: '#71717A', fontWeight: 400 }}>
            Análise de atendimentos WhatsApp em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {/* Search premium */}
          <div
            className="flex items-center gap-2.5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: '0 16px',
              height: 44,
              width: 260,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#4A4A4A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar métricas, clientes..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#A1A1AA',
                fontSize: 13,
                width: '100%',
              }}
            />
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
            style={{
              background: 'rgba(255,106,0,0.08)',
              border: '1px solid rgba(255,106,0,0.15)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#FF6A00',
                boxShadow: '0 0 6px rgba(255,106,0,0.8)',
                animation: 'pulse-dot 2s infinite',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FF6A00', letterSpacing: '0.08em' }}>
              LIVE
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl cursor-pointer disabled:opacity-40 transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '10px 16px',
              color: '#71717A',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'rgba(255,106,0,0.3)'
              el.style.color = '#FF6A00'
              el.style.background = 'rgba(255,106,0,0.06)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'rgba(255,255,255,0.06)'
              el.style.color = '#71717A'
              el.style.background = 'rgba(255,255,255,0.03)'
            }}
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
              strokeLinecap="round" strokeLinejoin="round"
              className="w-3.5 h-3.5"
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {lastUpdated ? lastUpdated : isRefreshing ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
