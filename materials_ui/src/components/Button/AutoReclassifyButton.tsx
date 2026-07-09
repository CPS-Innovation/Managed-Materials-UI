import { useState } from 'react';

import { useAutoReclassify, useBanner, useCaseMaterials } from '../../hooks';
import { useMaterialTags } from '../../stores';
import { trackAction } from '../../telemetry/appInsights';

export const AutoReclassifyButton = () => {
  const [errorCount, setErrorCount] = useState(0);
  const { resetBanner, setBanner } = useBanner();
  const { mutate: refreshMaterials } = useCaseMaterials({
    dataType: 'materials'
  });
  const { setTags } = useMaterialTags();

  const { mutate: submitAutoReclassifyRequest } = useAutoReclassify({
    onError: (error) => {
      const totalErrors = errorCount + 1;

      if (error.status === 404) {
        setBanner({
          type: 'important',
          header: 'Important',
          content: 'No materials were identified for reclassification.'
        });
      }

      if (error.status === 500) {
        if (totalErrors < 2) {
          setBanner({
            type: 'error',
            header: 'An error occurred',
            content:
              'There was a problem reclassifying materials. Please try again.'
          });
        } else {
          setBanner({
            type: 'error',
            header: 'An error occurred',
            content:
              'Materials cannot be reclassified automatically. You can still reclassify materials manually.'
          });
        }
      }

      setErrorCount(totalErrors);
    },
    onSuccess: async (data) => {
      const totalMaterialsProcessed = data.reclassifiedMaterials.length || 1;
      trackAction('UpdatedAutomatically', { count: totalMaterialsProcessed });

      setTags(
        data?.reclassifiedMaterials?.map((material) => ({
          materialId: material?.materialId,
          tagName: 'Reclassified'
        }))
      );

      setErrorCount(0);
      setBanner({
        type: 'success',
        header: 'Reclassification successful',
        content: `${totalMaterialsProcessed} Unused Material${totalMaterialsProcessed === 1 ? '' : 's'} reclassified successfully.`
      });

      await refreshMaterials();
    }
  });

  const handleClick = async () => {
    resetBanner();

    await submitAutoReclassifyRequest();
  };

  return (
    <button
      type="submit"
      disabled={errorCount > 1}
      className="govuk-button govuk-button--secondary"
      data-module="govuk-button"
      onClick={handleClick}
    >
      Update automatically
    </button>
  );
};
