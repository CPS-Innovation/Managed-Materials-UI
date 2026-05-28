import { StatusTag as StatusTagEnum } from '../../schemas';

type Props = { status: StatusTagEnum };

export const StatusTag = ({ status }: Props) => {
  let className = 'govuk-tag';

  switch (status) {
    case 'Unused':
    case 'Not yet charged':
      className += ' govuk-tag--yellow';
      break;
    case 'Used':
    case 'Charged':
      className += ' govuk-tag--blue';
      break;
    case 'None':
      className += ' govuk-tag--grey';
      break;
    case 'Reclassified':
    case 'Renamed':
    case 'Updated':
      className += ' govuk-tag--green successful-tag';
      break;
    case 'New':
      className += ' govuk-tag--blue new-tag';
      break;
    default:
      className += ' govuk-tag--grey';
  }

  return <p className={className}>{status}</p>;
};
