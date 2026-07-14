import { create } from 'zustand';
import { StatusTag } from '../schemas';

type MaterialTagItem = { materialId: number; tagName: StatusTag };

type MaterialTagsStore = {
  materialTags: MaterialTagItem[];
  setTags: (newMaterialTags: MaterialTagItem[]) => void;
  clearTags: (materialIdsToRemove?: number[]) => void;
};

export const useMaterialTags = create<MaterialTagsStore>((set) => ({
  materialTags: [],

  setTags: (newMaterialTags) =>
    set((state) => {
      const updatedMaterialTags = [...state.materialTags];

      newMaterialTags.forEach((newTag) => {
        const existingIndex = updatedMaterialTags.findIndex(
          (item) => item.materialId === newTag.materialId,
        );

        if (existingIndex === -1) {
          updatedMaterialTags.push(newTag);
        } else {
          updatedMaterialTags[existingIndex] = newTag;
        }
      });

      return { materialTags: updatedMaterialTags };
    }),

  clearTags: (materialIdsToRemove) =>
    set((state) => ({
      materialTags:
        materialIdsToRemove && materialIdsToRemove.length > 0
          ? state.materialTags.filter((item) => !materialIdsToRemove.includes(item.materialId))
          : [],
    })),
}));
