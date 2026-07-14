import { CaseMaterialsType } from '../../src/schemas/caseMaterials';

const material: CaseMaterialsType[] = [
  {
    id: 8836399,
    originalFileName: 'MG11 Abdul Tarafdar Undated.docx',
    subject: 'test',
    documentTypeId: 1062,
    materialId: 8836399,
    link: 'k9rTE1hWRBUI$$LCDSccY4m7E2ucUo9TGU6w$$KNSprckSf-vpqXiJ/MG11 Absul Tarafdar Undated.docx',
    category: 'Exhibit',
    type: 'MG15(CNOI)',
    hasAttachments: false,
    status: 'Used',
    readStatus: 'Read',
    method: 'null',
    direction: 'null',
    party: 'null',
    date: new Date('2022-02-08T00:00:00Z'),
    recordedDate: new Date('2022-02-08T00:00:00Z'),
    witnessId: 2794967,
    title: 'null',
    producer: 'null',
    reference: 't1',
    item: 'test',
    existingproducerOrWitnessId: 0,
    isReclassifiable: true,
  },
];

export const mockCaseMaterials = (overwrite?: Partial<CaseMaterialsType>) => {
  try {
    return material.map((currentMaterial) => ({ ...currentMaterial, ...overwrite }));
  } catch (error) {
    console.error('Error in mockCaseMaterials:', error);
    throw error;
  }
};
