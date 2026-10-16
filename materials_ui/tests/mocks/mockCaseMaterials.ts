import { CaseMaterialsType } from '../../src/schemas/caseMaterials';

const material: CaseMaterialsType[] = [
  {
    materialId: 8836399,
    documentId: 8117437,
    parentId: 'CMS-8836399',
    originalFileName: 'MG11 Abdul Tarafdar Undated.docx',
    subject: 'test',
    documentTypeId: 1062,
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
    existingProducerOrWitnessId: 0,
    isReclassifiable: true,
    cmsDocType: { documentTypeId: 1062, documentType: null, documentCategory: 'Exhibit' },
    presentationFlags: { read: 'Ok', write: 'Ok' },
    hasNotes: false,
    isUnused: false,
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
