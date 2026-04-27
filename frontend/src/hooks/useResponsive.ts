import { useState, useEffect, useCallback } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseResponsiveReturn {
  // Current breakpoint
  breakpoint: Breakpoint;
  
  // Device type helpers
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1023px
  isDesktop: boolean;     // >= 1024px
  
  // Specific breakpoint checks
  isXs: boolean;          // < 640px
  isSm: boolean;          // 640px - 767px
  isMd: boolean;          // 768px - 1023px
  isLg: boolean;          // 1024px - 1279px
  isXl: boolean;          // 1280px - 1535px
  is2Xl: boolean;         // >= 1536px
  
  // Min-width queries (same as Tailwind)
  isSmUp: boolean;        // >= 640px
  isMdUp: boolean;        // >= 768px
  isLgUp: boolean;        // >= 1024px
  isXlUp: boolean;        // >= 1280px
  is2XlUp: boolean;       // >= 1536px
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Touch device detection
  isTouchDevice: boolean;
  
  // Screen dimensions
  width: number;
  height: number;
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

export function useResponsive(): UseResponsiveReturn {
  const [width, setWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [height, setHeight] = useState(() => 
    typeof window !== 'undefined' ? window.innerHeight : 768
  );

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    // Set initial values
    handleResize();

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(document.documentElement);

    // Fallback to window resize event
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  const breakpoint = getBreakpoint(width);
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return {
    breakpoint,
    
    // Device types
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    
    // Specific breakpoints
    isXs: width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl && width < breakpoints['2xl'],
    is2Xl: width >= breakpoints['2xl'],
    
    // Min-width queries
    isSmUp: width >= breakpoints.sm,
    isMdUp: width >= breakpoints.md,
    isLgUp: width >= breakpoints.lg,
    isXlUp: width >= breakpoints.xl,
    is2XlUp: width >= breakpoints['2xl'],
    
    // Orientation
    isPortrait: height > width,
    isLandscape: width > height,
    
    // Touch
    isTouchDevice,
    
    // Dimensions
    width,
    height,
  };
}

export default useResponsive;
