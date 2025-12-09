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

  const [errors, setErrors] = useState({
    groupName: '',
    memberLimit: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // 验证小组名称（2-20字符）
    if (formData.groupName.length < 2 || formData.groupName.length > 20) {
      newErrors.groupName = '小组名称必须为2-20个字符';
      isValid = false;
    } else {
      newErrors.groupName = '';
    }

    // 验证成员上限（1-50）
    const memberLimit = parseInt(formData.memberLimit);
    if (formData.memberLimit && (isNaN(memberLimit) || memberLimit < 1 || memberLimit > 50)) {
      newErrors.memberLimit = '成员上限必须为1-50之间的数字';
      isValid = false;
    } else {
      newErrors.memberLimit = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除相应字段的错误信息
    if (field === 'groupName' || field === 'memberLimit') {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('创建团队:', formData);
      alert('团队创建成功!');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>小组名称</label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.groupName ? styles.error : ''}`}
            placeholder="2-20字"
            value={formData.groupName}
            onChange={(e) => handleInputChange('groupName', e.target.value)}
            maxLength={20}
          />
          {errors.groupName && <span className={styles.errorMessage}>{errors.groupName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>描述</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="请输入团队描述"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>所属课程</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="请输入课程名称"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
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

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>成员上限</label>
          <input
            type="text"
            className={`${styles.formInput} ${errors.memberLimit ? styles.error : ''}`}
            placeholder="1-50人"
            value={formData.memberLimit}
            onChange={(e) => handleInputChange('memberLimit', e.target.value)}
          />
          {errors.memberLimit && <span className={styles.errorMessage}>{errors.memberLimit}</span>}
        </div>

        <div className={styles.buttonContainer}>
          <button 
            type="submit" 
            className={styles.submitBtn}
            onClick={handleSubmit}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
};