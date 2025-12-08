import React from "react";
import styles from "./LoadingScreen.module.css";

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = "加载中..." }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
};

