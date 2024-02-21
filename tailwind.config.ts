import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}"],
  darkMode: ["class", '[data-kb-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        dark: "#373F51",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "content-show": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "content-hide": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.96)" }
        },
        "slide-down": {
          from: { height: "0" },
          to: { height: "var(--kb-collapsible-content-height)" }
        },
        "slide-up": {
          from: { height: "var(--kb-collapsible-content-height)" },
          to: { height: "0" }
        },
        "dice-roll": {
          "0%": {
            transform: "rotateZ(0) rotateX(0)"
          },
          "25%": {
            transform: "rotateZ(120deg) rotateX(0)"
          },
          "50%": {
            transform: "rotateZ(120deg) rotateX(180deg)"
          },
          "75%": {
            transform: "rotateZ(0) rotateX(180deg)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "content-show": "content-show 0.2s ease-out",
        "content-hide": "content-hide 0.2s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "dice-roll": "dice-roll 1s ease-in-out infinite"
      }
    }
  },
  plugins: [tailwindAnimate]
};

export default config;
