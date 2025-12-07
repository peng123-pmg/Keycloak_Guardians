import React from 'react';

interface WaterMarkProps {
  text?: string;
}

export const WaterMark: React.FC<WaterMarkProps> = ({ 
  text = "MYREALM" 
}) => {
  return (
    <div className="watermark">
      {text}
    </div>
  );
};
