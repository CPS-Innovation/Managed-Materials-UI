import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { PRIVATE_BETA_FEATURE_USER_GROUPS } from '../constants/featureFlagGroups';
import { UserGroupType } from '../schemas/user';

// TODO: return to this type
export type GroupContextType = {
  groups: UserGroupType[];
  setGroups: (groups: UserGroupType[]) => void;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  hasAppAccess: () => boolean;
};

export const GroupDataContext = createContext<GroupContextType>({} as GroupContextType);

export const GroupDataProvider = ({ children }: PropsWithChildren) => {
  const [groups, setGroups] = useState<UserGroupType[]>(() => {
    const assignedGroups = localStorage.getItem('groups');
    return assignedGroups ? JSON.parse(assignedGroups) : [];
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken') || null;
  });

  const availableGroups = Object.values(PRIVATE_BETA_FEATURE_USER_GROUPS);

  const hasAppAccess = () => {
    return groups.some((gp) => availableGroups.includes(gp.id));
  };

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('groups', JSON.stringify(groups));
    } else {
      localStorage.removeItem('groups');
    }
  }, [groups]);

  return (
    <GroupDataContext.Provider
      value={{ groups, setGroups, accessToken, setAccessToken, hasAppAccess }}
    >
      {children}
    </GroupDataContext.Provider>
  );
};
