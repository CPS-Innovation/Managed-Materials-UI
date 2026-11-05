type PanelProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type ItemProps = {
  id: string;
  documentId: number;
  label: string;
  panel: PanelProps;
  isDirty: boolean;
};

export type CommonTabsProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & { items: ItemProps[] };
