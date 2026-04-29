export const stripCmsPrefix = (str: string) =>
  str.startsWith('CMS-') ? str.slice(4) : str;
