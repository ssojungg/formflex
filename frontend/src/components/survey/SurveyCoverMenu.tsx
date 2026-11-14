import { useLocation, useNavigate } from 'react-router-dom';
import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import menuSee from '../../assets/menuSee.svg';
import menuLink from '../../assets/menuLink.svg';
import menuAnalysis from '../../assets/menuAnalysis.svg';
import menuEdit from '../../assets/menuEdit.svg';
import menuDel from '../../assets/menuDel.svg';
import { useAuthStore } from '../../store/AuthStore';
import ShareMailModal from '../common/ShareMailModal';
import { deleteSurveyAPI } from '../../api/deleteSurvey';
import Alert from '../common/Alert';
import { ApiResponseError } from '../../types/apiResponseError';

const dropdownVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.03,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.1,
      duration: 0.03,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      duration: 0.1,
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: 'afterChildren',
      duration: 0.1,
    },
  },
};

interface SurveyCoverMenuProps {
  surveyId: number;
  open?: boolean; // You might already have this if you use it to represent something else.
  attendCount?: number;
  isDropdownOpen: boolean; // Add this line
  setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

interface MenuItem {
  id: number;
  path: string;
  item: string[];
}

interface ItemIcon {
  item: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 1, path: '/all', item: ['보기', '공유', '분석'] },
  { id: 2, path: '/myform', item: ['보기', '편집', '공유', '분석', '삭제'] },
  { id: 3, path: '/myresponses', item: ['보기', '공유'] },
];

const ITEM_ICON: ItemIcon[] = [
  { item: '보기', icon: menuSee },
  { item: '편집', icon: menuEdit },
  { item: '공유', icon: menuLink },
  { item: '분석', icon: menuAnalysis },
  { item: '삭제', icon: menuDel },
];

function SurveyCoverMenu({ surveyId, open, attendCount, isDropdownOpen, setIsDropdownOpen }: SurveyCoverMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const myId = useAuthStore((state) => state.userId) ?? 0;
  const currentMenuItems = MENU_ITEMS.find((menu) => menu.path === location.pathname);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showEditAlert, setShowEditAlert] = useState<boolean>(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const { mutate, isError: deleteError } = useMutation({
    mutationFn: () => deleteSurveyAPI(surveyId, myId),
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: AxiosError) => {
      const err = error as AxiosError<ApiResponseError>;
      setErrorMessage(err.response?.data?.message || '설문 삭제에 실패했습니다.');
    },
  });

  const items = currentMenuItems ? [...currentMenuItems.item].filter((item) => !(open && item === '편집')) : [];

  if (location.pathname === '/myresponses' && open) {
    items.push('분석');
  }

  const getIcon = (itemName: string) => {
    const icon = ITEM_ICON.find((iconItem) => iconItem.item === itemName)?.icon;
    return icon || '';
  };

  const handleShareClick = () => {
    setIsShareModalVisible(true);
  };

  const handleDeleteSurvey = () => {
    mutate();
  };

  const isEditable = () => {
    return open === false && attendCount === 0;
  };

  const handleItemClick = (itemName: string, sId: number, event: React.MouseEvent) => {
    event.stopPropagation();

    if (itemName === '보기') {
      navigate(`/view?id=${sId}`);
    } else if (itemName === '편집') {
      if (isEditable()) {
        navigate(`/edit?id=${sId}`);
      } else {
        setShowEditAlert(true);
      }
    } else if (itemName === '공유') {
      handleShareClick();
    } else if (itemName === '분석') {
      navigate(`/result?id=${sId}`);
    } else if (itemName === '삭제') {
      handleDeleteSurvey();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!isShareModalVisible) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsDropdownOpen, dropdownRef, isShareModalVisible]);

  return (
    <>
      {isDropdownOpen && (
        <motion.ul
          initial="closed"
          animate="open"
          exit="closed"
          variants={dropdownVariants}
          ref={dropdownRef}
          className="absolute top-full left-3/4 transform -translate-x-1/2 flex flex-col w-24 min-h-fit bg-white shadow-md rounded-md z-[5] overflow-hidden"
        >
          {items.map((itemName, index) => (
            <motion.li
              key={index}
              className="flex items-center justify-center gap-2 w-full p-3 whitespace-nowrap rounded-md hover:bg-primary-100 text-slate-700 hover:text-[#5BA0F8] transition-colors"
              onClick={(event) => handleItemClick(itemName, surveyId, event)} // 이벤트 객체 전달
              variants={itemVariants}
            >
              <img src={getIcon(itemName)} alt={itemName} className="w-4 h-4" />
              <span className={`text-sm leading-4 ${itemName === '삭제' ? 'text-[#D0021B]' : 'text-black'}`}>
                {itemName}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {isShareModalVisible && (
        <ShareMailModal
          surveyId={surveyId}
          isVisible={isShareModalVisible}
          onClose={() => {
            setIsShareModalVisible(false);
            setIsDropdownOpen(false);
          }}
        />
      )}
      {deleteError && <Alert type="error" message={errorMessage} buttonText="확인" />}
      {showEditAlert && (
        <Alert
          type="error"
          message="참여자가 있는 설문은 편집할 수 없습니다."
          buttonText="확인"
          buttonClick={() => setShowEditAlert(false)}
        />
      )}
    </>
  );
}

export default SurveyCoverMenu;
