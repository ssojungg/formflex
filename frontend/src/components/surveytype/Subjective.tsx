import { useState } from 'react';
import typeIcon from '../../assets/type.svg';
import copyIcon from '../../assets/copy.svg';
import deleteIcon from '../../assets/delete.svg';
import imageaddIcon from '../../assets/imageadd.svg';
import trashcanIcon from '../../assets/trashcan.svg';
import { EditableSubjectiveQuestion } from '../../types/editableSurvey';
import ImageSearchModal from '../common/ImageSearchModal';
import pexelIcon from '../../assets/pexel.svg';

interface SubjectiveProps {
  idx: number;
  data: EditableSubjectiveQuestion;
  handleImageUpload: (
    idx: number,
    data: EditableSubjectiveQuestion,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  updateQuestion: (idx: number, data: EditableSubjectiveQuestion) => void;
  copyQuestion: (idx: number) => void;
  deleteQuestion: (idx: number) => void;
}

function Subjective({ idx, data, handleImageUpload, updateQuestion, copyQuestion, deleteQuestion }: SubjectiveProps) {
  const [isImageSearchModalVisible, setImageSearchModalVisible] = useState(false);

  const handleImageSearchClick = () => {
    setImageSearchModalVisible(true);
  };

  const handleSelectImage = (imageUrl: string) => {
    updateQuestion(idx, { ...data, imageUrl });
    setImageSearchModalVisible(false); // 이미지 검색 모달을 닫음
  };

  const handleDeleteImage = () => {
    updateQuestion(idx, { ...data, imageUrl: '' });
  };

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[1.25rem] bg-white border border-primary-500"
      style={{ boxShadow: '0 0 0.25rem 0.25rem rgba(145,141,202,0.25)' }}
    >
      <div className="flex justify-between w-full mt-4">
        <div className="flex items-center ml-4">
          <button type="button" className="items-center focus:outline-none">
            <img src={typeIcon} alt="Type" className="w-5 h-5" />
          </button>
          <span className="ml-2 font-medium text-left text-darkGray">주관식</span>
        </div>
        <div className="flex mr-4">
          <button
            type="button"
            className="items-center w-5 h-5 mr-2 focus:outline-none"
            onClick={() => copyQuestion(idx)}
          >
            <img src={copyIcon} alt="Copy" className="w-full h-full" />
          </button>

          <button
            type="button"
            className="items-center w-5 h-5 mr-2 focus:outline-none"
            onClick={() => deleteQuestion(idx)}
          >
            <img src={trashcanIcon} alt="Trashcan" className="w-full h-full" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center w-full">
        <span className="text-[2rem] font-semibold text-center text-black -translate-y-4">Q{idx + 1}.</span>
      </div>

      <div className="relative flex items-center justify-center w-full mb-4">
        <div className="flex justify-center items-center w-[14.375rem] max-w-[50rem] h-8 ">
          <input
            type="text"
            required
            value={data.content}
            onChange={(e) => updateQuestion(idx, { ...data, content: e.target.value })}
            placeholder="질문을 입력해주세요."
            className="w-full h-full text-[1rem] text-center text-black rounded-[0.625rem] border border-gray"
          />
        </div>
        <div className="absolute right-[15.625rem]">
          <input
            id={`checkbox-image-upload-${idx}`}
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(idx, data, event)}
            style={{ display: 'none' }}
          />
          <label htmlFor={`checkbox-image-upload-${idx}`} className="image-upload-label">
            {/* 이미지 업로드 버튼 */}
            <img src={imageaddIcon} alt="Upload" className="w-5 h-5 cursor-pointer" />
          </label>
        </div>
        <div className="absolute right-[13.625rem]">
          <button
            type="button"
            className="flex items-center justify-start focus:outline-none "
            onClick={handleImageSearchClick}
          >
            <img src={pexelIcon} alt="pexel" className="flex w-5 h-5" />
          </button>
          {isImageSearchModalVisible && (
            <ImageSearchModal
              isVisible={isImageSearchModalVisible}
              onClose={() => setImageSearchModalVisible(false)}
              onSelectImage={handleSelectImage}
            />
          )}
        </div>
      </div>

      {data.imageUrl && (
        <div className="mb-4">
          <button
            type="button"
            className="flex items-start justify-start w-5 h-5 focus:outline-none"
            onClick={handleDeleteImage} // 이미지 삭제
          >
            <img src={deleteIcon} alt="Delete" className="w-full h-full rounded-[0.625rem]" />
          </button>
          <img
            src={data.imageUrl}
            alt="Preview"
            className="rounded-[0.625rem] border-2 border-solid border-gray max-w-[30rem] max-h-[36rem]"
          />
          <div className="flex items-center justify-center w-full" />
        </div>
      )}

      <div className="flex w-[50rem] mb-[1rem]">
        <div className="flex items-center justify-center w-full">
          <span className="w-[25rem] py-2 pl-2 text-base text-start text-darkGray rounded-lg border border-solid border-darkGray">
            주관식 답변을 작성해주세요.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Subjective;
