import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useCaseDetails } from '../../hooks/search/useCaseSearch';
import {
  postRedactionLog,
  useAxiosInstances
} from '../../caseWorkApp/components/utils/getData';
import { TLookupsResponse } from '../../caseWorkApp/types/redaction';
import { TDocument } from '../DocumentSelectAccordion/getters/getDocumentList';
import { TRedactionType } from '../PdfRedactor/PdfRedactionTypeForm';
import { TRedaction } from '../PdfRedactor/utils/coordUtils';
import { Modal } from './Modal';
import styles from './RedactionLogModal.module.scss';
import { RedactionLogModalBody } from './RedactionLogModalBody';
import { RedactionLogModalHeader } from './RedactionLogModalHeader';
import { transformFormDataToApiFormat } from './utils/transformFormData';
import { ChargeStatusCode } from '../../constants/chargeStatus';

export type RedactionLogFormInputs = {
  underRedactionSelected: boolean;
  overRedactionSelected: boolean;

  underRedactionTypeIds: number[];
  overRedactionTypeIds: number[];

  areasAndDivisionsId: string;
  businessUnitId: string;
  investigatingAgencyId: string;
  chargeStatus: ChargeStatusCode;
  documentTypeId: string | number;

  category: 'under' | 'over' | null;
  overReason: 'investigative-agency' | 'cps-colleague' | null;
  redactionTypes: number[];
  supportingNotes: string;
};

type RedactionLogModalProps = {
  urn: string;
  caseId?: number;
  activeDocument?: TDocument | null;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  lookups?: TLookupsResponse;
  mode?: 'over-under' | 'list';
  redactions?: TRedaction[];
  selectedRedactionTypes?: TRedactionType[];
  redactionSaveStatus?: 'saving' | 'saved';
};

const WhiteTickIcon = () => (
  <svg
    className={styles.whiteTickIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M369.2,174.8c7.8,7.8,7.8,20.5,0,28.3L235,337.2c-7.8,7.8-20.5,7.8-28.3,0l-63.9-63.9c-7.8-7.8-7.8-20.5,0-28.3c7.8-7.8,20.5-7.8,28.3,0l49.7,49.7l120-120C348.7,167,361.4,167,369.2,174.8z M512,256c0,141.5-114.5,256-256,256C114.5,512,0,397.5,0,256C0,114.5,114.5,0,256,0C397.5,0,512,114.5,512,256z M472,256c0-119.4-96.6-216-216-216C136.6,40,40,136.6,40,256c0,119.4,96.6,216,216,216C375.4,472,472,375.4,472,256z" />
  </svg>
);

export const RedactionLogModal = ({
  urn,
  activeDocument,
  isOpen,
  caseId,
  onClose,
  lookups,
  mode,
  redactions,
  selectedRedactionTypes,
  redactionSaveStatus
}: RedactionLogModalProps) => {
  const { data: caseDetailsResponse } = useCaseDetails({ urn });

  const chargeStatusFromCase = useMemo((): ChargeStatusCode | undefined => {
    if (!caseId || !caseDetailsResponse?.data) {
      return undefined;
    }

    const row = caseDetailsResponse.data.find(({ id }) => id === caseId);

    if (!row) {
      return undefined;
    }

    return row.isCaseCharged
      ? ChargeStatusCode.PostCharge
      : ChargeStatusCode.PreCharge;
  }, [caseId, caseDetailsResponse]);

  const policeCode = urn.substring(0, 2);

  const existingInvestigatingAgencyId = lookups?.ouCodeMapping.find(
    (ia) => ia.ouCode === policeCode
  )?.investigatingAgencyCode;

  const { redactionLogAxios } = useAxiosInstances();

  const form = useForm<RedactionLogFormInputs>({
    defaultValues: {
      underRedactionSelected: false,
      overRedactionSelected: false,
      underRedactionTypeIds: [],
      overRedactionTypeIds: [],

      overReason: null,
      areasAndDivisionsId: '',
      businessUnitId: '',
      investigatingAgencyId: existingInvestigatingAgencyId || '',
      chargeStatus: chargeStatusFromCase ?? ChargeStatusCode.PreCharge,
      documentTypeId: activeDocument?.cmsDocType.documentTypeId || '',
      supportingNotes: ''
    }
  });

  const onSubmit = async (values: RedactionLogFormInputs) => {
    try {
      const apiData = transformFormDataToApiFormat(
        values,
        urn,
        activeDocument,
        lookups
      );

      // TODO: ensure documentType values are taken from the dropdown selection
      // and propagated into apiData.documentType and apiData.cmsValues.
      // This is required to avoid API validation errors: DocumentType.Name is required.
      console.log('Submitting redaction log:', apiData);

      await postRedactionLog({
        axiosInstance: redactionLogAxios,
        data: apiData
      });

      console.log('Redaction log submitted successfully');
      onClose();
    } catch (error) {
      console.error('Failed to submit redaction log:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {redactionSaveStatus === 'saving' && (
            <div className={styles.savingBanner}>
              <div className={styles.spinner} />
              <h2 className={styles.bannerText}>Saving redactions...</h2>
            </div>
          )}

          {redactionSaveStatus === 'saved' && (
            <div className={styles.savedBanner}>
              <WhiteTickIcon />
              <h2 className={styles.bannerText}>
                Redactions successfully saved
              </h2>
            </div>
          )}

          <RedactionLogModalHeader urn={urn} lookups={lookups} />

          <RedactionLogModalBody
            activeDocument={activeDocument}
            mode={mode}
            redactions={redactions}
            selectedRedactionTypes={selectedRedactionTypes}
            lookups={lookups}
          />

          <div className={styles.modalFooter}>
            <div className="govuk-button-group">
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                data-testid="saveChangesButton"
                disabled={form.formState.isSubmitting}
              >
                Save and close
              </button>
              <button
                onClick={onClose}
                type="button"
                className="govuk-button govuk-button--secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
