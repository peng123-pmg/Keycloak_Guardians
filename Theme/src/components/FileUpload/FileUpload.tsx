import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFileSize?: number; // 最大文件大小（字节），默认 10MB
  acceptedTypes?: string[]; // 接受的文件类型，如 ['.pdf', '.jpg', '.png']
  multiple?: boolean; // 是否允许多文件上传
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFileSize = 10 * 1024 * 1024, // 默认 10MB
  acceptedTypes,
  multiple = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // 检查文件大小
      if (file.size > maxFileSize) {
        errors.push(`"${file.name}" 超过最大文件大小 ${formatFileSize(maxFileSize)}`);
        return;
      }

      // 检查文件类型
      if (acceptedTypes && acceptedTypes.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
          errors.push(`"${file.name}" 文件类型不支持（仅支持: ${acceptedTypes.join(', ')}）`);
          return;
        }
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 处理文件选择
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setErrorMessage(errors.join('; '));
      setTimeout(() => setErrorMessage(''), 5000);
    }

    if (valid.length > 0) {
      setErrorMessage('');
      onFilesSelected(valid);
    }
  };

  // 拖拽事件处理
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // 重置 input，允许重复选择同一文件
    e.target.value = '';
  };

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={styles.uploadIcon}>📁</div>
        <div className={styles.uploadText}>
          <p className={styles.primaryText}>拖拽文件到此处或点击上传</p>
          <p className={styles.secondaryText}>
            {multiple ? '支持多文件上传' : '单文件上传'} · 
            最大 {formatFileSize(maxFileSize)}
            {acceptedTypes && acceptedTypes.length > 0 && 
              ` · 支持格式: ${acceptedTypes.join(', ')}`
            }
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className={styles.fileInput}
          onChange={handleFileInputChange}
          multiple={multiple}
          accept={acceptedTypes?.join(',')}
        />
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
};
