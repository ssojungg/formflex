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
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#dcebfe',
          200: '#bbd8fd',
          300: '#8cbefb',
          400: '#5ba0f8',
          500: '#3182f6',
          600: '#1b64da',
          700: '#1957c2',
          800: '#194aa0',
          900: '#1a3f80',
          DEFAULT: '#3182f6',
          hover: '#1b64da',
          foreground: '#ffffff',
        },
        foreground: '#191f28',
        card: '#ffffff',
        muted: {
          DEFAULT: '#f2f4f6',
          foreground: '#6b7684',
        },
        surface: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f2f4f6',
        },
        destructive: '#f04452',
        secondary: {
          50: '#f9fafb',
          100: '#f2f4f6',
          200: '#e5e8eb',
          300: '#d1d6db',
          400: '#b0b8c1',
          500: '#8b95a1',
          600: '#6b7684',
          700: '#4e5968',
          800: '#333d4b',
          900: '#191f28',
        },
        accent: {
          cyan: '#06b6d4',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f04452',
        info: '#3182f6',

        status: {
          active: '#10b981',
          closed: '#f04452',
          draft: '#b0b8c1',
        },

        background: {
          DEFAULT: '#f9fafb',
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f2f4f6',
          sidebar: '#ffffff',
          card: '#ffffff',
        },

        text: {
          primary: '#191f28',
          secondary: '#4e5968',
          tertiary: '#6b7684',
          muted: '#8b95a1',
          inverse: '#ffffff',
        },

        border: {
          light: '#f2f4f6',
          DEFAULT: '#e5e8eb',
          medium: '#d1d6db',
          dark: '#b0b8c1',
        },

        // Legacy colors (for backward compatibility)
        darkGray: '#8E8E8E',
        gray: {
          DEFAULT: '#B4B4B4',
          50: '#f9fafb',
          100: '#f2f4f6',
          200: '#e5e8eb',
          300: '#d1d6db',
          400: '#b0b8c1',
          500: '#8b95a1',
          600: '#6b7684',
          700: '#4e5968',
          800: '#333d4b',
          900: '#191f28',
        },
        lightGray: '#D9D9D9',
        white: '#FFFFFF',
        green: '#10b981',
        darkGreen: '#059669',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
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
        'card': '0 1px 2px rgba(25, 31, 40, 0.04)',
        'card-hover': '0 4px 16px rgba(25, 31, 40, 0.06)',
        'sidebar': 'none',
        'dropdown': '0 4px 16px rgba(25, 31, 40, 0.08)',
        'modal': '0 16px 48px rgba(25, 31, 40, 0.12)',
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
