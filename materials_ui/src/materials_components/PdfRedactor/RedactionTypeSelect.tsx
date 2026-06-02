import { useEffect, useRef, useState } from 'react';

const redactionTypeData = [
  { id: '1', name: 'Named individual' },
  { id: '2', name: 'Title' },
  { id: '3', name: 'Occupation' },
  { id: '4', name: 'Relationship to others' },
  { id: '5', name: 'Address' },
  { id: '6', name: 'Location' },
  { id: '7', name: 'Vehicle registration' },
  { id: '8', name: 'NHS number' },
  { id: '9', name: 'Date of birth' },
  { id: '10', name: 'Bank details' },
  { id: '11', name: 'NI Number' },
  { id: '12', name: 'Phone number' },
  { id: '13', name: 'Email address' },
  { id: '14', name: 'Previous convictions' },
  { id: '15', name: 'Other' }
];

export type TRedactionType = (typeof redactionTypeData)[number];

export const RedactionTypeSelect = (p: {
  onRedactionTypeChange: (x: TRedactionType | undefined) => void;
  initFocus: boolean;
  fullWidth?: boolean;
}) => {
  const [redactionTypeId, setRedactionTypeId] = useState('');
  const selectElmRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (p.initFocus) selectElmRef.current?.focus();
  }, []);
  return (
    <select
      ref={selectElmRef}
      className="govuk-select"
      style={p.fullWidth ? { width: '100%' } : undefined}
      value={redactionTypeId}
      onChange={(e) => {
        const newRedactionType = redactionTypeData.find(
          (itm) => itm.id === e.target.value
        );

        setRedactionTypeId(e.target.value);
        p.onRedactionTypeChange(newRedactionType);
      }}
    >
      <option value="">-- Please select --</option>
      {redactionTypeData.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
};
