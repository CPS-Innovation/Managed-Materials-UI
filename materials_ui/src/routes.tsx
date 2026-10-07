import { Route, Routes as Router } from 'react-router';
import { Navigate } from 'react-router-dom';

import { ReviewAndRedactPage } from './caseWorkApp/pages/ReviewAndRedactPage/ReviewAndRedactPage';
import { APP_ROUTES } from './hooks/ui/useAppRoute';
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
  ServerErrorPage,
} from './pages';
import { CaseSearchPage } from './pages/CaseSearch';
import { TwoTabsPage } from './pages/TwoTabsPage';
import { ViewDocumentPage } from './pages/ViewDocumentPage';

export const Routes = () => {
  return (
    <Router>
      <Route path="/" element={<Navigate to={`/${APP_ROUTES.CASE_SEARCH}`} replace />} />

      <Route path={`/${APP_ROUTES.UNAUTHORISED}`} element={<NotAuthorisedPage />} />
      <Route path={`/${APP_ROUTES.SERVER_ERROR}`} element={<ServerErrorPage />} />
      <Route path={`/${APP_ROUTES.CASE_SEARCH}`} element={<CaseSearchPage />} />

      <Route path={`:caseId/`}>
        <Route
          path={`${APP_ROUTES.VIEW_DOCUMENT}/:materialId/:documentId`}
          element={<ViewDocumentPage />}
        />
        <Route path={`${APP_ROUTES.TWO_TABS}`} element={<TwoTabsPage />} />
        <Route path={`${APP_ROUTES.DISCARD}`} element={<DiscardMaterialPage />} />
        <Route path={`${APP_ROUTES.PCD_REQUEST}/:pcdId?`} element={<PcdRequestPage />} />
        <Route path={`${APP_ROUTES.PCD_REVIEW}/:reviewHistoryId?`} element={<PcdReviewPage />} />
        <Route path={`${APP_ROUTES.MATERIALS}`} element={<MaterialsPage />} />
        <Route path={`${APP_ROUTES.COMMUNICATIONS}`} element={<CommunicationsPage />} />
        <Route path={`${APP_ROUTES.REVIEW_REDACT}`} element={<ReviewAndRedactPage />} />
        <Route path={`${APP_ROUTES.RECLASSIFY_TO_UNUSED}`} element={<ReclassifyToUnusedPage />} />
        <Route path={`${APP_ROUTES.RECLASSIFICATION}`} element={<ReclassificationPage />} />
        <Route path={`${APP_ROUTES.UPDATE_MATERIAL}`} element={<EditMaterialPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Router>
  );
};
