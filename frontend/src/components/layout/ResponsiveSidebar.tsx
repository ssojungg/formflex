import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavbarStore } from '../../store/NavbarStore';
import { useAuthStore } from '../../store/AuthStore';
import { useResponsive } from '../../hooks/useResponsive';
import { usePWA } from '../../hooks/usePWA';

// Icons as inline SVGs for better performance
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TemplateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

type NavItem = {
  id: string;
  icon: React.FC;
  text: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'myforms', icon: DashboardIcon, text: '대시보드', path: '/myform' },
  { id: 'templates', icon: TemplateIcon, text: '템플릿 라이브러리', path: '/all' },
  { id: 'analytics', icon: AnalyticsIcon, text: '분석', path: '/result' },
  { id: 'profile', icon: ProfileIcon, text: '내 정보', path: '/mypage' },
];

interface ResponsiveSidebarProps {
  children: React.ReactNode;
}

export function ResponsiveSidebar({ children }: ResponsiveSidebarProps) {
  const { setUserId, setLoginStatus } = useAuthStore();
  const { activeItem, handleItem, isMobileSidebarOpen, setMobileSidebarOpen } = useNavbarStore();
  const { isMobile, isTablet } = useResponsive();
  const { isInstallable, installApp } = usePWA();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname]);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && !isTablet && isMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  // Update active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const activeNavItem = NAV_ITEMS.find((item) => item.path === currentPath)?.id;
    if (activeNavItem) {
      handleItem(activeNavItem);
    }
  }, [location.pathname, handleItem]);

  const handleNavClick = (item: NavItem) => {
    handleItem(item.id);
    navigate(item.path);
    if (isMobile || isTablet) {
      setMobileSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setLoginStatus(false);
    navigate('/', { replace: true });
  };

  const showMobileView = isMobile || isTablet;

  return (
    <div className="flex min-h-screen bg-background-secondary">
      {/* Mobile Header */}
      {showMobileView && (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-background-sidebar border-b border-secondary-800">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-text-inverse rounded-lg hover:bg-secondary-800 transition-colors"
            aria-label="메뉴 열기"
          >
            <MenuIcon />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">FF</span>
            </div>
            <span className="text-text-inverse font-semibold text-lg">FormFlex</span>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </header>
      )}

      {/* Mobile Overlay */}
      {showMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${showMobileView 
            ? `fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-out
               ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'fixed inset-y-0 left-0 w-[200px]'
          }
          flex flex-col bg-background-sidebar
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">FF</span>
            </div>
            <span className="text-text-inverse font-semibold">FormFlex</span>
          </div>
          
          {showMobileView && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 text-text-inverse rounded-lg hover:bg-secondary-800 transition-colors"
              aria-label="메뉴 닫기"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Navigation Label */}
        <div className="px-4 py-3">
          <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Navigation
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'text-secondary-400 hover:bg-secondary-800 hover:text-text-inverse'
                  }
                `}
              >
                <span className={`${isActive ? 'text-white' : 'text-secondary-400 group-hover:text-text-inverse'}`}>
                  <Icon />
                </span>
                <span className="text-sm font-medium">{item.text}</span>
              </button>
            );
          })}
        </nav>

        {/* PWA Install Button */}
        {isInstallable && (
          <div className="px-3 py-2">
            <button
              onClick={installApp}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary-400 
                       bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-colors"
            >
              <DownloadIcon />
              <span>앱 설치하기</span>
            </button>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-3 mt-auto border-t border-secondary-800">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-inverse truncate">Jin Soo Park</p>
              <p className="text-xs text-secondary-500">Pro Plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-secondary-400 hover:text-error hover:bg-secondary-800 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 min-h-screen
          ${showMobileView ? 'pt-16' : 'ml-[200px]'}
        `}
      >
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}

export default ResponsiveSidebar;
