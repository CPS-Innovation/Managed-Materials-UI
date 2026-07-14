import { useSearchParams } from 'react-router-dom';
import { SELECTED_MATERIAL_QUERY_PARAM } from '../../constants/materials';

export const useCaseMaterial = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const newQueryCommands = new URLSearchParams(searchParams);
  const selectedMaterialId = newQueryCommands.get(SELECTED_MATERIAL_QUERY_PARAM);

  const selectMaterial = (materialId: number) => {
    newQueryCommands.set(SELECTED_MATERIAL_QUERY_PARAM, materialId.toString());
    setSearchParams(newQueryCommands);
  };

  const deselectMaterial = () => {
    newQueryCommands.delete(SELECTED_MATERIAL_QUERY_PARAM);
    setSearchParams(newQueryCommands);
  };

  return { selectedMaterialId, selectMaterial, deselectMaterial };
};
