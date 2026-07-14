import { useCaseMaterials } from '../';

export const useExhibits = () => {
  const {
    data: materials,
    loading: isLoading,
    error,
  } = useCaseMaterials({ dataType: 'materials' });

  const references = materials?.length
    ? materials
        ?.map((material) => (material.reference || '').trim().toLocaleLowerCase())
        .filter((ref) => !!ref)
    : [];

  const compareRefs = (ref: string) => {
    if (!references.length) {
      return false;
    }

    return references.includes(ref.trim().toLocaleLowerCase());
  };

  return { references, compareRefs, isLoading, error };
};
