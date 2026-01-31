/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(224, 71%, 4%)',
        foreground: 'hsl(210, 40%, 98%)',
        card: 'hsl(222, 47%, 7%)',
        'card-foreground': 'hsl(210, 40%, 98%)',
        primary: 'hsl(142, 71%, 45%)',
        'primary-foreground': 'hsl(144, 70%, 5%)',
        secondary: 'hsl(217, 19%, 27%)',
        'secondary-foreground': 'hsl(210, 40%, 98%)',
        muted: 'hsl(217, 19%, 27%)',
        'muted-foreground': 'hsl(215, 20%, 65%)',
        accent: 'hsl(262, 80%, 50%)',
        'accent-foreground': 'hsl(210, 40%, 98%)',
        destructive: 'hsl(0, 84%, 60%)',
        'destructive-foreground': 'hsl(210, 40%, 98%)',
        border: 'hsl(217, 19%, 27%)',
        input: 'hsl(217, 19%, 27%)',
        ring: 'hsl(142, 71%, 45%)',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
