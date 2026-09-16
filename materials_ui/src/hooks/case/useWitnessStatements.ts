import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import type { WitnessStatementResponseType, WitnessStatementType } from '../../schemas/witness';
import { useCaseInfoStore } from '../../stores';

export const useWitnessStatements = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();
  const [witnessId, setWitness] = useState<number | null>(null);

  const getWitnessStatements = async () =>
    await request
      .get<WitnessStatementResponseType>(
        `/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/witnesses/${witnessId}/witness-statements`,
      )
      .then((response) => response.data);

  const { data, isLoading } = useSWR(
    witnessId && caseInfo ? [QUERY_KEYS.WITNESS_STATEMENTS, witnessId] : null,
    getWitnessStatements,
  );

  const setWitnessId = (id: number | null) => {
    setWitness(id);
  };

  const [witnessStatements, lastStatementId] = useMemo((): [WitnessStatementType[], number] => {
    const statements = (data?.statementsForWitness || []).sort((a, b) => a.title - b.title);

    const statementIds: number = Math.max(
      ...(statements || []).map((item: WitnessStatementType) => item.title),
    );

    return [statements, statementIds];
  }, [data]);

  return { data: witnessStatements, loading: isLoading, setWitnessId, lastStatementId };
};
