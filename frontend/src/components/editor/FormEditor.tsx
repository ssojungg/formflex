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
import { formatDeadlineDate } from '../../utils/formatDeadlineDate';
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

  // 설문 수정 시 사용할 설문 ID
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

  // 설문 생성
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

  // 문항 추가
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
  };

  // 문항 업데이트
  const updateQuestion = (questionId: number, updatedData: EditableQuestions) => {
    const updatedQuestions = survey.questions.map((question, index) =>
      index === questionId ? { ...question, ...updatedData } : question,
    );
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // 문항 복제
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

  // 문항 삭제
  const deleteQuestion = (index: number) => {
    const newQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: newQuestions });
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  // 이미지 업로드
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

  // 커버 이미지 업로드
  const handleCoverImageUpload = async (file: File) => {
    try {
      const uploadedUrl = await uploadS3(file);
      setSurvey((prev) => ({ ...prev, mainImageUrl: uploadedUrl }));
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  // 설문 저장
  const handleSubmit = () => {
    mutate(survey);
  };

  // 설문 수정
  const handleEditSubmit = () => {
    if (userId === null) return;
    const surveyDataWithUserId = {
      ...survey,
      userId,
    };
    editMutate({ surveyId: editId, editSurveyData: surveyDataWithUserId });
  };

  // 모바일 뷰
  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <EditorHeader
          survey={survey}
          setSurvey={setSurvey}
          devicePreview={devicePreview}
          setDevicePreview={setDevicePreview}
          onSave={isEditMode ? handleEditSubmit : handleSubmit}
          isEditMode={isEditMode}
          isMobile={true}
        />
        
        {/* Mobile Tab Navigation */}
        <div className="flex border-b border-border bg-card">
          <button
            onClick={() => setShowMobilePanel('components')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              showMobilePanel === 'components'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            컴포넌트
          </button>
          <button
            onClick={() => setShowMobilePanel('preview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              showMobilePanel === 'preview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            미리보기
          </button>
          <button
            onClick={() => setShowMobilePanel('properties')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              showMobilePanel === 'properties'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            속성
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

  // 데스크톱 뷰
  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader
        survey={survey}
        setSurvey={setSurvey}
        devicePreview={devicePreview}
        setDevicePreview={setDevicePreview}
        onSave={isEditMode ? handleEditSubmit : handleSubmit}
        isEditMode={isEditMode}
        isMobile={false}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Components */}
        <div className="w-64 border-r border-border bg-card flex-shrink-0 overflow-y-auto">
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
        <div className="flex-1 overflow-hidden bg-muted/30">
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
        <div className="w-72 border-l border-border bg-card flex-shrink-0 overflow-y-auto">
          <PropertyPanel
            survey={survey}
            setSurvey={setSurvey}
            selectedQuestionIndex={selectedQuestionIndex}
            updateQuestion={updateQuestion}
          />
        </div>
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

export default FormEditor;
