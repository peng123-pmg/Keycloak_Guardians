import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationCenterPage.module.css';

type NotificationType = '系统通知' | '协作通知' | '审核通知';

interface Notification {
  id: string;
  sender: string;
  type: NotificationType;
  isRead: boolean;
  content: string;
}

const NotificationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      sender: 'xxxx',
      type: '系统通知',
      isRead: false,
      content: '系统维护通知内容'
    },
    {
      id: '2',
      sender: 'xxxx',
      type: '协作通知',
      isRead: false,
      content: '协作通知进入任务进度面板'
    },
    {
      id: '3',
      sender: 'xxxx',
      type: '审核通知',
      isRead: false,
      content: '审核通知内容'
    }
  ]);

  // 标记已读
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  // 批量删除已读
  const handleBatchDelete = () => {
    setNotifications(prev => prev.filter(notif => !notif.isRead));
  };

  // 点击通知行
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === '协作通知') {
      // 协作通知跳转到任务进度页面
      navigate('/task-progress');
    } else {
      // 系统通知和审核通知跳转到消息详情页
      navigate(`/message-detail/${notification.id}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentArea}>
        {/* 标题栏 */}
        <div className={styles.headerRow}>
          <div className={styles.headerCell}>
            发信方
          </div>
          <div className={styles.headerCell}>
            通知类型
          </div>
          <div className={styles.headerCell}>
            操作
          </div>
        </div>

        {/* 表格区域 */}
        <div className={styles.tableArea}>
          {notifications.map(notification => (
            <div key={notification.id} className={styles.tableRow}>
              <div
                className={styles.rowCell}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.sender}
              </div>
              <div
                className={styles.rowCell}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.type}
              </div>
              <div className={styles.rowCell}>
                <div className={styles.actionButtons}>
                  {notification.isRead ? (
                    <span className={styles.readStatus}>已读</span>
                  ) : (
                    <>
                      <span className={styles.unreadStatus}>未读</span>
                      <button
                        className={styles.markReadButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        标记已读
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 批量操作 */}
        <div className={styles.batchActions}>
          <button
            className={styles.batchDeleteButton}
            onClick={handleBatchDelete}
          >
            批量删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterPage;
