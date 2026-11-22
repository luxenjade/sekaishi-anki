/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "YuGothic",
          "Meiryo",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "qz-sm": "6px",
        "qz-md": "12px",
        "qz-lg": "20px",
      },
      boxShadow: {
        "qz-sm": "var(--qz-shadow-sm)",
        "qz-md": "var(--qz-shadow-md)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        // クイズUIのデザイントークン（実体は src/index.css の CSS 変数。ダークモードも変数で切り替わる）
        qz: {
          bg: "var(--qz-bg)",
          surface: "var(--qz-surface)",
          surface2: "var(--qz-surface-2)",
          text: "var(--qz-text)",
          sub: "var(--qz-text-sub)",
          border: "var(--qz-border)",
          accent: "var(--qz-accent)",
          ink: "var(--qz-ink)", // 金色の上に載せる文字色
          "accent-text": "var(--qz-accent-text)", // 金色を「文字」として使うときの色
          "accent-light": "var(--qz-accent-light)",
          "accent-ring": "var(--qz-accent-ring)",
          correct: "var(--qz-correct)",
          "correct-bg": "var(--qz-correct-bg)",
          incorrect: "var(--qz-incorrect)",
          "incorrect-bg": "var(--qz-incorrect-bg)",
        },

        // 旧クラス名（brand-*）。塗りは金色に差し替え。文字色の補正は index.css の互換ルール参照
        brand: {
          sky: "#ffc958",
          navy: "#141414",
          blue: "#faba40",
          slate: "#333330",
          "navy-light": "#1e1e1e",
          "navy-dark": "#0f0f0f",
          "blue-light": "#fff8e8",
        },
      },
    },
  },
  plugins: [],
};
