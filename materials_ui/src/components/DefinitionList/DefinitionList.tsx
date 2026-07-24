import './DefinitionList.scss';

type ListItem = { title: string; description: (string | React.ReactNode)[] };

type Props = { items: ListItem[]; fixedWidth?: boolean };

export const DefinitionList = ({ items, fixedWidth }: Props) => {
  if (!items.length) return null;

  return (
    <dl className={`definition-list ${fixedWidth ? 'definition-list--fixed-width' : ''}`}>
      {items.map((item, index) => (
        <div key={index} className="definition-list__row">
          <dt className="definition-list__title">{item.title}</dt>
          {item.description.map((desc, descIndex) => (
            <dd key={descIndex} className="definition-list__description">
              {desc}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
};
