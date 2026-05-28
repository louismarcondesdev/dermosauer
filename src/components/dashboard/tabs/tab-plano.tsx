'use client'

import { useMemo } from 'react'
import type { DashboardData } from '@/types'
import { fmtBRL } from '@/lib/formatters'

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 16 }}>{children}</div>
  )
}

interface Action {
  icon: string
  titulo: string
  especialista: string
  evidencia: string
  impacto: string
  passos: string[]
  prioridade: 'urgente' | 'importante' | 'estrategico'
  corImpacto: string
}

const PRIORIDADE_CONFIG = {
  urgente: { label: 'Esta Semana', color: '#FF6A00', bg: 'rgba(255,106,0,0.06)', border: 'rgba(255,106,0,0.2)', num: '01' },
  importante: { label: 'Próximos 30 Dias', color: '#FF7A1A', bg: 'rgba(255,122,26,0.05)', border: 'rgba(255,122,26,0.15)', num: '02' },
  estrategico: { label: '90 Dias', color: '#A1A1AA', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', num: '03' },
}

function ActionCard({ action }: { action: Action }) {
  const p = PRIORIDADE_CONFIG[action.prioridade]
  return (
    <div
      className="bg-ds-surface rounded-lg p-5 border"
      style={{ borderColor: p.border, background: `linear-gradient(135deg, ${p.bg}, transparent)` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl shrink-0">{action.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-disp font-bold text-sm text-ds-text leading-tight">{action.titulo}</div>
          <div className="text-[11px] mt-0.5" style={{ color: p.color }}>por {action.especialista}</div>
        </div>
        <div
          className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
          style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}
        >
          {p.num} {p.label}
        </div>
      </div>

      <div className="bg-ds-s2 border border-ds-border rounded-DEFAULT px-3 py-2.5 mb-3">
        <div className="text-[10px] text-ds-muted font-semibold uppercase tracking-wide mb-1">Evidência dos Dados</div>
        <div className="text-[12px] text-ds-m2 leading-relaxed">{action.evidencia}</div>
      </div>

      <div
        className="px-3 py-2 rounded-DEFAULT mb-3 text-[12px] font-semibold"
        style={{ background: `${action.corImpacto}15`, color: action.corImpacto, border: `1px solid ${action.corImpacto}30` }}
      >
        💡 Impacto Esperado: {action.impacto}
      </div>

      <div>
        <div className="text-[10px] text-ds-muted font-semibold uppercase tracking-wide mb-2">Como Implementar</div>
        <ol className="space-y-1.5">
          {action.passos.map((p, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-ds-muted">
              <span className="w-4 h-4 rounded-full bg-ds-s2 border border-ds-border text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function TabPlano({ data }: { data: DashboardData }) {
  const { conversations, motivos_perda, nichos } = data

  const insights = useMemo(() => {
    const total = conversations.length
    const comFollowUp = conversations.filter(c => c.follow_up_pos_orcamento).length
    const semFollowUp = total - comFollowUp
    const convComFU = conversations.filter(c => c.follow_up_pos_orcamento && c.conversao_realizada).length
    const convSemFU = conversations.filter(c => !c.follow_up_pos_orcamento && c.conversao_realizada).length
    const taxaComFU = comFollowUp ? (convComFU / comFollowUp * 100) : 0
    const taxaSemFU = semFollowUp ? (convSemFU / semFollowUp * 100) : 0
    const ganhoFU = taxaComFU - taxaSemFU

    const perdaPreco = motivos_perda.find(m => m.motivo_perda === 'preco')
    const perdaSemRetorno = motivos_perda.find(m => m.motivo_perda === 'sem_retorno')

    const recorrentes = conversations.filter(c => c.cliente_recorrente)
    const receitaRecorrentes = recorrentes.reduce((s, c) => s + (c.valor_convertido || 0), 0)

    const ortomolecular = nichos.find(n => n.nicho === 'ortomolecular_nutraceutico')
    const dermato = nichos.find(n => n.nicho === 'dermato_estetico')

    const controlados = conversations.filter(c => c.medicamento_controlado && c.alerta_compliance)
    const semReceita = controlados.filter(c => {
      const a = (c.alerta_compliance || '').toLowerCase()
      return a.includes('sem receita') || a.includes('sem solicitação') || a.includes('sem verificação') || a.includes('sem solicitar')
    })

    const tomExcelente = conversations.filter(c => c.tom_atendente === 'excelente')
    const tomNeutro = conversations.filter(c => c.tom_atendente === 'neutro')
    const convExcelente = tomExcelente.filter(c => c.conversao_realizada).length
    const convNeutro = tomNeutro.filter(c => c.conversao_realizada).length
    const taxaExcelente = tomExcelente.length ? (convExcelente / tomExcelente.length * 100) : 0
    const taxaNeutro = tomNeutro.length ? (convNeutro / tomNeutro.length * 100) : 0

    const scoreExcelente = tomExcelente.reduce((s, c) => s + (c.score_qualidade || 0), 0) / (tomExcelente.length || 1)

    return {
      ganhoFU, taxaComFU, taxaSemFU, semFollowUp,
      perdaPreco, perdaSemRetorno,
      recorrentes, receitaRecorrentes,
      ortomolecular, dermato,
      semReceita, controlados,
      tomExcelente, tomNeutro, taxaExcelente, taxaNeutro, scoreExcelente,
    }
  }, [conversations, motivos_perda, nichos])

  const actions: Action[] = [
    {
      icon: '📱',
      titulo: 'Implementar protocolo de follow-up para todos os orçamentos',
      especialista: 'Alex Hormozi + Neil Patel',
      evidencia: `Atendimentos COM follow-up convertem ${insights.taxaComFU.toFixed(0)}% vs ${insights.taxaSemFU.toFixed(0)}% SEM follow-up — diferença de ${insights.ganhoFU.toFixed(0)} pontos percentuais. Há ${insights.semFollowUp} atendimentos sem follow-up.`,
      impacto: `+${insights.ganhoFU.toFixed(0)}pp de conversão. Potencial de recuperar ${fmtBRL(insights.perdaSemRetorno ? Number(insights.perdaSemRetorno['valor_perdido_r$']) : 0)} em orçamentos sem retorno.`,
      passos: [
        'Definir gatilho: toda conversa com orçamento enviado',
        'Criar template no WhatsApp: "[Nome], tudo bem? Vi que você pediu orçamento do [produto]. Posso confirmar a disponibilidade para você?"',
        'Follow-up em até 24h após orçamento sem resposta',
        'Segunda tentativa após 48h se sem retorno',
        'Registrar no histórico do cliente',
      ],
      prioridade: 'urgente',
      corImpacto: '#FF6A00',
    },
    {
      icon: '⭐',
      titulo: 'Treinar toda a equipe no padrão "tom excelente"',
      especialista: 'CX Health Specialist + Ann Handley',
      evidencia: `Tom "excelente" → score ${insights.scoreExcelente.toFixed(1)} e ${insights.taxaExcelente.toFixed(0)}% de conversão. Tom "neutro" → ${insights.taxaNeutro.toFixed(0)}% de conversão. Apenas ${insights.tomExcelente.length} de ${conversations.length} atendimentos atingiram esse padrão.`,
      impacto: `Elevar score médio de 3.6 → 4.2+. Aumentar conversão em até ${(insights.taxaExcelente - insights.taxaNeutro).toFixed(0)}pp nos atendimentos com tom neutro.`,
      passos: [
        'Gravar os 3 atendimentos com score 5 como material de treinamento',
        'Criar protocolo: emojis moderados, tratamento "amigo/amiga", personalização com nome',
        'Fazer auditoria semanal de 5 atendimentos por atendente',
        'Feedback semanal em reunião de equipe (celebrar acertos, corrigir neutros)',
      ],
      prioridade: 'urgente',
      corImpacto: '#FF6A00',
    },
    {
      icon: '🔀',
      titulo: 'Eliminar respostas de negativa sem oferecer alternativa',
      especialista: 'Alex Hormozi + Ann Handley',
      evidencia: `Score ≤2 ocorre majoritariamente quando a farmácia responde "não temos" sem sugerir substituto. Nichos mais afetados: Dermato/Estético (score 2.67) e Pediátrico (score 2.50). Cada negativa sem alternativa = oportunidade perdida.`,
      impacto: `Reduzir atendimentos score ≤2 em 60%+. Aumentar receita no nicho dermato de ${fmtBRL(insights.dermato?.['receita_r$'])} com potencial de dobrar.`,
      passos: [
        'Mapear os 15 produtos mais pedidos que a farmácia não manipula',
        'Para cada um, listar 2-3 alternativas disponíveis com efeito similar',
        'Criar script: "Não manipulamos X, mas temos Y que tem ação similar. Posso fazer um orçamento?"',
        'Treinar equipe com role-play semanal de situações de "não temos"',
      ],
      prioridade: 'urgente',
      corImpacto: '#FF7A1A',
    },
    {
      icon: '🔐',
      titulo: 'Implementar checklist de compliance para controlados',
      especialista: 'Gestor Sênior de Clínicas',
      evidencia: `${insights.semReceita.length} atendimentos com controlados dispensados sem verificação adequada de receituário — risco legal grave. Medicamentos identificados: doxazosina, oxibutinina, clonazepam, ivermectina.`,
      impacto: `Eliminar risco de multa sanitária e suspensão do alvará. Proteção legal e reputacional da farmácia.`,
      passos: [
        'Criar lista de todos os controlados que a farmácia manipula (RDC 471/2021)',
        'Template padrão: "Para manipular [controlado], preciso da receita antes de confirmar o orçamento"',
        'Nunca confirmar preço ou disponibilidade de controlado sem ver a receita',
        'Treinamento obrigatório da equipe com a lista atualizada',
        'Revisar os casos de alto risco identificados e contatar os clientes para regularização',
      ],
      prioridade: 'importante',
      corImpacto: '#FF6A00',
    },
    {
      icon: '💰',
      titulo: 'Criar política de desconto por fidelidade para combater perda por preço',
      especialista: 'Alex Hormozi',
      evidencia: `Perda por "preço" = ${fmtBRL(insights.perdaPreco ? Number(insights.perdaPreco['valor_perdido_r$']) : 0)} perdidos, ticket médio ${fmtBRL(insights.perdaPreco ? Number(insights.perdaPreco['ticket_medio_perdido_r$']) : 0)} por caso. ${insights.recorrentes.length} clientes recorrentes são potencial base de programa.`,
      impacto: `Reduzir perda por preço em 50%+. Aumentar LTV dos clientes recorrentes. Potencial de recuperar ${fmtBRL(insights.perdaPreco ? Number(insights.perdaPreco['valor_perdido_r$']) : 0)}/período.`,
      passos: [
        'Criar 3 tiers: Bronze (1-2 compras), Prata (3-5), Ouro (6+)',
        'Descontos progressivos: 3%, 5%, 8% sobre preço de lista',
        'Protocolo de retenção: "Se encontrar mais barato em outra farmácia magistral, nos avise — vamos igualar ou superar"',
        'Comunicar o programa via WhatsApp para base atual de recorrentes',
      ],
      prioridade: 'importante',
      corImpacto: '#FF6A00',
    },
    {
      icon: '🧬',
      titulo: 'Acelerar crescimento do nicho Ortomolecular',
      especialista: 'Brian Dean + Neil Patel',
      evidencia: `Ortomolecular = ${fmtBRL(insights.ortomolecular?.['receita_r$'])} (maior receita por nicho), ticket médio ${fmtBRL(insights.ortomolecular?.['ticket_medio_r$'])}, ${insights.ortomolecular?.recorrentes}/${insights.ortomolecular?.total_conversas} recorrentes (${insights.ortomolecular?.total_conversas ? ((insights.ortomolecular.recorrentes / insights.ortomolecular.total_conversas) * 100).toFixed(0) : 0}%). Maior ROI do portfólio.`,
      impacto: `Aumentar participação de receita de 40% → 55%. Criar fonte de receita recorrente e previsível.`,
      passos: [
        'Criar catálogo visual de formulações ortomoleculares mais solicitadas',
        'Contatar os 3-5 médicos ortomoleculares da região para parceria',
        'Conteúdo educativo semanal no WhatsApp: "Você sabia que a vitamina D3+K2 magistral tem absorção X% maior?"',
        'Criar protocolos completos (ex: protocolo emagrecimento, protocolo imunidade) para prescrição médica',
      ],
      prioridade: 'importante',
      corImpacto: '#FF6A00',
    },
    {
      icon: '🔄',
      titulo: 'Programa de Relacionamento com Clientes Recorrentes',
      especialista: 'Gary Vaynerchuk + CX Health Specialist',
      evidencia: `${insights.recorrentes.length} recorrentes geram ${fmtBRL(insights.receitaRecorrentes)} (${conversations.reduce((s, c) => s + (c.valor_convertido || 0), 0) > 0 ? ((insights.receitaRecorrentes / conversations.reduce((s, c) => s + (c.valor_convertido || 0), 0)) * 100).toFixed(0) : 0}% da receita total). Custo de retenção é 5x menor que aquisição.`,
      impacto: 'Aumentar frequência de compra dos recorrentes em 20%. Reduzir churn silencioso.',
      passos: [
        'CRM básico no WhatsApp: lembrete mensal de reposição baseado no histórico de produtos',
        'Mensagem de aniversário com desconto especial',
        'A cada 5ª compra: brinde ou desconto surpresa',
        'Áudio personalizado do farmacêutico para clientes VIP (Ouro)',
        'Criar grupo VIP no WhatsApp para novidades e lançamentos',
      ],
      prioridade: 'estrategico',
      corImpacto: '#FF6A00',
    },
    {
      icon: '📊',
      titulo: 'Monitoramento semanal de KPIs de atendimento',
      especialista: 'Neil Patel + Gestor Sênior de Clínicas',
      evidencia: `Sem acompanhamento contínuo, problemas são detectados tarde. Actualmente, ${conversations.filter(c => (c.score_qualidade ?? 5) <= 2).length} atendimentos críticos identificados após o fato.`,
      impacto: 'Reduzir tempo de detecção de problemas de semanas para dias. Decisões baseadas em dados.',
      passos: [
        'Reunião semanal de 30min com indicadores: score médio, taxa conversão, erros operacionais',
        'Alerta automático no n8n: qualquer orçamento sem resposta após 24h → notificar gestor',
        'Relatório mensal automatizado com evolução dos KPIs',
        'Meta trimestral: score médio ≥4.0, taxa conversão ≥90%, zero alto risco compliance',
      ],
      prioridade: 'estrategico',
      corImpacto: '#A1A1AA',
    },
    {
      icon: '🤝',
      titulo: 'Parcerias B2B com clínicas e consultórios',
      especialista: 'Brian Dean + Alex Hormozi',
      evidencia: `1 parceria B2B perdida identificada (Camila Dal Pai — protocolo melasma). Nicho dermatológico tem demanda mas baixo score. Prescritores = canal multiplicador de receita.`,
      impacto: 'Cada parceria com médico prescritivo = R$2.000-5.000/mês em receita recorrente garantida.',
      passos: [
        'Mapear 10 consultórios de especialidades mais solicitadas: dermatologia, neurologia, nutrologia',
        'Criar kit de apresentação: portfólio de formulações, prazo de entrega, processo de orçamento B2B',
        'Propor visita do farmacêutico responsável para apresentação pessoal',
        'Oferecer canal exclusivo de atendimento (número/grupo específico) para prescritores',
        'Criar protocolo de formulações personalizadas por especialidade',
      ],
      prioridade: 'estrategico',
      corImpacto: '#71717A',
    },
  ]

  const urgentes = actions.filter(a => a.prioridade === 'urgente')
  const importantes = actions.filter(a => a.prioridade === 'importante')
  const estrategicos = actions.filter(a => a.prioridade === 'estrategico')

  const totalReceita = conversations.reduce((s, c) => s + (c.valor_convertido || 0), 0)
  const totalPipeline = conversations.reduce((s, c) => s + (c.valor_orcamento || 0), 0)

  return (
    <div className="space-y-7">
      <div className="bg-ds-s2 border border-ds-border rounded-lg p-5">
        <div className="font-disp font-bold text-base text-ds-text mb-2">Diagnóstico Executivo — Dermosauer</div>
        <p className="text-[13px] text-ds-m2 leading-relaxed mb-4">
          Com base na análise de <strong>{conversations.length} atendimentos</strong>, a farmácia apresenta uma base sólida —
          taxa de conversão alta, {insights.recorrentes.length} clientes recorrentes ({(insights.recorrentes.length / conversations.length * 100).toFixed(0)}% do total) e
          receita de {fmtBRL(totalReceita)}. Os principais pontos de melhoria estão em <strong>follow-up sistemático</strong>,
          <strong> padronização do tom de atendimento</strong> e <strong>conformidade em medicamentos controlados</strong>.
          O nicho Ortomolecular representa a maior oportunidade de expansão imediata.
        </p>
        <div className="grid gap-3 grid-cols-3">
          {[
            { label: 'Ações Esta Semana', value: urgentes.length, color: '#FF6A00' },
            { label: 'Ações em 30 Dias', value: importantes.length, color: '#FF7A1A' },
            { label: 'Ações em 90 Dias', value: estrategicos.length, color: '#FF6A00' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center bg-ds-surface border border-ds-border rounded-DEFAULT p-3">
              <div className="font-disp font-extrabold text-2xl" style={{ color }}>{value}</div>
              <div className="text-[11px] text-ds-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Section>Urgente — Implementar Esta Semana</Section>
        <div className="space-y-4">
          {urgentes.map((a, i) => <ActionCard key={i} action={a} />)}
        </div>
      </div>

      <div>
        <Section>Importante — Próximos 30 Dias</Section>
        <div className="space-y-4">
          {importantes.map((a, i) => <ActionCard key={i} action={a} />)}
        </div>
      </div>

      <div>
        <Section>Estratégico — 90 Dias</Section>
        <div className="space-y-4">
          {estrategicos.map((a, i) => <ActionCard key={i} action={a} />)}
        </div>
      </div>

      <div className="p-6 card-premium">
        <div className="font-disp font-bold text-sm text-ds-text mb-4">📈 Potencial de Melhoria — Resumo Financeiro</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { label: 'Receita atual', value: fmtBRL(totalReceita), color: '#FF6A00', icon: '↑' },
            { label: 'Pipeline não convertido', value: fmtBRL(totalPipeline - totalReceita), color: '#FF7A1A', icon: '○' },
            { label: 'Perdido por "sem retorno"', value: fmtBRL(insights.perdaSemRetorno ? Number(insights.perdaSemRetorno['valor_perdido_r$']) : 0), color: '#A1A1AA', icon: '—' },
            { label: 'Perdido por "preço"', value: fmtBRL(insights.perdaPreco ? Number(insights.perdaPreco['valor_perdido_r$']) : 0), color: '#71717A', icon: '✕' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-ds-s2 border border-ds-border rounded-DEFAULT p-3.5">
              <div className="text-xl mb-1.5">{icon}</div>
              <div className="font-mono font-bold text-lg" style={{ color }}>{value}</div>
              <div className="text-[11px] text-ds-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
