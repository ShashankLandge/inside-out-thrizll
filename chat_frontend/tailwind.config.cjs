module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'soft-pink': '#FFB6C1',
        'coral': '#FF7F50',
        'peach': '#FFDAB9',
        'lavender': '#E6E6FA',
        'soft-purple': '#D8BFD8',
        
        // Secondary Colors
        'sky-blue': '#87CEEB',
        'teal': '#008080',
        'soft-beige': '#F5F5DC',
        'off-white': '#FAF9F6',
        
        // Accent & Text
        'charcoal': '#36454F',
        'deep-navy': '#000080',
        
        // App-specific naming
        primary: '#FFB6C1',    // soft-pink
        secondary: '#E6E6FA',  // lavender
        accent: '#FF7F50',     // coral
        highlight: '#87CEEB',  // sky-blue
        neutral: '#FAF9F6',    // off-white
        dark: '#36454F',       // charcoal
      },
      backgroundImage: {
        'gradient-love': 'linear-gradient(to right, #FFB6C1, #D8BFD8, #87CEEB)',
      },
      boxShadow: {
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 10px 15px -3px rgba(255, 182, 193, 0.1), 0 4px 6px -2px rgba(255, 182, 193, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
