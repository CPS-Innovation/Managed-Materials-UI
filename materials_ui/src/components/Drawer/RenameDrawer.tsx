import { ChangeEvent, FormEvent, useState } from 'react';
import { useRename } from '../../hooks';
import { TDocument } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { CaseMaterialsType } from '../../schemas';
import { trackAction } from '../../telemetry/appInsights';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import Drawer from './Drawer';

type Props = {
  material: CaseMaterialsType | (TDocument & { materialId?: number }) | null;
  onCancel: () => void;
  onSuccess: () => void;
};

export const RenameDrawer = ({ material, onCancel, onSuccess }: Props) => {
  const { isMutating, trigger: renameMaterial } = useRename(material, {
    onSuccess: () => {
      trackAction('Renamed', {
        materialId:
          material && 'materialId' in material
            ? material.materialId
            : undefined,
        category:
          material && 'category' in material ? material.category : undefined
      });
      onSuccess();
    }
  });
  const [error, setError] = useState<string>('');

  const getDefaultMaterialName = (
    material: CaseMaterialsType | TDocument | null
  ) => {
    if (!material) return '';
    if ('subject' in material && typeof material.subject === 'string') {
      return material.subject;
    }
    if (
      'presentationTitle' in material &&
      typeof material.presentationTitle === 'string'
    ) {
      return material.presentationTitle;
    }
    return '';
  };

  const [inputValue, setInputValue] = useState<string>(
    getDefaultMaterialName(material)
  );

  if (!material) return null;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleCancel = () => {
    setInputValue('');
    setError('');
    onCancel();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      setError('Enter a new name for the material');
      return;
    }

    if (inputValue.length > 252) {
      setError('Name cannot exceed 252 characters');
      return;
    }

    // eslint-disable-next-line no-useless-escape
    const symbolRegex = /[~!@#$%^&*+={}\[\]|;<>?\\£€$¥₹₽₿₩₫]/g;
    if (symbolRegex.test(inputValue)) {
      setError('Name cannot contain symbols');
      return;
    }

    await renameMaterial(inputValue);
  };

  return (
    <Drawer heading="Rename">
      <LoadingSpinner
        isLoading={isMutating}
        textContent="Renaming material..."
      />
      {!isMutating && (
        <form onSubmit={handleSubmit}>
          <div
            className={`${
              error ? 'govuk-form-group--error' : 'govuk-form-group'
            }`}
          >
            <div>
              <h1 className="govuk-label-wrapper">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="new-material-name"
                >
                  What is the new name of the material?
                </label>
              </h1>

              {error && (
                <p id="event-name-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error: {error}</span>
                  {error}
                </p>
              )}

              <input
                className={`${
                  error ? 'govuk-input govuk-input--error' : 'govuk-input'
                }`}
                id="new-material-name"
                name="newMaterialName"
                type="text"
                defaultValue={getDefaultMaterialName(material)}
                aria-describedby="event-name-hint event-name-error"
                onChange={handleInputChange}
                autoFocus
              />
            </div>

            <div className="govuk-button-group" style={{ marginTop: '20px' }}>
              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={!inputValue?.trim()}
              >
                Save and close
              </button>
              <a
                href="#"
                className="govuk-link cancel-status-change"
                onClick={(event) => {
                  event.preventDefault();
                  handleCancel();
                }}
              >
                Cancel
              </a>
            </div>
          </div>
        </form>
      )}
    </Drawer>
  );
};
