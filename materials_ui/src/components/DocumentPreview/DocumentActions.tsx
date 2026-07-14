type Props = { label: string; isOpen: boolean; onDocumentOpen: () => void };

export default function DocumentActions({ label, isOpen = false, onDocumentOpen }: Props) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onDocumentOpen();
      }}
      className="govuk-body govuk-link"
      aria-label={`Actions for ${label}`}
      style={{
        marginBottom: '0px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
      data-testid="buttonActions"
    >
      <span style={{ marginRight: '2px' }}>{isOpen ? 'Hide' : 'Preview'}</span>
    </a>
  );
}
