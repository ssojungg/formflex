import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/AuthStore';
import { useNavbarStore } from '../../store/NavbarStore';
import { createSurveyAPI } from '../../api/survey';
import { responseformAPI } from '../../api/responseform';
import { editSurveyAPI } from '../../api/editSurvey';
import { getClient } from '../../queryClient';
import { uploadS3 } from '../../utils/s3ImgUpload';
import { ApiResponseError } from '../../types/apiResponseError';
import {
  EditableObjectiveQuestion,
  EditableQuestions,
  EditableSubjectiveQuestion,
  EditableSurvey,
} from '../../types/editableSurvey';
import ComponentPanel from './ComponentPanel';
import FormPreview from './FormPreview';
import PropertyPanel from './PropertyPanel';
import EditorHeader from './EditorHeader';
import Alert from '../common/Alert';
import { useResponsive } from '../../hooks/useResponsive';

function FormEditor() {
  const userId = useAuthStore((state) => state.userId);
  const activeItem = useNavbarStore((state) => state.activeItem);
  const queryClient = getClient;
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState<'components' | 'style'>('components');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showMobilePanel, setShowMobilePanel] = useState<'components' | 'properties' | 'preview'>('preview');
  const [createErrorMessage, setCreateErrorMessage] = useState<string>();
  const [editErrorMessage, setEditErrorMessage] = useState<string>();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const editId = Number(new URLSearchParams(location.search).get('id'));
  const isEditMode = editId !== null && !Number.isNaN(editId) && location.pathname.includes('/edit');

  const { data: editSurveyData } = useQuery({
    queryKey: ['editSurvey', editId],
    queryFn: () => responseformAPI(editId as number),
    enabled: isEditMode && !!editId,
  });

  const { mutate: editMutate, isSuccess: editSuccess } = useMutation({
    mutationFn: editSurveyAPI,
    onError: (error) => {
      const err = error as AxiosError<ApiResponseError>;
      setEditErrorMessage(err.response?.data.message || '설문 수정에 실패했습니다.');
    },
  });

  const [survey, setSurvey] = useState<EditableSurvey>({
    userId: userId as number,
    title: '',
    description: '',
    open: true,
    buttonStyle: 'smooth',
    color: '#6B8E6B',
    font: 'pretendard',
    mainImageUrl: '',
    deadline: '',
    questions: [],
  });

  useEffect(() => {
    if (editSurveyData) {
      setSurvey(editSurveyData);
    }
  }, [editSurveyData]);

  const { mutate, isSuccess } = useMutation({
    mutationFn: createSurveyAPI,
    onSuccess: () => {
      if (survey.open) {
        queryClient.invalidateQueries({ queryKey: ['allForm'] });
        queryClient.refetchQueries({ queryKey: ['allForm'] });
      }
      queryClient.invalidateQueries({ queryKey: ['myForm', userId] });
      queryClient.refetchQueries({ queryKey: ['myForm', userId] });
    },
    onError: (error) => {
      const err = error as AxiosError<ApiResponseError>;
      setCreateErrorMessage(err.response?.data.message || '설문 생성에 실패했습니다.');
    },
  });

  const addQuestion = (type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE_QUESTION' | 'CHECKBOX' | 'DROPDOWN') => {
    let newQuestion: EditableQuestions;
    if (type === 'SUBJECTIVE_QUESTION') {
      newQuestion = {
        type,
        content: '',
        imageUrl: '',
      };
    } else {
      newQuestion = {
        type,
        content: '',
        imageUrl: '',
        choices: [{ option: '' }],
      };
    }
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setSelectedQuestionIndex(survey.questions.length);
    
    if (isMobile || isTablet) {
      setShowMobilePanel('preview');
    }
  };

  const updateQuestion = (questionId: number, updatedData: EditableQuestions) => {
    const updatedQuestions = survey.questions.map((question, index) =>
      index === questionId ? { ...question, ...updatedData } : question,
    );
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const copyQuestion = (index: number) => {
    const questionToCopy = JSON.parse(JSON.stringify(survey.questions[index]));
    const newQuestions = [
      ...survey.questions.slice(0, index + 1),
      questionToCopy,
      ...survey.questions.slice(index + 1),
    ];
    setSurvey({ ...survey, questions: newQuestions });
    setSelectedQuestionIndex(index + 1);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: newQuestions });
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const handleImageUpload = async (
    idx: number,
    data: EditableQuestions,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const { files } = event.target;
    if (files && files[0]) {
      const file = files[0];
      try {
        const uploadedUrl = await uploadS3(file);
        updateQuestion(idx, { ...data, imageUrl: uploadedUrl });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
      }
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadS3(file);
      setSurvey((prev) => ({ ...prev, mainImageUrl: uploadedUrl }));
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const handleSubmit = () => {
    mutate(survey);
  };

  const handleEditSubmit = () => {
    if (userId === null) return;
    const surveyDataWithUserId = {
      ...survey,
      userId,
    };
    editMutate({ surveyId: editId, editSurveyData: surveyDataWithUserId });
  };

  const handleAiGenerate = () => {
    setShowAiModal(false);
    setAiPrompt('');
  };

  // Mobile/Tablet View
  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-screen bg-surface-primary">
        <EditorHeader
          survey={survey}
          setSurvey={setSurvey}
          devicePreview={devicePreview}
          setDevicePreview={setDevicePreview}
          onSave={isEditMode ? handleEditSubmit : handleSubmit}
          isEditMode={isEditMode}
          isMobile={true}
          onAiGenerate={() => setShowAiModal(true)}
        />
        
        {/* Mobile Tab Navigation */}
        <div className="flex border-b border-border-light bg-white">
          <button
            onClick={() => setShowMobilePanel('components')}
            className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
              showMobilePanel === 'components'
                ? 'text-text-primary'
                : 'text-text-tertiary'
            }`}
          >
            컴포넌트
            {showMobilePanel === 'components' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setShowMobilePanel('preview')}
            className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
              showMobilePanel === 'preview'
                ? 'text-text-primary'
                : 'text-text-tertiary'
            }`}
          >
            미리보기
            {showMobilePanel === 'preview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setShowMobilePanel('properties')}
            className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
              showMobilePanel === 'properties'
                ? 'text-text-primary'
                : 'text-text-tertiary'
            }`}
          >
            속성
            {showMobilePanel === 'properties' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {showMobilePanel === 'components' && (
            <ComponentPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              addQuestion={addQuestion}
              survey={survey}
              setSurvey={setSurvey}
              onCoverImageUpload={handleCoverImageUpload}
            />
          )}
          {showMobilePanel === 'preview' && (
            <FormPreview
              survey={survey}
              setSurvey={setSurvey}
              selectedQuestionIndex={selectedQuestionIndex}
              setSelectedQuestionIndex={setSelectedQuestionIndex}
              updateQuestion={updateQuestion}
              copyQuestion={copyQuestion}
              deleteQuestion={deleteQuestion}
              handleImageUpload={handleImageUpload}
              devicePreview="mobile"
            />
          )}
          {showMobilePanel === 'properties' && (
            <PropertyPanel
              survey={survey}
              setSurvey={setSurvey}
              selectedQuestionIndex={selectedQuestionIndex}
              updateQuestion={updateQuestion}
            />
          )}
        </div>

        {/* Alerts */}
        {createErrorMessage && (
          <Alert
            type="error"
            message="설문 생성에 실패했습니다."
            buttonText="확인"
            buttonClick={() => setCreateErrorMessage('')}
          />
        )}
        {isSuccess && (
          <Alert
            type="success"
            message="설문이 생성되었습니다."
            buttonText="확인"
            buttonClick={() => navigate(activeItem === 'all' ? '/all' : '/myform')}
          />
        )}
        {editErrorMessage && (
          <Alert
            type="error"
            message="설문 수정에 실패했습니다."
            buttonText="확인"
            buttonClick={() => setEditErrorMessage('')}
          />
        )}
        {editSuccess && (
          <Alert
            type="success"
            message="설문이 수정되었습니다."
            buttonText="확인"
            buttonClick={() => navigate('/myform')}
          />
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="flex flex-col h-screen bg-surface-primary">
      <EditorHeader
        survey={survey}
        setSurvey={setSurvey}
        devicePreview={devicePreview}
        setDevicePreview={setDevicePreview}
        onSave={isEditMode ? handleEditSubmit : handleSubmit}
        isEditMode={isEditMode}
        isMobile={false}
        onAiGenerate={() => setShowAiModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Components */}
        <div className="w-64 xl:w-72 border-r border-border-light bg-white flex-shrink-0 overflow-y-auto">
          <ComponentPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addQuestion={addQuestion}
            survey={survey}
            setSurvey={setSurvey}
            onCoverImageUpload={handleCoverImageUpload}
          />
        </div>

        {/* Center - Preview */}
        <div className="flex-1 overflow-hidden">
          <FormPreview
            survey={survey}
            setSurvey={setSurvey}
            selectedQuestionIndex={selectedQuestionIndex}
            setSelectedQuestionIndex={setSelectedQuestionIndex}
            updateQuestion={updateQuestion}
            copyQuestion={copyQuestion}
            deleteQuestion={deleteQuestion}
            handleImageUpload={handleImageUpload}
            devicePreview={devicePreview}
          />
        </div>

        {/* Right Panel - Properties */}
        <div className="w-72 xl:w-80 border-l border-border-light bg-white flex-shrink-0 overflow-y-auto">
          <PropertyPanel
            survey={survey}
            setSurvey={setSurvey}
            selectedQuestionIndex={selectedQuestionIndex}
            updateQuestion={updateQuestion}
          />
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAiModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-5 border-b border-border-light">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">AI 설문 생성</h3>
                <p className="text-sm text-text-tertiary">원하는 설문을 설명해주세요</p>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="ml-auto p-2 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="예: 고객 만족도 조사를 위한 설문을 만들어줘. NPS 점수와 서비스 개선 의견을 물어보고 싶어."
                className="w-full h-32 px-4 py-3 border border-border-light rounded-xl resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-3 border border-border-light rounded-xl font-medium hover:bg-surface-secondary transition-colors text-text-secondary"
                >
                  취소
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={!aiPrompt.trim()}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    <path d="M20 3v4" />
                    <path d="M22 5h-4" />
                  </svg>
                  생성하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {createErrorMessage && (
        <Alert
          type="error"
          message="설문 생성에 실패했습니다."
          buttonText="확인"
          buttonClick={() => setCreateErrorMessage('')}
        />
      )}
      {isSuccess && (
        <Alert
          type="success"
          message="설문이 생성되었습니다."
          buttonText="확인"
          buttonClick={() => navigate(activeItem === 'all' ? '/all' : '/myform')}
        />
      )}
      {editErrorMessage && (
        <Alert
          type="error"
          message="설문 수정에 실패했습니다."
          buttonText="확인"
          buttonClick={() => setEditErrorMessage('')}
        />
      )}
      {editSuccess && (
        <Alert
          type="success"
          message="설문이 수정되었습니다."
          buttonText="확인"
          buttonClick={() => navigate('/myform')}
        />
      )}
    </div>
  );
}

export default FormEditor;
