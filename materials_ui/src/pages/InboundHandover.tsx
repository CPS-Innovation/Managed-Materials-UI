import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getJourneyRoute, parseJourneyContext } from '../handover/journeyContext';
import { saveJourneyContext } from '../handover/journeyContextStorage';
import { BadRequestPage } from './BadRequestPage';

export const InboundHandoverPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const result = parseJourneyContext(search);

  useEffect(() => {
    if (!result.success) return;

    saveJourneyContext(result.context);
    navigate(getJourneyRoute(result.context), { replace: true });
  }, [search]);

  return result.success ? null : <BadRequestPage reason={result.reason} />;
};
