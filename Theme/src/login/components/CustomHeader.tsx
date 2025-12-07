import React from 'react';

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  title = "欢迎登录我们的系统",
  subtitle = "请输入您的认证凭据访问"
}) => {
  return (
    <div className="custom-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};
