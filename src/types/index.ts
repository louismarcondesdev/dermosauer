export type ScoreLevel = 1 | 2 | 3 | 4 | 5

export interface AcerroErro {
  categoria: string
  descricao?: string
}

export interface Conversation {
  id: number
  contato: string | null
  contato_input: string | null
  nicho: string | null
  tipo_demanda: string | null
  periodo: string | null
  total_interacoes: number | null
  processado_em: string | null
  score_qualidade: ScoreLevel | null
  resumo: string | null
  conversao_realizada: boolean | null
  orcamento_perdido: boolean | null
  medicamento_controlado: boolean | null
  alerta_compliance: string | null
  analise_especialistas: string | null
  valor_orcamento: number | null
  valor_convertido: number | null
  motivo_perda: string | null
  acertos_atendimento: AcerroErro[] | null
  erros_atendimento: AcerroErro[] | null
  pontos_positivos: AcerroErro[] | null
  pontos_melhoria: AcerroErro[] | null
  produtos_solicitados: string[] | null
  tom_atendente: string | null
  tempo_primeira_resposta_humana_min: number | null
  resolucao_primeiro_contato: boolean | null
  promessa_nao_cumprida: boolean | null
  descricao_promessa_nao_cumprida: string | null
  erro_operacional: boolean | null
  descricao_erro_operacional: string | null
  cliente_recorrente: boolean | null
  follow_up_pos_orcamento: boolean | null
  receituario_solicitado_corretamente: boolean | null
  cliente_insatisfeito: boolean | null
  motivo_insatisfacao: string | null
  parse_error: boolean | null
}

export interface Panorama {
  total_conversas: number | null
  score_medio: number | null
  atendimentos_bons: number | null
  atendimentos_criticos: number | null
  promessas_nao_cumpridas: number | null
  erros_operacionais: number | null
  clientes_insatisfeitos: number | null
  com_follow_up: number | null
  conversoes_realizadas: number | null
  clientes_recorrentes: number | null
  receita_r$: number | null
  ticket_medio_r$: number | null
  perdas_r$: number | null
  pipeline_r$: number | null
  tempo_resposta_medio_min: number | null
  alertas_compliance: number | null
}

export interface NichoPerformance {
  nicho: string
  total_conversas: number
  score_medio: number
  conversoes: number
  'receita_r$': number | null
  'ticket_medio_r$': number | null
  perdas: number
  recorrentes: number
  com_controlado: number
}

export interface FrequenciaItem {
  categoria: string
  frequencia: number
  exemplo?: string
}

export interface MotivoPerda {
  motivo_perda: string
  ocorrencias: number
  'valor_perdido_r$': number
  'ticket_medio_perdido_r$': number
}

export interface ProdutoFreq {
  produto: string
  frequencia: number
}

export interface DashboardData {
  conversations: Conversation[]
  panorama: Panorama
  nichos: NichoPerformance[]
  erros: FrequenciaItem[]
  acertos: FrequenciaItem[]
  motivos_perda: MotivoPerda[]
  produtos: ProdutoFreq[]
}

export interface ConversationFilters {
  search: string
  nicho: string
  score: string
  status: string
}
