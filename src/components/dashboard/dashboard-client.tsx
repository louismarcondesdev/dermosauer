'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/types'
import { fmtTime } from '@/lib/formatters'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { TabNav, type TabId } from './tab-nav'
import { TabVisaoGeral } from './tabs/tab-visao-geral'
import { TabFunil } from './tabs/tab-funil'
import { TabQualidade } from './tabs/tab-qualidade'
import { TabClientes } from './tabs/tab-clientes'
import { TabProdutos } from './tabs/tab-produtos'
import { TabCompliance } from './tabs/tab-compliance'
import { TabPlano } from './tabs/tab-plano'

interface DashboardClientProps {
  initialData: DashboardData
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard')
  if (!res.ok) throw new Error('Falha ao buscar dados')
  return res.json()
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('visao-geral')

  const { data, isFetching, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    initialData,
    staleTime: 60_000,
  })

  const handleRefresh = () => {
    refetch().then(() => setLastUpdated(fmtTime()))
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(180deg, #050505 0%, #070707 100%)' }}>
      <Sidebar active={activeTab} onChange={setActiveTab} />

      <main
        className="flex-1 min-w-0"
        style={{ marginLeft: 72, minHeight: '100vh' }}
      >
        <div className="max-w-[1540px] mx-auto" style={{ padding: '40px 40px 60px' }}>
          <Header
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />

          <TabNav active={activeTab} onChange={setActiveTab} />

          <div style={{ animation: 'fade-in 200ms ease' }} key={activeTab}>
            {activeTab === 'visao-geral' && <TabVisaoGeral data={data} />}
            {activeTab === 'funil'       && <TabFunil data={data} />}
            {activeTab === 'qualidade'   && <TabQualidade data={data} />}
            {activeTab === 'clientes'    && <TabClientes data={data} />}
            {activeTab === 'produtos'    && <TabProdutos data={data} />}
            {activeTab === 'compliance'  && <TabCompliance data={data} />}
            {activeTab === 'plano'       && <TabPlano data={data} />}
          </div>
        </div>
      </main>
    </div>
  )
}
