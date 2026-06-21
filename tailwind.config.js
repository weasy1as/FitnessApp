/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        surface: '#faf8ff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'on-surface': '#131b2e',
        'on-surface-variant': '#414755',
        outline: '#c1c6d7',
        primary: '#0058bc',
        'on-primary': '#ffffff',
        secondary: '#00677f',
        accent: '#00ccf9',
        'on-accent': '#005266',
      },
    },
  },
  plugins: [],
};
