import { useState } from 'react';

export const CloseIconButton = (p: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={() => p.onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#00703c' : 'black',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        display: 'inline-flex'
      }}
    >
      <svg
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
        height="45px"
        width="45px"
      >
        <path stroke="white" strokeWidth="3" d="M7.25,7.25,17.75,17.75" />
        <path stroke="white" strokeWidth="3" d="M7.25,17.75,17.75,7.25" />
      </svg>
    </button>
  );
};

export const CloseIcon = (p: { backgroundColor: string }) => {
  return (
    <svg
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
      height="45px"
      width="45px"
      style={{ background: p.backgroundColor }}
      fill="black"
    >
      <path stroke="white" strokeWidth="3" d="M7.25,7.25,17.75,17.75" />
      <path stroke="white" strokeWidth="3" d="M7.25,17.75,17.75,7.25" />
    </svg>
  );
};
