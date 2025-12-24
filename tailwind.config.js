/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_layouts/**/*.html',
    './_includes/**/*.html',
    './_posts/*.md',
    './_gallery/*.md',
    './*.html',
    './*.md',
    './blog/**/*.md',
    './tools/**/*.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: { 
          bg: '#000000', 
          card: '#1c1c1e', 
          text: '#f5f5f7', 
          muted: '#86868b', 
          border: '#333333' 
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"JetBrains Mono"', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: { 
          css: { 
            '--tw-prose-body': '#1d1d1f', 
            '--tw-prose-headings': '#1d1d1f', 
            '--tw-prose-links': '#0071e3', 
            maxWidth: 'none' 
          } 
        },
        invert: { 
          css: { 
            '--tw-prose-body': '#f5f5f7', 
            '--tw-prose-headings': '#f5f5f7', 
            '--tw-prose-links': '#2997ff' 
          } 
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}