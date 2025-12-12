import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MessageDetailPage.module.css';

interface MessageData {
  id: string;
  sender: string;
  type: string;
  content: string;
}

// 模拟消息数据（实际应从后端获取）
const mockMessages: Record<string, MessageData> = {
  '1': {
    id: '1',
    sender: 'xxxx',
    type: '系统通知',
    content: '系统将于今晚22:00-24:00进行维护升级，届时部分功能可能暂时无法使用，请您提前做好相关准备工作。维护期间如有紧急事务，请联系管理员。感谢您的理解与支持！'
  },
  '2': {
    id: '2',
    sender: 'xxxx',
    type: '协作通知',
    content: '您的团队成员已完成文档审核，请及时查看并跟进后续工作。如有疑问，请在团队协作区留言讨论。'
  },
  '3': {
    id: '3',
    sender: 'xxxx',
    type: '审核通知',
    content: '您提交的申请已通过审核，相关权限已开通。您现在可以访问团队共享资源区，并进行文件上传、下载等操作。请合理使用权限，遵守团队协作规范。'
  }
};

const MessageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 获取消息数据
  const message = id ? mockMessages[id] : null;

  // 返回上一页
  const handleBack = () => {
    navigate('/notifications');
  };

  if (!message) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentArea}>
          <div className={styles.errorMessage}>消息不存在</div>
          <button className={styles.backButton} onClick={handleBack}>
            ← 返回消息中心
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentArea}>
        {/* 标题栏 */}
        <div className={styles.titleBar}>
          <h1 className={styles.title}>来自{message.sender}的消息</h1>
        </div>

        {/* 内容区域 */}
        <div className={styles.contentBox}>
          <div className={styles.messageMeta}>
            <span className={styles.messageType}>{message.type}</span>
          </div>
          <p className={styles.messageContent}>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailPage;
