import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange
}) => {
  return (
    <label className={styles.checkboxWrapper}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className={styles.checkbox}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
};
