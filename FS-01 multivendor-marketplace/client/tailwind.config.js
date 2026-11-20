export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          900: '#0f172a'
        },
        surface: {
          light: '#fdfdfd',
          card: '#ffffff',
          dark: '#090d16'
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.12)'
      }
    },
  },
  plugins: [],
}
