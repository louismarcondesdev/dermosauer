import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          bg: '#050505',
          surface: '#0D0D0D',
          's2': '#101010',
          's3': '#141414',
          border: '#1A1A1A',
          'b2': '#222222',
          text: '#F5F5F5',
          muted: '#71717A',
          'm2': '#A1A1AA',
          accent: '#FF6A00',
          danger: '#A1A1AA',
          warn: '#71717A',
          ok: '#FF6A00',
        },
        nicho: {
          dermato: '#FF6A00',
          hormonal: '#FF7A1A',
          ortomolecular: '#FF8533',
          emagrecimento: '#FF9F5A',
          esportivo: '#A1A1AA',
          neurologico: '#71717A',
          veterinario: '#FF7A1A',
          pediatrico: '#FF8533',
          geriatrico: '#A1A1AA',
          ginecologico: '#FF9F5A',
          imunologico: '#FF6A00',
          capilar: '#CC5500',
          dor: '#FF7A1A',
          sono: '#A1A1AA',
          cardiovascular: '#FF8533',
          misto: '#71717A',
        },
      },
      fontFamily: {
        disp: ['var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-dmmono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '18px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}

export default config
