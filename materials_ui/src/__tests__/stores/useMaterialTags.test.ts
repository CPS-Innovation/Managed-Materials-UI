import { describe, expect, it } from 'vitest';
import { useMaterialTags } from '../../stores';

describe('useMaterialTags Store', () => {
  it('should initialize with an empty materialTags array', () => {
    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([]);
  });

  it('should set new tags correctly', () => {
    const newTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
    ];

    useMaterialTags.getState().setTags(newTags);

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual(newTags);
  });

  it('should update existing tags when the same materialId is added with new tagName', () => {
    const initialTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
    ];

    useMaterialTags.getState().setTags(initialTags);

    const updatedTags = [
      { materialId: 1, tagName: 'updatedTag1' },
      { materialId: 3, tagName: 'tag3' },
    ];

    useMaterialTags.getState().setTags(updatedTags);

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([
      { materialId: 1, tagName: 'updatedTag1' },
      { materialId: 2, tagName: 'tag2' },
      { materialId: 3, tagName: 'tag3' },
    ]);
  });

  it('should add new tags and update existing ones with the same materialId', () => {
    const newTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
    ];

    useMaterialTags.getState().setTags(newTags);

    const duplicateTags = [
      { materialId: 1, tagName: 'newTag1' },
      { materialId: 3, tagName: 'newTag3' },
    ];

    useMaterialTags.getState().setTags(duplicateTags);

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([
      { materialId: 1, tagName: 'newTag1' },
      { materialId: 2, tagName: 'tag2' },
      { materialId: 3, tagName: 'newTag3' },
    ]);
  });

  it('should clear all tags when clearTags is called with no materialIdsToRemove', () => {
    const newTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
    ];

    useMaterialTags.getState().setTags(newTags);
    useMaterialTags.getState().clearTags();

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([]);
  });

  it('should remove specific tags when clearTags is called with materialIdsToRemove', () => {
    const newTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
      { materialId: 3, tagName: 'tag3' },
    ];

    useMaterialTags.getState().setTags(newTags);

    useMaterialTags.getState().clearTags([1, 2]);

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([{ materialId: 3, tagName: 'tag3' }]);
  });

  it('should not modify tags when clearTags is called with an empty array', () => {
    const newTags = [
      { materialId: 1, tagName: 'tag1' },
      { materialId: 2, tagName: 'tag2' },
    ];

    useMaterialTags.getState().setTags(newTags);
    useMaterialTags.getState().clearTags();

    const store = useMaterialTags.getState();
    expect(store.materialTags).toEqual([]);
  });
});
