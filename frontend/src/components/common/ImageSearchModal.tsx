import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import close from '../../assets/closebtn.svg';
import { imageSearchAPI } from '../../api/imageSearch'; // API 함수 불러오기
import { TextButton } from './Button';
import Loading from './Loading';

interface ImageSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

function ImageSearchModal({ isVisible, onClose: providedOnClose, onSelectImage }: ImageSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [queryTerm, setQueryTerm] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const onClose = () => {
    setSearchTerm('');
    setQueryTerm('');
    providedOnClose();
  };

  const {
    data: imageData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['searchImages', queryTerm],
    queryFn: () => imageSearchAPI(queryTerm),
    enabled: false,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (queryTerm && isVisible) {
      refetch(); // queryTerm이 변경될 때마다 refetch 실행
    }
  }, [queryTerm, isVisible, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      setErrorMessage('검색어를 입력해주세요');
      return;
    }
    setErrorMessage(''); // 에러 메시지 초기화
    setQueryTerm(searchTerm);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl); // 이미지 URL을 상태로 설정
  };

  const handleSelectClick = () => {
    if (selectedImageUrl) {
      onSelectImage(selectedImageUrl); // 선택 콜백 호출
      onClose(); // 모달 닫기
    }
  };

  if (!isVisible) return null; // 모달이 보이지 않으면 렌더링하지 않음

  const imageUrls = imageData?.url || [];

  const imageGridRows = Math.ceil(imageUrls.length / 2);
  const imageGridHeight = imageGridRows * 128;
  const totalModalHeight = 180 + imageGridHeight;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-20">
      <div
        className="relative w-[30rem] min-h-52 flex flex-col pt-9 bg-white shadow-md rounded-[1.25rem]"
        style={{ height: `(${totalModalHeight}/16t)rem` }}
      >
        <div className="absolute right-2 top-2">
          <div className="flex items-center justify-center w-6 h-6 cursor-pointer" onClick={onClose}>
            <img src={close} alt="close" className="w-2 h-2" />
          </div>
        </div>

        <div className="w-full">
          <form onSubmit={handleSearch} className="flex flex-row items-center justify-center gap-3">
            <input
              type="text"
              placeholder="이미지를 검색해주세요."
              value={searchTerm}
              required
              onChange={handleSearchChange}
              className="w-[20rem] h-9 p-2 text-black border border-solid border-gray rounded-[0.625rem] focus:outline-none"
            />

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[6.25rem] h-9 bg-primary-500 leading-4 rounded-[0.625rem] text-base text-white focus:outline-none hover:bg-primary-600 transition duration-300 ease-in-out"
              >
                검색
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="pl-7">
              <p className="pt-1 text-xs text-red-500">{errorMessage}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center mt-2">
              <Loading />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mx-6 mt-4">
              {imageUrls && imageUrls.length > 0 ? (
                imageUrls.map((url: string, index: number) => (
                  <div
                    key={index}
                    className={`w-full h-32 bg-cover bg-center rounded cursor-pointer ${
                      selectedImageUrl === url ? 'border-4 border-solid border-blue-500' : ''
                    }`}
                    style={{ backgroundImage: `url(${url})` }}
                    onClick={() => handleImageClick(url)}
                  />
                ))
              ) : (
                <div className={`absolute left-[35%] pt-2 ${queryTerm.length > 0 ? '' : 'hidden'}`}>
                  <p className="text-base text-gray">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
          {imageUrls && imageUrls.length > 0 && (
            <div className="flex justify-center py-6">
              <TextButton text="선택" onClick={handleSelectClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageSearchModal;
