import { Link } from 'react-router-dom';
import { URL } from '../../../constants/url.ts';
import { type ContentItem, SummaryCard } from '../../SummaryCard/SummaryCard.tsx';

type Props = {
  onChange: () => void;
  onSave: () => void;
  summaryCardData: ContentItem[];
  title: string;
};

export const Summary = ({ onChange, onSave, summaryCardData, title }: Props) => {
  const handleChangeClick = () => {
    onChange();
  };

  const handleSaveClick = () => {
    onSave();
  };

  return (
    <>
      <h1 className="govuk-heading-l">Check your answers</h1>

      <SummaryCard action={handleChangeClick} title={title} content={summaryCardData} />

      <div className="govuk-button-group">
        <button className="govuk-button" data-module="govuk-button" onClick={handleSaveClick}>
          Save
        </button>
        <Link to={URL.MATERIALS} className="govuk-link cancel-status-change">
          Cancel
        </Link>
      </div>
    </>
  );
};
