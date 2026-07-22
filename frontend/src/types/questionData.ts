export type Choice = {
  choiceId: number;
  option: string;
  count?: number;
};

export type Answer = {
  answerId: number;
  content: string;
};

export type QuestionData = {
  questionId: number;
  type: 'MULTIPLE_CHOICE' | 'SUBJECTIVE_QUESTION' | 'CHECKBOX' | 'DROPDOWN';
  content: string;
  imageUrl: string;
  choices?: Choice[];
  answers?: Answer[];
  // Sub-format of a SUBJECTIVE_QUESTION (short_text/long_text/email/number/date/rating).
  // Not yet returned by the backend — see Issue 5 backend notes.
  format?: string;
};

export type ExtendedQuestionData = QuestionData & {
  objContent?: number[];
  subContent?: string;
};

export type Questions = QuestionData[] | ExtendedQuestionData[];

export type QuestionDataForm = {
  surveyId: number;
  userId?: number;
  userName?: string;
  title: string;
  description: string;
  font: string;
  color: string;
  buttonStyle: 'angled' | 'smooth' | 'round'; // 각지게, 부드럽게, 동글게
  mainImageUrl: string;
  createdAt: string;
  deadline: string;
  questions: Questions;
};

export type QuestionResultForm = {
  surveyId: number;
  userName: string;
  title: string;
  open: boolean;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  questions: Questions;
};

export type ResponseSubmit = {
  userId: number;
  questions: {
    questionId: number;
    objContent?: number[];
    subContent?: string;
  }[];
};

export type ChatData = {
  type: 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN' | null;
  content: string;
  imageUrl: string;
  choices: { option: string }[];
};
