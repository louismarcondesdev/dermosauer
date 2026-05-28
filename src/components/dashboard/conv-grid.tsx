import type { Conversation } from '@/types'
import { ConvCard } from './conv-card'

interface ConvGridProps {
  conversations: Conversation[]
  onSelect: (conv: Conversation) => void
}

export function ConvGrid({ conversations, onSelect }: ConvGridProps) {
  if (!conversations.length) {
    return (
      <div className="py-16 text-center text-ds-muted">
        <div className="text-4xl mb-3">🔍</div>
        <p>Nenhum atendimento encontrado com esses filtros.</p>
      </div>
    )
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
    >
      {conversations.map((conv) => (
        <ConvCard key={conv.id} conv={conv} onClick={() => onSelect(conv)} />
      ))}
    </div>
  )
}
