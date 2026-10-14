const NON_REDACTABLE_MATERIAL_ID_PREFIXES = ['PCD-', 'DAC-'];

export const isRedactionPermitted = (materialId: string) =>
  !NON_REDACTABLE_MATERIAL_ID_PREFIXES.some((prefix) => materialId.startsWith(prefix));
