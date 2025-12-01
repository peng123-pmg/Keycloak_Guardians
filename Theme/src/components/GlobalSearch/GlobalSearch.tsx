import React, { useState, useRef, useEffect } from 'react';
import styles from './GlobalSearch.module.css';

export const GlobalSearch: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 点击搜索框时显示提示栏
  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  // 点击外部区域时隐藏提示栏
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    // ESC 键隐藏提示栏
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSuggestions]);

  return (
    <div className={styles.searchContainer} ref={searchContainerRef}>
      {/* 搜索框 */}
      <div className={styles.searchBox}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="输入关键词检索"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleSearchFocus}
        />
      </div>

      {/* 提示框 - 仅在 showSuggestions 为 true 时显示 */}
      {showSuggestions && (
        <div className={styles.hintBox}>
          <div className={styles.hintRow}>
            <span className={styles.hintLabel}>个人文件</span>
            <span className={styles.hintValue}>***文件数量***</span>
          </div>
          <div className={styles.hintRow}>
            <span className={styles.hintLabel}>小组文件</span>
            <span className={styles.hintValue}>***文件数量***</span>
          </div>
          <div className={styles.hintRow}>
            <span className={styles.hintLabel}>任务</span>
            <span className={styles.hintValue}>***关键词***</span>
          </div>
        </div>
      )}
    </div>
  );
};
