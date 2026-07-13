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
      if (response.witnessResult?.success && response.actionPlanResult?.success === false) {
        return [
          {
            type: 'success',
            header: 'Reclassification successful',
            content: 'Material reclassified and witness added successfully.',
          },
          {
            type: 'error',
            header: 'Action plan creation failed',
            content: 'Unable to reclassify material, add witness and send action plan.',
          },
        ];
      }

      if (response.witnessResult?.success && response.actionPlanResult?.success) {
        return [
          {
            type: bannerTypes.success,
            header: 'Reclassification successful',
            content: 'Material reclassified, witness added and action plan sent successfully.',
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
    } else if (response.status === 'PartialSuccess') {
      if (
        response.reclassificationResult?.success &&
        response.actionPlanResult?.success === false
      ) {
        return [
          {
            type: 'success',
            header: 'Reclassification successful',
            content: 'Material reclassified and witness added successfully.',
          },
          {
            type: 'error',
            header: 'Action plan creation failed',
            content: 'Unable to send action plan.',
          },
        ];
      }

      if (
        response.reclassificationResult?.success === false &&
        response.witnessResult?.success === false &&
        response.actionPlanResult?.success
      ) {
        return [
          {
            type: 'success',
            header: 'Action plan success',
            content: 'Action plan sent successfully.',
          },
          {
            type: 'error',
            header: 'Reclassification failed',
            content: 'Unable to reclassify material and add witness.',
          },
        ];
      }

      if (
        response.reclassificationResult?.success === false &&
        response.witnessResult?.success &&
        response.actionPlanResult?.success
      ) {
        return [
          {
            type: 'success',
            header: 'New witness and action plan success',
            content: 'New witness added and action plan sent successfully.',
          },
          {
            type: 'error',
            header: 'Reclassification failed',
            content: 'Unable to reclassify material.',
          },
        ];
      }

      return [];
    } else {
      if (
        response.witnessResult?.success === false &&
        response.actionPlanResult?.success === false
      ) {
        return [
          {
            type: bannerTypes.error,
            header: 'Reclassification failed',
            content: 'Unable to reclassify material, add witness and send action plan.',
          },
        ];
      }

      return [
        {
          type: bannerTypes.error,
          header: 'Reclassification failed',
          content: 'Unable to reclassify material.',
        },
      ];
    }
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
