import { BannerType, BannerTypeSchema } from '../schemas/banner';
import {
  Reclassify_ClassificationEnumType,
  Reclassify_Orchestrated_Response_Type,
} from '../schemas/forms/reclassify';

export const getBannerData = (
  response: Reclassify_Orchestrated_Response_Type,
  classificationType: Reclassify_ClassificationEnumType,
  isRenamed: boolean,
): BannerType[] => {
  const bannerTypes = BannerTypeSchema.enum;

  // STATEMENT HANDLING
  if (classificationType === 'STATEMENT') {
    if (response.status === 'Success') {
      return [
        {
          type: bannerTypes.success,
          header: 'Reclassification successful',
          content: 'Material reclassified successfully.',
        },
      ];
    }

    if (response.status === 'Failed') {
      return [
        {
          type: bannerTypes.error,
          header: 'Reclassification failed',
          content: 'Unable to reclassify material.',
        },
      ];
    }

    return [];
  }

  // reclassification success
  if (response.status === 'Success') {
    // renamed success
    if (isRenamed && response.renameMaterialResult?.success) {
      return [
        {
          type: bannerTypes.success,
          header: 'Reclassification successful',
          content: 'Material reclassified and renamed successfully.',
        },
      ];
    }

    return [
      {
        type: bannerTypes.success,
        header: 'Reclassification successful',
        content: 'Material reclassified successfully.',
      },
    ];
  }

  // reclassification success only, no rename
  if (response.status === 'PartialSuccess') {
    const banners = [];

    if (!response.renameMaterialResult?.success) {
      banners.push({
        type: bannerTypes.success,
        header: 'Reclassification successful',
        content: 'Material reclassified successfully.',
      });

      if (isRenamed && !response.renameMaterialResult?.success) {
        banners.push({
          type: bannerTypes.error,
          header: 'Rename failed',
          content: 'Unable to rename material.',
        });
      }
    } else {
      banners.push({
        type: bannerTypes.error,
        header: 'Reclassification failed',
        content: 'Unable to reclassify material.',
      });
      if (isRenamed) {
        banners.push({
          type: bannerTypes.success,
          header: 'Renamed successfully',
          content: 'Material renamed successfully.',
        });
      }
    }

    return banners;
  }

  return [
    { type: 'error', header: 'Reclassification failed', content: 'Unable to reclassify material.' },
  ];
};
