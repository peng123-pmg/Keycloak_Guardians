import React, { useState } from 'react';
import styles from './CreateTeamPage.module.css';

export const CreateTeamPage: React.FC = () => {
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    course: '',
    joinPermission: '公开',
    memberLimit: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('创建团队:', formData);
    alert('团队创建成功!');
  };

  return (
    <div className={styles.pageContainer}>
      {/* 757×757 蓝色卡片背景 */}
      <div className={styles.cardContainer}>
        {/* 小组名称 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>小组名称</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="2-20字"
            value={formData.groupName}
            onChange={(e) => handleInputChange('groupName', e.target.value)}
            maxLength={20}
          />
        </div>

        {/* 描述 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>描述</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        {/* 所属课程 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>所属课程</label>
          <input
            type="text"
            className={styles.formInput}
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
          />
        </div>

        {/* 加入权限 - 下拉选择框 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>加入权限</label>
          <select
            className={styles.formSelect}
            value={formData.joinPermission}
            onChange={(e) => handleInputChange('joinPermission', e.target.value)}
          >
            <option value="公开">公开</option>
            <option value="邀请">邀请</option>
          </select>
        </div>

        {/* 成员上限 */}
        <div className={styles.formRow}>
          <label className={styles.formLabel}>成员上限</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="1-50人"
            value={formData.memberLimit}
            onChange={(e) => handleInputChange('memberLimit', e.target.value)}
          />
        </div>

        {/* 创建按钮 */}
        <button className={styles.submitBtn} onClick={handleSubmit}>
          创建
        </button>
      </div>
    </div>
  );
};
