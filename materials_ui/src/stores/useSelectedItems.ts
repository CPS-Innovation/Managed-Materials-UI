import { create } from 'zustand';

import { CaseMaterialsType } from '../schemas/caseMaterials';

type SelectedItemsDefaultState = {
  communications: CaseMaterialsType[];
  materials: CaseMaterialsType[];
};

type SelectedItemKeys = keyof SelectedItemsDefaultState;

type SelectedItemsStore = {
  items: SelectedItemsDefaultState;
  addItems: (items: CaseMaterialsType[], type: SelectedItemKeys) => void;
  removeItems: (items: CaseMaterialsType[], type: SelectedItemKeys) => void;
  clear: (type?: SelectedItemKeys) => void;
};

const defaultState: SelectedItemsDefaultState = { communications: [], materials: [] };

export const useSelectedItemsStore = create<SelectedItemsStore>((set) => ({
  items: { ...defaultState },

  addItems: (items, type) => {
    return set((state) => {
      const stateIds = state.items[type].map((item) => item.materialId);
      const dedupedState = items.filter((item) => !stateIds.includes(item.materialId));

      return { items: { ...state.items, [type]: [...(state.items[type] ?? []), ...dedupedState] } };
    });
  },

  removeItems: (itemsToRemove, type) =>
    set((state) => {
      const idsToRemove = new Set(itemsToRemove.map((item) => item.materialId));

      return {
        items: {
          ...state.items,
          [type]: state.items[type].filter((item) => !idsToRemove.has(item.materialId)),
        },
      };
    }),

  clear: (type) => {
    if (type) {
      set((state) => ({ items: { ...state.items, [type]: [] } }));
    } else {
      set(() => ({ items: { ...defaultState } }));
    }
  },
}));
