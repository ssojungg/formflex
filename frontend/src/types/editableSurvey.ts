export type EditableChoice = {
  option: string;
};

export type EditableObjectiveQuestion = {
  id?: number;
  type: 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN';
  content: string;
  imageUrl?: string;
  choices: EditableChoice[];
};

export type EditableSubjectiveQuestion = {
  id?: number;
  type: 'SUBJECTIVE_QUESTION';
  content: string;
  imageUrl?: string;
};

export type EditableQuestions = EditableObjectiveQuestion | EditableSubjectiveQuestion;

export type EditableSurvey = {
  userId: number;
  title: string;
  description: string;
  open: boolean;
  font: string;
  color: string;
  buttonStyle: 'angled' | 'smooth' | 'round'; // 각지게, 부드럽게, 동글게
  mainImageUrl?: string;
  deadline: string;
  questions: EditableQuestions[];
  // pdf 기능 마지막에 넣는 이유는 기능을 끄면 안 보내도 되어서 optional
  emailReportEnabled?: boolean;
  emailReportThreshold?: number;
  reportEmail?: string;
};
