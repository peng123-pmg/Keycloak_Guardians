import React, { useState } from 'react';
import styles from './CreateTeamPage.module.css';
import { userService } from '../../services/userService';

const MEMBER_LIMIT_DEFAULT = 20;

export const CreateTeamPage: React.FC = () => {
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    course: '',
    joinPermission: '公开',
    memberLimit: '',
  });
  const [errors, setErrors] = useState({ groupName: '', memberLimit: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const validateForm = () => {
    let valid = true;
    const newErrors = { groupName: '', memberLimit: '' };

    if (!formData.groupName.trim()) {
      newErrors.groupName = '请输入小组名称';
      valid = false;
    } else if (formData.groupName.trim().length < 2 || formData.groupName.trim().length > 32) {
      newErrors.groupName = '小组名称需为 2-32 个字符';
      valid = false;
    }

    if (formData.memberLimit) {
      const limit = Number(formData.memberLimit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        newErrors.memberLimit = '成员上限需为 1- 50 的整数';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      groupName: '',
      description: '',
      course: '',
      joinPermission: '公开',
      memberLimit: '',
    });
    setErrors({ groupName: '', memberLimit: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setToast(null);
      await userService.createGroup({
        name: formData.groupName.trim(),
        description: formData.description.trim(),
        courseCode: formData.course.trim(),
        joinPolicy: formData.joinPermission === '公开' ? 'OPEN' : 'INVITE_ONLY',
        memberLimit: formData.memberLimit ? Number(formData.memberLimit) : MEMBER_LIMIT_DEFAULT,
      });
      setToast({ type: 'success', message: ' 小组创建成功！' });
      resetForm();
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : '创建失败，请稍后重试',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <section className={styles.heroPanel}>
        <h1 className={styles.pageTitle}>创建新的协作小组</h1>
        <p className={styles.pageSubtitle}>完善以下信息，邀请同伴立即开始协作</p>
      </section>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {toast && (
          <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
            {toast.message}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label}>小组名称<span>*</span></label>
            <input
              className={`${styles.input} ${errors.groupName ? styles.inputError : ''}`}
              placeholder="例如：计算机网络实验小组"
              value={formData.groupName}
              maxLength={32}
              onChange={(e) => handleInputChange('groupName', e.target.value)}
            />
            {errors.groupName && <span className={styles.errorText}>{errors.groupName}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>所属课程</label>
            <input
              className={styles.input}
              placeholder="请输入课程或项目名称"
              value={formData.course}
              maxLength={64}
              onChange={(e) => handleInputChange('course', e.target.value)}
            />
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label className={styles.label}>小组描述</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="一句话介绍小组目标、协作方式等信息"
              value={formData.description}
              maxLength={200}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>加入权限</label>
            <select
              className={styles.input}
              value={formData.joinPermission}
              onChange={(e) => handleInputChange('joinPermission', e.target.value)}
            >
              <option value="公开">公开（任何人可申请加入）</option>
              <option value="邀请">仅限邀请</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>成员上限</label>
            <input
              className={`${styles.input} ${errors.memberLimit ? styles.inputError : ''}`}
              placeholder="默认 20 人"
              value={formData.memberLimit}
              maxLength={3}
              onChange={(e) => handleInputChange('memberLimit', e.target.value.replace(/[^0-9]/g, ''))}
            />
            {errors.memberLimit && <span className={styles.errorText}>{errors.memberLimit}</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? '创建中…' : '立即创建'}
          </button>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={resetForm}
            disabled={submitting}
          >
            清空表单
          </button>
        </div>
      </form>
    </div>
  );
};