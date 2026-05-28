import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SCHEMA = 'dermosauer'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabase.schema(SCHEMA)

  const [convs, panorama, erros, nichos, acertos, motivosPerda, produtos] = await Promise.all([
    db
      .from('analise_atendimento_whatsapp')
      .select('*')
      .eq('parse_error', false)
      .not('score_qualidade', 'is', null)
      .order('processado_em', { ascending: false }),

    db
      .from('vw_panorama_atendimento')
      .select('*')
      .limit(1)
      .single(),

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

  return NextResponse.json({
    conversations: convs.data ?? [],
    panorama: panorama.data ?? {},
    erros: erros.data ?? [],
    nichos: nichos.data ?? [],
    acertos: acertos.data ?? [],
    motivos_perda: motivosPerda.data ?? [],
    produtos: produtos.data ?? [],
  })
}
