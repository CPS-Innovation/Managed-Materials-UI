import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import { Layout, StatusTag } from '../components';
import { QUERY_KEYS } from '../constants/query';
import { useAppRoute, useBanner, useBulkSetUnused, useFilters, useLogger } from '../hooks';
import { CaseMaterialsType } from '../schemas';
import { useMaterialTags } from '../stores';

export const ReclassifyToUnusedPage = () => {
  const [caseMaterials, setCaseMaterials] = useState<CaseMaterialsType[]>([]);
  const { setTags } = useMaterialTags();
  const { getRoute } = useAppRoute();
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { resetFilters } = useFilters('materials');
  const { log } = useLogger();

  const { setBanner } = useBanner();
  const { state } = useLocation();
  const { materials = [], returnUrl } = state as {
    materials?: CaseMaterialsType[];
    returnUrl?: string;
  };

  const returnToMaterialsUrl = returnUrl || getRoute('MATERIALS');

  const { trigger } = useBulkSetUnused({
    onError: () => {
      setBanner({
        type: 'error',
        header: 'Reclassification unsuccessful',
        content: 'There was a problem marking the material as unread.',
      });
    },
    onSuccess: async (response) => {
      const updatedMaterials = response.data?.reclassifiedMaterials;

      setTags(
        updatedMaterials.map((material) => ({
          materialId: material?.materialId,
          tagName: 'Reclassified',
        })),
      );

      setBanner({
        type: 'success',
        header: 'Reclassify to Unused success',
        content: `${updatedMaterials?.length} Unused Material${updatedMaterials?.length === 1 ? '' : 's'} reclassified successfully`,
      });

      log({ logLevel: 0, message: `HK-UI-FE: Materials have been updated: ${updatedMaterials}` });

      resetFilters();

      await mutate(QUERY_KEYS.CASE_MATERIAL);

      navigate(returnToMaterialsUrl, { state: { persistBanner: true } });
    },
  });

  const handleSaveChanges = async () => {
    await trigger(caseMaterials);
  };

  const handleRemoveItem = (material: CaseMaterialsType) => {
    setCaseMaterials(caseMaterials.filter((item) => item.materialId !== material.materialId));

    log({
      logLevel: 1,
      message: `HK-UI-FE: Removed ${material.materialId} from selected materials.`,
    });
  };

  useEffect(() => {
    if (!materials.length) {
      navigate(returnToMaterialsUrl);
    } else {
      setCaseMaterials(materials);
    }
  }, [materials.length]);

  return (
    <Layout plain title="Reclassify to Unused">
      <Link to={returnToMaterialsUrl} className="govuk-back-link">
        Back
      </Link>

      <div className="govuk-main-wrapper">
        <h1 className="govuk-heading-l">Check your selection</h1>

        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            You are reclassifying these materials:
          </strong>
        </div>
        <div className="table-container">
          <table className="govuk-table custom-table-width">
            <caption className="govuk-visually-hidden">
              Confirmation of selected materials to change
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                  Material
                </th>
                <th scope="col" className="govuk-table__header">
                  Classification
                </th>
                <th scope="col" className="govuk-table__header">
                  Status
                </th>
                <th scope="col" className="govuk-table__header"></th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {caseMaterials.length > 0 ? (
                caseMaterials.map((item) => (
                  <tr className="govuk-table__row" key={item.materialId}>
                    <td className="govuk-table__cell">{item.subject}</td>
                    <td className="govuk-table__cell">Other material</td>
                    <td className="govuk-table__cell">
                      <StatusTag status="Unused" />
                    </td>
                    <td className="govuk-table__cell">
                      <a
                        href="#"
                        className="govuk-link"
                        onClick={(event) => {
                          event.preventDefault();
                          handleRemoveItem(item);
                        }}
                        aria-label={`Remove ${item.subject}`}
                      >
                        Remove
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell" colSpan={4}>
                    <p className="govuk-body">No items selected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="govuk-button-group">
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleSaveChanges}
            data-testid="saveChangesButton"
          >
            Save and return to list view
          </button>
          <Link to={returnToMaterialsUrl} className="govuk-link cancel-status-change">
            Cancel
          </Link>
        </div>
      </div>
    </Layout>
  );
};
