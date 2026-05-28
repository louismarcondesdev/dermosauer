export function fmtBRL(value: number | null | undefined): string {
  if (value == null) return '—'
  return `R$ ${Number(value)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function fmtTime(): string {
  return new Date().toLocaleTimeString('pt-BR')
}
