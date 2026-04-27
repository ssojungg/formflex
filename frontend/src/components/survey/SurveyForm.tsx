import { SurveyCoverType } from '../../types/survey';
import { Dashboard } from '../dashboard/Dashboard';

interface SurveyFormProps {
  surveyData: SurveyCoverType;
  currentPage: number;
  onClickAddButton?: () => void;
  onPageChange: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  onSortChange: (sort: string) => void;
}

function SurveyForm({
  surveyData,
  currentPage,
  onClickAddButton,
  onPageChange,
  searchTerm,
  setSearchTerm,
  onSortChange,
}: SurveyFormProps) {
  return (
    <Dashboard
      surveyData={surveyData}
      currentPage={currentPage}
      onClickAddButton={onClickAddButton}
      onPageChange={onPageChange}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSortChange={onSortChange}
    />
  );
}

export default SurveyForm;
