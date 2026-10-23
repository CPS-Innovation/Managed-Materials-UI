import { beforeEach, describe } from 'vitest';

import { CaseMaterialsType } from '../../schemas/caseMaterials';
import { useSelectedItemsStore } from '../../stores';

function getMaterial(override?: Partial<CaseMaterialsType>): CaseMaterialsType {
  return {
    materialId: 1,
    documentId: 1,
    parentId: 'CMS-1',
    originalFileName: 'test0filename.pdf',
    subject: 'test subject',
    documentTypeId: 22,
    category: 'some category',
    type: '',
    hasAttachments: false,
    status: '',
    readStatus: '',
    method: '',
    direction: '',
    party: '',
    date: new Date(),
    recordedDate: null,
    witnessId: null,
    title: '',
    producer: '',
    reference: '',
    item: '',
    existingProducerOrWitnessId: 0,
    isReclassifiable: false,
    cmsDocType: { documentTypeId: 22, documentType: null, documentCategory: 'some category' },
    presentationFlags: { read: 'Ok', write: 'Ok' },
    hasNotes: false,
    isUnused: false,
    ...override,
  };
}

describe('stores > useSelectedItems', () => {
  beforeEach(() => {
    useSelectedItemsStore.setState({ items: { communications: [], materials: [] } });
  });

  it('should initialise as expected', () => {
    const { items } = useSelectedItemsStore.getState();

    expect(items.materials).toHaveLength(0);
    expect(items.communications).toHaveLength(0);
  });

  it('should add a single material item to state (addItems())', () => {
    useSelectedItemsStore.getState().addItems([getMaterial()], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(1);

    useSelectedItemsStore.getState().addItems([getMaterial({ materialId: 2 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
  });

  it('should add multiple material items to state (addItems())', () => {
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial(), getMaterial({ materialId: 2 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
  });

  it('should add multiple materials and discard duplicates', () => {
    useSelectedItemsStore.getState().addItems([getMaterial()], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(1);

    useSelectedItemsStore
      .getState()
      .addItems([getMaterial(), getMaterial({ materialId: 2 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
  });

  it('should remove a single material item from state (removeItems())', () => {
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial(), getMaterial({ materialId: 2 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);

    useSelectedItemsStore.getState().removeItems([getMaterial({ materialId: 2 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(1);
  });

  it('should remove multiple material items from state (removeItems())', () => {
    useSelectedItemsStore
      .getState()
      .addItems(
        [
          getMaterial(),
          getMaterial({ materialId: 2 }),
          getMaterial({ materialId: 3 }),
          getMaterial({ materialId: 4 }),
        ],
        'materials',
      );
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(4);

    useSelectedItemsStore
      .getState()
      .removeItems([getMaterial({ materialId: 2 }), getMaterial({ materialId: 4 })], 'materials');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
  });

  it('should clear items from one type (clear(type))', () => {
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial(), getMaterial({ materialId: 2 })], 'materials');
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial({ materialId: 3 }), getMaterial({ materialId: 4 })], 'communications');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
    expect(useSelectedItemsStore.getState().items.communications).toHaveLength(2);

    useSelectedItemsStore.getState().clear('communications');
    expect(useSelectedItemsStore.getState().items.communications).toHaveLength(0);
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
  });

  it('should clear all items (clear())', () => {
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial(), getMaterial({ materialId: 2 })], 'materials');
    useSelectedItemsStore
      .getState()
      .addItems([getMaterial({ materialId: 3 }), getMaterial({ materialId: 4 })], 'communications');
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(2);
    expect(useSelectedItemsStore.getState().items.communications).toHaveLength(2);

    useSelectedItemsStore.getState().clear();
    expect(useSelectedItemsStore.getState().items.communications).toHaveLength(0);
    expect(useSelectedItemsStore.getState().items.materials).toHaveLength(0);
  });
});
