type Props = { title: string; content: () => React.ReactNode };

export const Popover = ({ title, content }: Props) => {
  return (
    <div
      className="popover"
      style={{
        padding: '1rem',
        background: '#1d70b8',
        borderRadius: '.3125rem',
        filter: 'drop-shadow(0 1px .15rem #000)',
        color: 'white',
        width: '500px',
        position: 'absolute',
        top: '40px',
        right: '0px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: 0, fontSize: '19px' }}>{title}</h3>
      <div>{content()}</div>
    </div>
  );
};
