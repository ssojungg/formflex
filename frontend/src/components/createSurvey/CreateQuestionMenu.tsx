import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import createMultiple from '../../assets/createMultiple.svg';
import createCheck from '../../assets/createCheck.svg';
import createDrop from '../../assets/createDrop.svg';
import createSubjective from '../../assets/createSubjective.svg';

interface CreateQuestionMenuProps {
  onSelect: (type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE_QUESTION' | 'CHECKBOX' | 'DROPDOWN') => void;
  isOpen: boolean; // 여기를 boolean으로 변경합니다.
  onClose: () => void; // 드롭다운을 닫는 함수를 추가합니다.
}

interface QuestionMenuItem {
  icon: string;
  type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE_QUESTION' | 'CHECKBOX' | 'DROPDOWN';
  name: string;
}

const QUESTION_MENU_ITEMS: QuestionMenuItem[] = [
  { icon: createMultiple, type: 'MULTIPLE_CHOICE', name: '객관식 문항' },
  { icon: createCheck, type: 'CHECKBOX', name: '체크박스 문항' },
  { icon: createDrop, type: 'DROPDOWN', name: '드롭다운 문항' },
  { icon: createSubjective, type: 'SUBJECTIVE_QUESTION', name: '주관식 문항' },
];

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1, // 자식들 사이에 지연시간을 둡니다.
      duration: 0.2,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.1, // 자식들을 역순으로 닫을 때 지연시간을 둡니다.
      staggerDirection: -1, // 역순으로 지연시간을 적용합니다.
      duration: 0.1,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
  closed: {
    opacity: 0,
    y: -15, // 닫힐 때 항목이 위로 움직이면서 사라집니다.
    transition: {
      duration: 0.1,
    },
  },
};

function CreateQuestionMenu({ onSelect, isOpen, onClose }: CreateQuestionMenuProps) {
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="relative">
      <motion.ul
        ref={dropdownRef}
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="absolute -left-6 -top-6 flex flex-col w-[10rem] h-[12.5rem] bg-white shadow-md rounded-md py-[0.625rem] z-20"
      >
        {QUESTION_MENU_ITEMS.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center justify-start gap-2 w-full p-3 whitespace-nowrap rounded-md hover:bg-primary-100 text-slate-700 hover:text-[#5BA0F8] transition-colors cursor-pointer"
            onClick={() => onSelect(item.type)}
            initial={itemVariants.closed}
            variants={itemVariants}
          >
            <motion.div className="flex  items-center h-6 gap-2 px-2 cursor-pointer">
              <img src={item.icon} alt={item.name} className="min-w-[0.875rem] h-[0.875rem]" />
              <span className="text-base leading-4 text-black">{item.name}</span>
            </motion.div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default CreateQuestionMenu;
