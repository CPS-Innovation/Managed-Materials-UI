import { TDocumentList } from '../getters/getDocumentList';

export const categoryDetails = [
  { label: 'Statements', categoryName: 'statement' },
  { label: 'Exhibits', categoryName: 'exhibit' },
  { label: 'MG forms', categoryName: 'mgForm' },
  { label: 'Other documents', categoryName: 'otherDocument' },
  { label: 'Defendant pre cons', categoryName: 'defendant' },
  { label: 'Unused material', categoryName: 'unusedMaterial' }
] as const;

export type TCategoryName = (typeof categoryDetails)[number]['categoryName'];

export const documentTypeIdsMap: Record<TCategoryName, number[]> = {
  statement: [1016, 1017, 1018, 1031, 1051, 1059],
  exhibit: [
    1020, 1021, 1022, 1023, 1028, 1030, 1042, 1044, 1052, 1062, 1406, 225522
  ],
  mgForm: [
    516, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1012, 1013, 1014, 1015,
    1019, 1024, 1025, 1026, 1027, 1033, 1034, 1035, 1036, 1037, 1038, 1039,
    1040, 1041, 1045, 1046, 1047, 1048, 1049, 1050, 1060, 1061, 1063, 1066, 1203
  ],
  otherDocument: [-2, 1201],
  defendant: [1056, 1057],
  unusedMaterial: [1009, 1010, 1011, 1058, 1202, 100239, 226148]
};

export const initDocsOnDocCategoryNamesMap = (): {
  [k in TCategoryName]: TDocumentList;
} => ({
  statement: [],
  exhibit: [],
  mgForm: [],
  otherDocument: [],
  defendant: [],
  unusedMaterial: []
});
