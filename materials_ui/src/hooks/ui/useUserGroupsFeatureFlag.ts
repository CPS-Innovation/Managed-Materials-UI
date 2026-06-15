import { useMsal } from '@azure/msal-react';
import { PRIVATE_BETA_FEATURE_USER_GROUPS } from '../../constants';

export type UserGroupsFeatureFlags = { bulkRedaction: boolean };

const featureFlagsDisabled =
  import.meta.env.VITE_DISABLE_FEATURE_FLAGS === 'true';

export const useUserGroupsFeatureFlag = (): UserGroupsFeatureFlags => {
  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  const groupClaims = (account?.idTokenClaims?.groups as string[]) ?? [];

  const isInGroup = (groupIndex: number) => {
    if (featureFlagsDisabled) return true;
    const groupGuid = PRIVATE_BETA_FEATURE_USER_GROUPS[groupIndex];
    return !!groupGuid && groupClaims.includes(groupGuid);
  };

  return { bulkRedaction: isInGroup(2) };
};
