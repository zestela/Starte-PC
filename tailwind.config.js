/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 项目自定义颜色
        'glass-bg': 'rgba(0, 0, 0, 0.37)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'primary': {
          DEFAULT: 'rgba(93, 85, 255, 0.9)',
          hover: 'rgba(93, 85, 255, 1)',
          light: 'rgba(93, 85, 255, 0.3)',
        },
        'text-secondary': 'rgba(255, 255, 255, 0.5)',
        'text-tertiary': 'rgba(255, 255, 255, 0.3)',
      },
      backdropBlur: {
        'glass': '98px',
        'button': '70px',
      },
      borderRadius: {
        'xs': '3.5px',
      },
      fontFamily: {
        'sans': ['HarmonyOS Sans SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
