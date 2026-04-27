import { ResponsiveSidebar } from '../components/layout/ResponsiveSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return <ResponsiveSidebar>{children}</ResponsiveSidebar>;
}

export default MainLayout;
