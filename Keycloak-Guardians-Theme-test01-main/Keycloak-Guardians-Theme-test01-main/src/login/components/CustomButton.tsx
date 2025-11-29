import React from 'react';

interface CustomButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  type = 'submit',
  onClick,
  disabled = false,
  children,
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
    >
      {children}
    </button>
  );
};
