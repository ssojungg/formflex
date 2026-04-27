/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // Custom breakpoints for responsive design
    screens: {
      'xs': '320px',      // Extra small devices
      'sm': '640px',      // Small devices (landscape phones)
      'md': '768px',      // Tablets
      'lg': '1024px',     // Desktop
      'xl': '1280px',     // Large desktop
      '2xl': '1536px',    // Extra large desktop
    },
    extend: {
      // 2025-2026 트렌드 컬러 시스템 (Sage Green 기반)
      colors: {
        // Primary colors - Sage Green
        primary: {
          50: '#f0f4f0',
          100: '#dce6dc',
          200: '#c4d7c4',
          300: '#a8c4a8',
          400: '#8ab08a',
          500: '#6B8E6B',  // Main primary
          600: '#5a7a5a',
          700: '#4a654a',
          800: '#3a503a',
          900: '#2a3b2a',
        },
        // Secondary - Warm neutrals
        secondary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Accent colors
        accent: {
          green: '#22c55e',
          greenLight: '#dcfce7',
          mint: '#a8d5ba',
        },
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Status colors (for survey states)
        status: {
          active: '#22c55e',
          closed: '#ef4444',
          draft: '#a3a3a3',
        },
        
        // Background colors
        background: {
          primary: '#ffffff',
          secondary: '#f8faf8',
          tertiary: '#f0f4f0',
          sidebar: '#1a1a1a',
          card: '#ffffff',
        },
        
        // Text colors
        text: {
          primary: '#171717',
          secondary: '#525252',
          tertiary: '#737373',
          muted: '#a3a3a3',
          inverse: '#ffffff',
        },
        
        // Border colors
        border: {
          light: '#e5e5e5',
          DEFAULT: '#d4d4d4',
          dark: '#a3a3a3',
        },

        // Legacy colors (for backward compatibility)
        darkPurple: '#66629F',
        purple: '#918DCA',
        skyBlue: '#A3C9F0',
        darkGray: '#8E8E8E',
        gray: '#B4B4B4',
        lightGray: '#D9D9D9',
        white: '#FFFFFF',
        green: '#07A480',
        darkGreen: '#0A795E',
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(135deg, #f8faf8 0%, #e8f0e8 50%, #dce6dc 100%)',
        'custom-gradient-re': 'linear-gradient(135deg, #dce6dc 0%, #e8f0e8 50%, #f8faf8 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(107, 142, 107, 0.1) 0%, rgba(107, 142, 107, 0.05) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #1a1a1a 0%, #262626 100%)',
      },
      fontFamily: {
        sans: ['Pretendard-Regular', 'system-ui', '-apple-system', 'sans-serif'],
        pretendardFont: ['Pretendard-Regular', 'Pretendard-Regular'],
        tMoney: ['TmoneyRoundWindExtraBold', 'TmoneyRoundWindExtraBold'],
        npsFontBold: ['NPSfontBold', 'NPSfontBold'],
        npsFont: ['NPSfont', 'NPSfont'],
        omyuFont: ['omyu_pretty', 'omyu_pretty'],
        seolleimFont: ['seolleimcool-SemiBold', 'seolleimcool-SemiBold'],
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-collapsed': '80px',
        'header': '64px',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'sidebar': '4px 0 24px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
};
