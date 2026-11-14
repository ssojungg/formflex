import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavbarStore } from '../../store/NavbarStore';
import all from '../../assets/navAll.svg';
import myform from '../../assets/navForm.svg';
import myresponses from '../../assets/navRes.svg';
import profile from '../../assets/profile.svg';
import logout from '../../assets/logout.svg';
import { useAuthStore } from '../../store/AuthStore';
import MyProfileModal from './MyProfileModal';
import logo from '../../assets/logo.svg';

interface NavbarProps {
  children: React.ReactNode;
}

type NavItem = {
  id: string;
  icon: string;
  text: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'all', icon: all, text: 'All', path: '/all' },
  { id: 'myforms', icon: myform, text: 'My Forms', path: '/myform' },
  { id: 'myresponses', icon: myresponses, text: 'My Responses', path: '/myresponses' },
];

function Navbar({ children }: NavbarProps) {
  const { setUserId, setLoginStatus } = useAuthStore();
  const { activeItem, handleItem } = useNavbarStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeNavItem = NAV_ITEMS.find((item) => item.path === currentPath)?.id;

    if (activeNavItem) {
      handleItem(activeNavItem);
    }
  }, [location, handleItem]);

  const handleClick = (item: string) => {
    handleItem(item);
    navigate(NAV_ITEMS.find((navItem) => navItem.id === item)?.path || '/all');
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleLogout = () => {
    setUserId(null);
    setLoginStatus(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="relative flex justify-end w-[90rem] h-[56rem] shadow-lg rounded-[2.5rem] bg-neutral-100">
      {/* Navbar */}
      <div className="flex flex-col justify-between w-60  pt-8 pb-[3.75rem]">
        <div>
          <div className="flex justify-center mb-11">
            <div className="flex flex-col items-center justify-center">
              <img src={logo} alt="logo" className="w-12 h-14" />
              <span className="text-2xl font-semibold text-black">Form:Flex</span>
            </div>
          </div>

          {/* nav item */}
          <div className="flex flex-col pl-6 space-y-9">
            {NAV_ITEMS.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-5 cursor-pointer ${isActive ? 'text-customPurple' : 'text-darkGray'}`}
                  onClick={() => handleClick(item.id)}
                >
                  <img
                    src={item.icon}
                    alt={item.text}
                    className="w-6 h-6"
                    style={
                      isActive
                        ? {
                            filter:
                              'invert(38%) sepia(60%) saturate(382%) hue-rotate(205deg) brightness(91%) contrast(88%)',
                          }
                        : {}
                    }
                  />
                  <p className={`text-base font-semibold leading-4 ${isActive ? 'text-primary-600' : 'text-darkGray'}`}>
                    {item.text}
                  </p>

                  {activeItem === item.id && (
                    <div className="absolute left-0 w-2 h-[3rem] bg-primary-600 ">
                      <div className="w-52 h-[3rem] bg-primary-500 opacity-40 rounded-tr-xl rounded-br-xl" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* profile */}
        <div className="pl-6">
          <button
            type="button"
            className="flex items-center gap-5 mb-9 focus:outline-none"
            onClick={() => setIsModalVisible(true)}
          >
            <img src={profile} alt="profile" className="w-6 h-6" />
            <p className="text-base font-semibold leading-4 text-darkGray">Profile</p>
          </button>
          {isModalVisible && <MyProfileModal isVisible={isModalVisible} onClose={handleCloseModal} />}

          {/* logout */}
          <div className="flex items-center gap-5 cursor-pointer" onClick={handleLogout}>
            <img src={logout} alt="logout" className="w-6 h-6" />
            <p className="text-base font-semibold leading-4 text-darkGray">Logout</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-[75rem] h-[56rem] rounded-[2.5rem] shadow-xl bg-white">{children}</div>
    </div>
  );
}

export default Navbar;
