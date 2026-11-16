module.exports = { content: ['./index.html','./assets/js/*.js'], 
      theme: { extend: {
        colors: {
          'brand-dark': '#0D0E10', 'brand-secondary': '#121417',
          'brand-card': '#1A1D24', 'brand-border': 'rgba(229,231,235,0.14)',
          'brand-emerald': '#10B981', 'brand-emerald-dark': '#059669',
          'brand-emerald-light': '#34D399', 'brand-text': '#F3F4F6', 'brand-muted': '#B0B7C3'
        },
        fontFamily: { serif: ['"Playfair Display"', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
        boxShadow: { 'emerald-glow': '0 0 24px rgba(16,185,129,0.2)' }
      } }
    };
