import { useEffect } from 'react';
import { Route, Routes as Router } from 'react-router';
import { Navigate, useMatch } from 'react-router-dom';

import { ReviewAndRedactPage } from './caseWorkApp/pages/ReviewAndRedactPage/ReviewAndRedactPage';
import { useAppRoute, useCaseInfo, useCaseInfoStore } from './hooks';
import {
  CommunicationsPage,
  DiscardMaterialPage,
  EditMaterialPage,
  MaterialsPage,
  NotAuthorisedPage,
  NotFoundPage,
  PcdRequestPage,
  PcdReviewPage,
  ReclassificationPage,
  ReclassifyToUnusedPage,
  ServerErrorPage
} from './pages';
import { CaseSearchPage } from './pages/CaseSearch';
import { ViewDocumentPage } from './pages/ViewDocumentPage';

export const Routes = () => {
  const { getRoute } = useAppRoute();
  const match = useMatch('/:urn/:caseId/*');
  const { caseId, urn } = match?.params || {};

  const { caseInfo, loading: caseInfoLoading } = useCaseInfo({ caseId, urn });
  const { setCaseInfo, setIsLoading } = useCaseInfoStore();

  useEffect(() => {
    if (caseInfo) {
      setCaseInfo(caseInfo);
    }
  }, [caseInfo]);

  useEffect(() => {
    setIsLoading(caseInfoLoading);
  }, [caseInfoLoading]);

  return (
    <Router>
      <Route
        path="/"
        element={<Navigate to={getRoute('CASE_SEARCH', false)} replace />}
      />

      <Route
        path={getRoute('UNAUTHORISED', false)}
        element={<NotAuthorisedPage />}
      />
      <Route
        path={getRoute('SERVER_ERROR', false)}
        element={<ServerErrorPage />}
      />
      <Route
        path={getRoute('CASE_SEARCH', false)}
        element={<CaseSearchPage />}
      />
      <Route
        path={'/:urn/:caseId/view-document/:documentId'}
        element={<ViewDocumentPage />}
      />

      <Route path={`:urn/:caseId`}>
        <Route
          path={getRoute('DISCARD', false)}
          element={<DiscardMaterialPage />}
        />
        <Route
          path={`${getRoute('PCD_REQUEST', false)}/:pcdId?`}
          element={<PcdRequestPage />}
        />
        <Route
          path={`${getRoute('PCD_REVIEW', false)}`}
          element={<PcdReviewPage />}
        />
        <Route
          path={getRoute('MATERIALS', false)}
          element={<MaterialsPage />}
        />
        <Route
          path={getRoute('COMMUNICATIONS', false)}
          element={<CommunicationsPage />}
        />
        <Route
          path={getRoute('REVIEW_REDACT', false)}
          element={<ReviewAndRedactPage />}
        />
        <Route
          path={getRoute('REVIEW_REDACT', false)}
          element={<ReviewAndRedactPage />}
        />
        <Route
          path={getRoute('RECLASSIFY_TO_UNUSED', false)}
          element={<ReclassifyToUnusedPage />}
        />
        <Route
          path={getRoute('RECLASSIFICATION', false)}
          element={<ReclassificationPage />}
        />
        <Route
          path={getRoute('UPDATE_MATERIAL', false)}
          element={<EditMaterialPage />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Router>
  );
};
