'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  )

  return (
    <div className="min-h-screen bg-ds-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-disp font-extrabold text-sm"
            style={{ background: 'linear-gradient(135deg, #00C9A7 0%, #0097B2 100%)', color: '#07090F' }}
          >
            DS
          </div>
          <div>
            <div className="font-disp font-bold text-base text-ds-text leading-none">DermoSauer</div>
            <div className="text-xs text-ds-muted mt-0.5">Painel de Atendimento</div>
          </div>
        </div>

        <div className="bg-ds-surface border border-ds-border rounded-lg p-7">
          <h1 className="font-disp font-bold text-xl text-ds-text mb-1">Entrar</h1>
          <p className="text-xs text-ds-muted mb-6">Acesso restrito à equipe DermoSauer</p>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ds-muted uppercase tracking-wide">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="bg-ds-s2 border border-ds-border rounded text-ds-text text-sm px-3.5 py-2.5 outline-none focus:border-ds-accent transition-colors placeholder:text-ds-muted"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ds-muted uppercase tracking-wide">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="bg-ds-s2 border border-ds-border rounded text-ds-text text-sm px-3.5 py-2.5 outline-none focus:border-ds-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="text-xs text-ds-danger bg-[var(--danger-dim)] border border-ds-danger/20 rounded px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 bg-ds-accent text-ds-bg font-semibold text-sm rounded py-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
