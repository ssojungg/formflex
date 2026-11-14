import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import profile from '../../assets/profile.svg';
import close from '../../assets/closebtn.svg';
import pencil from '../../assets/pencil.svg';
import { getIdAPI, patchPasswordAPI } from '../../api/myprofile';
import { useAuthStore } from '../../store/AuthStore';
import { getClient } from '../../queryClient';
import { TextButton } from './Button';
import Alert from './Alert';

interface MyProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function MyProfileModal({ isVisible, onClose }: MyProfileModalProps) {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = getClient;
  const [isInputOpen, setIsInputOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => (userId !== null ? getIdAPI(userId as number) : Promise.reject(new Error('No user ID'))),
  });

  const {
    mutate: patchPasswordMutation,
    isSuccess: isPasswordSuccess,
    isError: isPasswordError,
  } = useMutation({
    mutationFn: () => patchPasswordAPI(userId as number, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const handleInputClick = () => {
    setIsInputOpen((prev) => !prev);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = () => {
    patchPasswordMutation();
  };

  if (!isVisible || isLoading || isError) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative w-[25rem] h-80  flex flex-col items-center justify-center bg-white shadow-md rounded-[1.25rem]">
        <div className="absolute right-2 top-2">
          <div className="flex items-center justify-center w-6 h-6 cursor-pointer" onClick={onClose}>
            <img src={close} alt="close" className="w-2 h-2" />
          </div>
        </div>

        <div className="flex items-center gap-5 pb-10">
          <img src={profile} alt="profile" className="w-10 h-10" />
          <span className="text-xl font-semibold leading-5 text-darkGray">{users?.name}</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-base leading-4">이메일</span>
            <span className="text-sm leading-3 text-darkGray">{users?.email}</span>
          </div>
          <div className="flex flex-row items-center cursor-pointer" onClick={handleInputClick}>
            <span className="text-base leading-4">비밀번호</span>
            <img src={pencil} alt="pencil" className=" w-4 h-[0.875rem] ml-2 cursor-pointer" />
          </div>
        </div>

        {isInputOpen && (
          <div className="flex items-center justify-center gap-1 pt-[0.625rem]">
            <input
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="new Password"
              className="w-[12.5rem] h-8 text-base text-black focus:outline-none border border-gray border-solid rounded-[0.625rem] px-3"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className={`${
                password ? 'bg-primary-500 cursor-pointer' : 'bg-lightGray cursor-not-allowed'
              } text-white text-base leading-4 flex items-center justify-center rounded-[0.625rem] w-[3.75rem] h-8`}
            >
              변경
            </button>
            {isPasswordError && <Alert type="error" message="비밀번호 변경에 실패했습니다." buttonText="확인" />}
            {isPasswordSuccess && (
              <Alert
                type="success"
                message="비밀번호가 변경되었습니다."
                buttonText="확인"
                buttonClick={() => onClose()}
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-center pt-9">
          <TextButton text="확인" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

export default MyProfileModal;
