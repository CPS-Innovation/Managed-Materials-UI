const tagStyleColorMap = {
  none: '',
  grey: 'govuk-tag--grey',
  green: 'govuk-tag--green',
  turquoise: 'govuk-tag--turquoise',
  blue: 'govuk-tag--blue',
  lightBlue: 'govuk-tag--light-blue',
  purple: 'govuk-tag--purple',
  pink: 'govuk-tag--pink',
  red: 'govuk-tag--red',
  orange: 'govuk-tag--orange',
  yellow: 'govuk-tag--yellow',
} as const;
export type TTagStyleColor = keyof typeof tagStyleColorMap;

export const GovUkTagTemplate = (p: { color?: TTagStyleColor; children: React.ReactNode }) => {
  const colorKey = p.color ?? 'none';

  return <strong className={`govuk-tag ${tagStyleColorMap[colorKey]}`}>{p.children}</strong>;
};
