/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // Custom breakpoints for responsive design
    screens: {
      'xs': '400px',      // Extra small devices (small phones)
      'sm': '640px',      // Small devices (landscape phones)
      'md': '768px',      // Tablets
      'lg': '1024px',     // Desktop
      'xl': '1280px',     // Large desktop
      '2xl': '1536px',    // Extra large desktop
    },
    extend: {
      // Modern Indigo/Blue color system (2025-2026 트렌드)
      colors: {
        // Primary colors - Modern Indigo
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Main primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Secondary - Cool Gray
        secondary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Accent colors
        accent: {
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Status colors (for survey states)
        status: {
          active: '#10b981',
          closed: '#ef4444',
          draft: '#9ca3af',
        },
        
        // Background colors
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
          sidebar: '#111827',
          card: '#ffffff',
        },
        
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#6b7280',
          muted: '#9ca3af',
          inverse: '#ffffff',
        },
        
        // Border colors
        border: {
          light: '#e5e7eb',
          DEFAULT: '#d1d5db',
          dark: '#9ca3af',
        },

        // Legacy colors (for backward compatibility)
        darkPurple: '#66629F',
        purple: '#918DCA',
        skyBlue: '#A3C9F0',
        darkGray: '#8E8E8E',
        gray: '#B4B4B4',
        lightGray: '#D9D9D9',
        white: '#FFFFFF',
        green: '#10b981',
        darkGreen: '#059669',
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(135deg, #f9fafb 0%, #eef2ff 50%, #e0e7ff 100%)',
        'custom-gradient-re': 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 50%, #f9fafb 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
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
