import React, { useState } from 'react';
import styles from './SecurityBackupPage.module.css';

interface BackupFile {
  fileName: string;
  fileType: string;
  status: string;
  progress: number;
}

const SecurityBackupPage: React.FC = () => {
  const [backupPlan, setBackupPlan] = useState<'23:00' | '18:00'>('23:00');
  const [retentionPeriod, setRetentionPeriod] = useState<'7' | '30' | 'forever'>('7');

  // 模拟备份文件数据
  const [backupFiles] = useState<BackupFile[]>([
    { fileName: 'database_backup_20231201.sql', fileType: '数据库', status: '备份中', progress: 50 },
    { fileName: 'files_archive_20231201.zip', fileType: '文件归档', status: '备份中', progress: 75 },
    { fileName: 'config_backup_20231201.json', fileType: '配置文件', status: '备份完成', progress: 100 },
    { fileName: 'logs_backup_20231130.tar.gz', fileType: '日志文件', status: '备份完成', progress: 100 },
  ]);

  return (
    <div className={styles.container}>
      {/* 手动备份标题栏 */}
      <div className={styles.manualBackupHeader}>
        <h2 className={styles.sectionTitle}>手动备份</h2>
      </div>

      {/* 手动备份表格 */}
      <div className={styles.tableWrapper}>
        <table className={styles.backupTable}>
          <thead>
            <tr>
              <th>文件名</th>
              <th>文件分类</th>
              <th>状态</th>
              <th>进度</th>
            </tr>
          </thead>
          <tbody>
            {backupFiles.map((file, index) => (
              <tr key={index}>
                <td>{file.fileName}</td>
                <td>{file.fileType}</td>
                <td>{file.status}</td>
                <td>
                  <div className={styles.progressCell}>
                    {file.progress === 100 ? (
                      <span className={styles.completedText}>备份完成</span>
                    ) : (
                      <>
                        <span className={styles.progressText}>{file.progress}%</span>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 备份计划设置 */}
      <div className={styles.settingBlock}>
        <div className={styles.settingHeader}>
          <h2 className={styles.settingHeaderTitle}>备份计划设置</h2>
        </div>
        <div className={styles.settingContent}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="backupPlan"
              value="23:00"
              checked={backupPlan === '23:00'}
              onChange={() => setBackupPlan('23:00')}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>每日23点自动全量备份</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="backupPlan"
              value="18:00"
              checked={backupPlan === '18:00'}
              onChange={() => setBackupPlan('18:00')}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>每日18点自动全量备份</span>
          </label>
        </div>
      </div>

      {/* 备份文件保存时间 */}
      <div className={styles.settingBlock}>
        <div className={styles.settingHeader}>
          <h2 className={styles.settingHeaderTitle}>备份文件保存时间</h2>
        </div>
        <div className={styles.settingContent}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="retentionPeriod"
              value="7"
              checked={retentionPeriod === '7'}
              onChange={() => setRetentionPeriod('7')}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>7天</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="retentionPeriod"
              value="30"
              checked={retentionPeriod === '30'}
              onChange={() => setRetentionPeriod('30')}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>30天</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="retentionPeriod"
              value="forever"
              checked={retentionPeriod === 'forever'}
              onChange={() => setRetentionPeriod('forever')}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>永久</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SecurityBackupPage;
