export const generateMaterialName = (
  documentType: string,
  firstName: string,
  surname: string,
  date?: string,
) => {
  return `${documentType} ${surname.toUpperCase()} ${firstName}${date ? ' ' + date : ''}`;
};
