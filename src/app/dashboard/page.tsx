import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { DashboardData } from '@/types'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

const SCHEMA = 'dermosauer'

async function fetchInitialData(): Promise<DashboardData> {
  const supabase = await createClient()
  const db = supabase.schema(SCHEMA)

  const [convs, panorama, erros, nichos, acertos, motivosPerda, produtos] = await Promise.all([
    db
      .from('analise_atendimento_whatsapp')
      .select('*')
      .eq('parse_error', false)
      .not('score_qualidade', 'is', null)
      .order('processado_em', { ascending: false }),

    db.from('vw_panorama_atendimento').select('*').limit(1).single(),

    db
      .from('vw_erros_frequentes')
      .select('categoria,frequencia')
      .order('frequencia', { ascending: false })
      .limit(8),

    db
      .from('vw_performance_nicho')
      .select('*')
      .order('receita_r$', { ascending: false }),

    db
      .from('vw_acertos_frequentes')
      .select('categoria,frequencia,exemplo')
      .order('frequencia', { ascending: false })
      .limit(8),

    db
      .from('vw_motivos_perda')
      .select('*')
      .order('valor_perdido_r$', { ascending: false }),

    db
      .from('vw_produtos_frequentes')
      .select('*')
      .order('frequencia', { ascending: false })
      .limit(20),
  ])

  return {
    conversations: (convs.data ?? []) as DashboardData['conversations'],
    panorama: (panorama.data ?? {}) as DashboardData['panorama'],
    erros: (erros.data ?? []) as DashboardData['erros'],
    nichos: (nichos.data ?? []) as DashboardData['nichos'],
    acertos: (acertos.data ?? []) as DashboardData['acertos'],
    motivos_perda: (motivosPerda.data ?? []) as DashboardData['motivos_perda'],
    produtos: (produtos.data ?? []) as DashboardData['produtos'],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const initialData = await fetchInitialData()

  return <DashboardClient initialData={initialData} />
}
