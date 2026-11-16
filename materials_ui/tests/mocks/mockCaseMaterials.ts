import { CaseMaterialsType } from '../../src/schemas/caseMaterials';

const materials: CaseMaterialsType = {
  materialId: 8981277,
  parentId: 'CMS-8981277',
  documentId: null,
  originalFileName: 'test.pdf',
  subject: 'UM Meeting with defence',
  documentTypeId: -9,
  category: 'Material',
  type: 'Meeting',
  hasAttachments: false,
  status: 'None',
  readStatus: 'Read',
  method: 'Meeting',
  direction: 'Outgoing',
  party: 'Defence',
  date: new Date(1704067200000),
  recordedDate: null,
  witnessId: null,
  title: null,
  producer: null,
  item: null,
  existingProducerOrWitnessId: null,
  isReclassifiable: true,
  cmsDocType: null,
  presentationFlags: null,
  hasNotes: false,
  isUnused: false,
  reference: null,
};

export const mockCaseMaterials = (
  overwrites: Partial<CaseMaterialsType>[] = [],
): CaseMaterialsType[] => overwrites.map((overwrite) => ({ ...materials, ...overwrite }));
