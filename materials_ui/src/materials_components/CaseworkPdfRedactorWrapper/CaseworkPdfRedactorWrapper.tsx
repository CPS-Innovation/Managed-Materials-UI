import { ComponentProps, useEffect, useState } from 'react';
import { Button } from '../../caseWorkApp/components/button';
import { useAxiosInstance } from '../DocumentSelectAccordion/getters/getAxiosInstance';
import { TDocument } from '../DocumentSelectAccordion/getters/getDocumentList';
import { GovUkBanner } from '../DocumentSelectAccordion/templates/GovUkBanner';
import { PdfRedactorCenteredModal } from '../PdfRedactor/modals/PdfRedactorCenteredModal';
import { PdfRedactorMiniModal } from '../PdfRedactor/modals/PdfRedactorMiniModal';
import { DeletionReasonForm } from '../PdfRedactor/PdfDeletionReasonForm';
import {
  RedactionDetailsForm,
  TRedactionType
} from '../PdfRedactor/PdfRedactionTypeForm';
import { PdfRedactor } from '../PdfRedactor/PdfRedactor';
import { CloseIcon } from '../PdfRedactor/PdfRedactorComponents';
import { GovUkButton } from '../PdfRedactor/templates/GovUkButton';
import { TCoord, TRedaction } from '../PdfRedactor/utils/coordUtils';
import { TIndexedDeletion } from '../PdfRedactor/utils/deletionUtils';
import { TMode } from '../PdfRedactor/utils/modeUtils';
import {
  TIndexedRotation,
  TRotation
} from '../PdfRedactor/utils/rotationUtils';
import type { TSearchHighlight } from '../PdfRedactor/utils/searchHighlightUtils';
import { useWindowMouseListener } from '../PdfRedactor/utils/useWindowMouseListener';
import { useDocumentCheckOutRequest } from './hooks/useDocumentCheckOutRequest';
import {
  combineDeletionsWithDeletionDetails,
  TDeletionDetail
} from './utils/combineRedactionsDeletions';
import { saveDeletions } from './utils/saveDeletionsUtils';
import { saveRedactions } from './utils/saveRedactionsUtils';
import { saveRotations } from './utils/saveRotationsUtils';

const presentationWriteFlagToRedactionDisabledMessageMap: {
  [k: string]: string;
} = {
  IsRedactionServiceOffline:
    'Redaction is currently unavailable and undergoing maintenance.',
  OnlyAvailableInCms: 'This document can only be redacted in CMS.',
  DocTypeNotAllowed: 'Redaction is not supported for this document type.',
  OriginalFileTypeNotAllowed: 'Redaction is not supported for this file type.',
  IsDispatched: 'This is a dispatched document.',
  IsPageRotationModeOn:
    'Redaction is unavailable in page rotation mode, please turn off page rotation to continue with redaction.'
};
const getDocumentRedactionDisabledMessage = (
  doc: TDocument | null | undefined
) => {
  const writePresentationFlag = doc?.presentationFlags?.write;
  if (!writePresentationFlag) return null;

  const value =
    presentationWriteFlagToRedactionDisabledMessageMap[
      `${writePresentationFlag}`
    ];
  return value ? value : null;
};

const createCheckoutMessageFromCheckoutResponse = (p: { message?: string }) =>
  p.message
    ? `It is not possible to redact as ${p.message}. Please try again later.`
    : 'Something has gone wrong, please try again later';

export const CaseworkPdfRedactorWrapper = (p: {
  fileUrl: string;
  mode: TMode;
  onModeChange: (x: TMode) => void;
  urn: string;
  caseId: number;
  versionId: number;
  documentId: string;
  onModification: (x: TDocument) => void;
  document: null | undefined | TDocument;
  onRedactionsChange: (x: TRedaction[]) => void;
  initRedactions: TRedaction[];
  onShowRedactionLogModal: (data: {
    mode: 'list' | 'over-under';
    redactions: TRedaction[];
    selectedRedactionTypes: TRedactionType[];
  }) => void;
  onRedactionSaveStatusChange: (status: 'saving' | 'saved' | undefined) => void;
  onNumOfPagesDocumentChange: (x: number) => void;
  searchHighlights?: TSearchHighlight[];
  focusedSearchIndex?: number;
}) => {
  const [isDocumentCheckedOut, setIsDocumentCheckedOut] = useState(false);
  const [selectedRedactionTypes, setSelectedRedactionTypes] = useState<
    TRedactionType[]
  >([]);

  const documentCheckOutRequest = useDocumentCheckOutRequest({
    caseId: p.caseId,
    urn: p.urn
  });

  const [redactions, setRedactions] = useState<TRedaction[]>(p.initRedactions);
  const [indexedRotation, setIndexedRotation] = useState<TIndexedRotation>({});
  const [indexedDeletion, setIndexedDeletion] = useState<TIndexedDeletion>({});

  const [deletionDetails, setDeletionDetails] = useState<TDeletionDetail[]>([]);

  const cleanupDeletionDetails = () => {
    const deletionIds = Object.values(indexedDeletion)
      .filter((del) => del.isDeleted)
      .map((del) => del.id);
    setDeletionDetails((prev) =>
      prev.filter((detail) => deletionIds.includes(detail.deletionId))
    );
  };

  useEffect(() => cleanupDeletionDetails(), [indexedDeletion]);
  useEffect(() => p.onRedactionsChange(redactions), [redactions]);

  const [redactionPopupProps, setRedactionPopupProps] = useState<Omit<
    ComponentProps<typeof RedactionDetailsForm> & TCoord,
    'onSaveSuccess' | 'onCancelClick'
  > | null>(null);

  const [documentIsCheckedOutPopupProps, setDocumentIsCheckedOutPopupProps] =
    useState<{ message: string } | null>(null);
  const [redactionDisabledModalProps, setRedactionDisabledModalProps] =
    useState<{ message: string } | null>(null);

  const [deleteReasonPopupProps, setDeleteReasonPopupProps] = useState<Omit<
    ComponentProps<typeof DeletionReasonForm> & TCoord,
    'onSaveSuccess' | 'onCancelClick'
  > | null>(null);

  const mousePos = useWindowMouseListener();
  const axiosInstance = useAxiosInstance();

  const removeRedactions = (redactionIds: string[]) => {
    setRedactions((prev) => prev.filter((x) => !redactionIds.includes(x.id)));
  };
  const undeletePage = (pageNumber: number) => {
    setIndexedDeletion((prev) => {
      const { [pageNumber]: _deleted, ...rest } = prev;
      return rest;
    });
  };
  const unrotatePage = (pageNumber: number) => {
    setIndexedRotation((prev) => {
      const noRotation: TRotation = {
        id: crypto.randomUUID(),
        pageNumber,
        rotationDegrees: 0
      };
      return { ...prev, [pageNumber]: noRotation };
    });
  };

  const checkCheckoutStatus = async () => {
    if (isDocumentCheckedOut) return { success: true } as const;
    const checkoutResponse = await documentCheckOutRequest.checkOut({
      documentId: p.documentId,
      versionId: p.versionId
    });
    setIsDocumentCheckedOut(checkoutResponse.success);
    return checkoutResponse;
  };

  return (
    <div>
      {redactionDisabledModalProps &&
        (() => {
          const closeModal = () => setRedactionDisabledModalProps(null);

          return (
            <PdfRedactorCenteredModal
              onBackgroundClick={closeModal}
              onEscPress={closeModal}
            >
              <GovUkBanner
                variant="error"
                headerTitle="Error"
                headerRight={
                  <Button variant="red" autoFocus onClick={closeModal}>
                    <CloseIcon color="white" />
                  </Button>
                }
                contentHeading="Unable to redact"
                contentBody={redactionDisabledModalProps.message}
              />
            </PdfRedactorCenteredModal>
          );
        })()}
      {documentIsCheckedOutPopupProps &&
        (() => {
          const closeModal = () => setDocumentIsCheckedOutPopupProps(null);

          return (
            <PdfRedactorCenteredModal
              onBackgroundClick={closeModal}
              onEscPress={closeModal}
            >
              <div style={{ background: 'white', padding: '20px' }}>
                <h1 className="govuk-heading-m">Failed to redact document</h1>
                <div>{documentIsCheckedOutPopupProps.message}</div>
                <br />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <GovUkButton onClick={closeModal}>Ok</GovUkButton>
                </div>
              </div>
            </PdfRedactorCenteredModal>
          );
        })()}
      {redactionPopupProps &&
        (() => {
          const handleCloseModal = () => {
            removeRedactions(redactionPopupProps.redactionIds);
            setRedactionPopupProps(null);
          };

          return (
            <PdfRedactorMiniModal
              coordX={redactionPopupProps.x}
              coordY={redactionPopupProps.y}
              onBackgroundClick={handleCloseModal}
              onEscPress={handleCloseModal}
            >
              <RedactionDetailsForm
                redactionIds={redactionPopupProps.redactionIds}
                documentId={redactionPopupProps.documentId}
                urn={redactionPopupProps.urn}
                caseId={redactionPopupProps.caseId}
                onRedactionTypeChange={(type) => {
                  if (!type) return;
                  setSelectedRedactionTypes((prev) => {
                    const next = [...prev, { id: type.id, name: type.name }];
                    return next;
                  });
                }}
                onCancelClick={() => {
                  removeRedactions(redactionPopupProps.redactionIds);
                  setRedactionPopupProps(null);
                }}
                onSaveSuccess={() => setRedactionPopupProps(null)}
              />
            </PdfRedactorMiniModal>
          );
        })()}
      {deleteReasonPopupProps &&
        (() => {
          const handleCloseModal = () => {
            undeletePage(deleteReasonPopupProps.pageNumber);
            setDeleteReasonPopupProps(null);
          };

          return (
            <PdfRedactorMiniModal
              coordX={deleteReasonPopupProps.x}
              coordY={deleteReasonPopupProps.y}
              onBackgroundClick={handleCloseModal}
              onEscPress={handleCloseModal}
            >
              <DeletionReasonForm
                pageNumber={deleteReasonPopupProps.pageNumber}
                documentId={deleteReasonPopupProps.documentId}
                urn={deleteReasonPopupProps.urn}
                caseId={deleteReasonPopupProps.caseId}
                onCancelClick={() => {
                  undeletePage(deleteReasonPopupProps.pageNumber);
                  setDeleteReasonPopupProps(null);
                }}
                onSaveSuccess={() => setDeleteReasonPopupProps(null)}
              />
            </PdfRedactorMiniModal>
          );
        })()}

      <PdfRedactor
        fileUrl={p.fileUrl}
        mode={p.mode}
        hideToolbar
        onModeChange={p.onModeChange}
        redactions={redactions}
        onRedactionsChange={(newRedactions) => setRedactions(newRedactions)}
        onAddRedactions={async (add) => {
          const checkoutResponsePromise = checkCheckoutStatus();
          const redactionDisabledMessage = getDocumentRedactionDisabledMessage(
            p.document
          );
          if (redactionDisabledMessage) {
            removeRedactions(add.map((x) => x.id));
            setRedactionDisabledModalProps({
              message: redactionDisabledMessage
            });
            return;
          }
          const checkoutResponse = await checkoutResponsePromise;
          if (!checkoutResponse.success) {
            removeRedactions(add.map((x) => x.id));
            const message = createCheckoutMessageFromCheckoutResponse({
              message: checkoutResponse.message
            });
            setDocumentIsCheckedOutPopupProps({ message });
            return;
          }
          setRedactionPopupProps(() => ({
            x: mousePos.current.x,
            y: mousePos.current.y,
            redactionIds: add.map((x) => x.id),
            documentId: 'This document does not exist',
            urn: 'This URN does not exist',
            caseId: 'This case does not exist'
          }));
        }}
        onRemoveRedactions={() => {}}
        onSaveRedactions={async () => {
          p.onRedactionSaveStatusChange('saving');
          try {
            await saveRedactions({
              axiosInstance,
              urn: p.urn,
              caseId: p.caseId,
              versionId: p.versionId,
              documentId: p.documentId,
              redactions
            });
            setRedactions([]);
            p.onRedactionSaveStatusChange('saved');
            if (p.document) p.onModification(p.document);
            await documentCheckOutRequest.checkIn({
              documentId: p.documentId,
              versionId: p.versionId
            });
          } catch (error) {
            console.error('Failed to save redactions:', error);
            p.onRedactionSaveStatusChange(undefined);
          }
        }}
        onShowRedactionLogModal={(redactions) => {
          p.onShowRedactionLogModal({
            mode: 'list',
            redactions,
            selectedRedactionTypes
          });
        }}
        indexedRotation={indexedRotation}
        onRotationsChange={(newRotations) => setIndexedRotation(newRotations)}
        onRotationAdd={async (newRotation) => {
          const checkoutResponse = await checkCheckoutStatus();

          if (checkoutResponse.success) return;

          unrotatePage(newRotation.pageNumber);

          const message = createCheckoutMessageFromCheckoutResponse({
            message: checkoutResponse.message
          });
          setDocumentIsCheckedOutPopupProps({ message });
        }}
        onRotationRemove={() => {}}
        indexedDeletion={indexedDeletion}
        onDeletionsChange={(newDeletions) => setIndexedDeletion(newDeletions)}
        onDeletionAdd={async (add) => {
          const checkoutResponse = await checkCheckoutStatus();

          if (!checkoutResponse.success) {
            undeletePage(add.pageNumber);

            const message = createCheckoutMessageFromCheckoutResponse({
              message: checkoutResponse.message
            });
            setDocumentIsCheckedOutPopupProps({ message });
            return;
          }

          const newDeletionDetails = {
            deletionId: add.id,
            randomId: `This deletion does ${crypto.randomUUID()}`
          };
          setDeletionDetails((prev) => [...prev, newDeletionDetails]);
          setDeleteReasonPopupProps(() => ({
            x: mousePos.current.x,
            y: mousePos.current.y,
            pageNumber: add.pageNumber,
            documentId: 'This document does not exist',
            urn: 'This URN does not exist',
            caseId: 'This case does not exist'
          }));
        }}
        onDeletionRemove={() => {}}
        onSaveDeletions={async () => {
          combineDeletionsWithDeletionDetails({
            deletions: Object.values(indexedDeletion),
            deletionDetails
          });

          await saveDeletions({
            axiosInstance,
            urn: p.urn,
            caseId: p.caseId,
            versionId: p.versionId,
            documentId: p.documentId,
            deletions: Object.values(indexedDeletion)
          });
          if (p.document) p.onModification(p.document);
          await documentCheckOutRequest.checkIn({
            documentId: p.documentId,
            versionId: p.versionId
          });
        }}
        onSaveRotations={async () => {
          await saveRotations({
            axiosInstance,
            urn: p.urn,
            caseId: p.caseId,
            versionId: p.versionId,
            documentId: p.documentId,
            rotations: Object.values(indexedRotation)
          });
          if (p.document) p.onModification(p.document);
          await documentCheckOutRequest.checkIn({
            documentId: p.documentId,
            versionId: p.versionId
          });
        }}
        initRedactions={p.initRedactions}
        onNumOfDocPagesChanged={p.onNumOfPagesDocumentChange}
        searchHighlights={p.searchHighlights}
        focusedSearchIndex={p.focusedSearchIndex}
      />
    </div>
  );
};
