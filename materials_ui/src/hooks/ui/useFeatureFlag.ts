import { useContext } from 'react';
import { PRIVATE_BETA_FEATURE_USER_GROUPS } from '../../constants';
import { GroupDataContext } from '../../context';
import { UserGroupType } from '../../schemas/user';

type UseFeatureFlag = (allowedGroups: number[], groupsOverride?: UserGroupType[]) => boolean;

const featureFlagsDisabled = import.meta.env.VITE_DISABLE_FEATURE_FLAGS === 'true';

export const useFeatureFlag = (): UseFeatureFlag => {
  const { groups = [] } = useContext(GroupDataContext);

  return (allowedGroups: number[], groupsOverride?: UserGroupType[]) => {
    if (featureFlagsDisabled) {
      return true;
    }

    if (!groups?.length && !groupsOverride?.length) {
      return false;
    }

    return (groupsOverride || groups).some((group: UserGroupType) =>
      allowedGroups
        .map((groupId) => {
          return PRIVATE_BETA_FEATURE_USER_GROUPS[groupId];
        })
        .includes(group?.id),
    );
  };
};
