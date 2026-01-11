/* eslint-disable prettier/prettier */
'use client';

import React, { useState, useEffect } from 'react';
import styles from './AttendanceRecords.module.css';

interface AttendanceRecord {
  $id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkInTime: string;
  sessionTime: '3:15pm' | '4:30pm';
  weekNumber: number;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceSummary {
  weekNumber: number;
  session1: {
    total: number;
    students: AttendanceRecord[];
  };
  session2: {
    total: number;
    students: AttendanceRecord[];
  };
}

export default function AttendanceRecords() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRecords = async (week: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/attendance/records?weekNumber=${week}`);
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      setError('获取记录失败：' + (error.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 获取当前周数
    const response = fetch('/api/attendance');
    response.then((res) => res.json()).then((data) => {
      setWeekNumber(data.weekNumber || 1);
      fetchRecords(data.weekNumber || 1);
    });
  }, []);

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleDateString('zh-CN');
  };

  const handleChangeStatus = async (recordId: string, newStatus: 'present' | 'absent' | 'late') => {
    setUpdatingId(recordId);
    
    try {
      const response = await fetch('/api/attendance/record', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          status: newStatus,
          notes: newStatus === 'late' ? 'Admin 标记为迟到' : undefined,
        }),
      });

      if (response.ok) {
        // 刷新数据
        fetchRecords(weekNumber);
      } else {
        const data = await response.json();
        alert('修改失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      alert('修改失败：' + (error.message || '未知错误'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#3fb950'; // GitHub 绿色
      case 'late':
        return '#d29922'; // GitHub 橙色
      case 'absent':
        return '#ff7b72'; // GitHub 红色
      default:
        return '#6e7681';
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!summary) {
    return <div className={styles.empty}>暂无数据</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2><span className="material-symbols-outlined" style={{fontSize: '28px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>bar_chart</span>点名记录</h2>
        <div className={styles.weekSelector}>
          <button
            onClick={() => {
              const newWeek = Math.max(1, weekNumber - 1);
              setWeekNumber(newWeek);
              fetchRecords(newWeek);
            }}
            className={styles.prevButton}
          >
            <span className="material-symbols-outlined" style={{fontSize: '18px', marginRight: '4px'}}>arrow_back</span>
            上一周
          </button>
          <span className={styles.weekNumber}>第 {summary.weekNumber} 周</span>
          <button 
            onClick={() => {
              const newWeek = weekNumber + 1;
              setWeekNumber(newWeek);
              fetchRecords(newWeek);
            }}
            className={styles.nextButton}
          >
            下一周
            <span className="material-symbols-outlined" style={{fontSize: '18px', marginLeft: '4px'}}>arrow_forward</span>
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.title}>下午 3:15-3:30</div>
          <div className={styles.count}>{summary.session1.total}</div>
          <div className={styles.label}>人出席</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.title}>下午 4:30-4:45</div>
          <div className={styles.count}>{summary.session2.total}</div>
          <div className={styles.label}>人出席</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.title}>本周总人次</div>
          <div className={styles.count}>{summary.session1.total + summary.session2.total}</div>
          <div className={styles.label}>次出席</div>
        </div>
      </div>

      <div className={styles.section}>
        <h3><span className="material-symbols-outlined" style={{fontSize: '20px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>location_on</span>下午 3:15-3:30 点名记录</h3>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.col1}>学生姓名</div>
            <div className={styles.col2}>邮箱</div>
            <div className={styles.col3}>点名时间</div>
            <div className={styles.col4}>状态</div>
          </div>
          <div className={styles.tableBody}>
            {summary.session1.students.length > 0 ? (
              summary.session1.students.map((record) => (
                <div key={record.$id} className={styles.tableRow}>
                  <div className={styles.col1}>{record.studentName}</div>
                  <div className={styles.col2}>{record.studentEmail}</div>
                  <div className={styles.col3}>
                    {formatDate(record.checkInTime)} {formatTime(record.checkInTime)}
                  </div>
                  <div className={styles.col4}>
                    {updatingId === record.$id ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite', color: '#6e7681' }}>
                        sync
                      </span>
                    ) : (
                      <div className={styles.statusButtonGroup}>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'present')}
                          className={`${styles.statusBtn} ${styles.statusBtnPresent} ${record.status === 'present' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="出席"
                        >
                          出席
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'late')}
                          className={`${styles.statusBtn} ${styles.statusBtnLate} ${record.status === 'late' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="迟到"
                        >
                          迟到
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'absent')}
                          className={`${styles.statusBtn} ${styles.statusBtnAbsent} ${record.status === 'absent' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="缺席"
                        >
                          缺席
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>暂无点名记录</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3><span className="material-symbols-outlined" style={{fontSize: '20px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>location_on</span>下午 4:30-4:45 点名记录</h3>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.col1}>学生姓名</div>
            <div className={styles.col2}>邮箱</div>
            <div className={styles.col3}>点名时间</div>
            <div className={styles.col4}>状态</div>
          </div>
          <div className={styles.tableBody}>
            {summary.session2.students.length > 0 ? (
              summary.session2.students.map((record) => (
                <div key={record.$id} className={styles.tableRow}>
                  <div className={styles.col1}>{record.studentName}</div>
                  <div className={styles.col2}>{record.studentEmail}</div>
                  <div className={styles.col3}>
                    {formatDate(record.checkInTime)} {formatTime(record.checkInTime)}
                  </div>
                  <div className={styles.col4}>
                    {updatingId === record.$id ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite', color: '#6e7681' }}>
                        sync
                      </span>
                    ) : (
                      <div className={styles.statusButtonGroup}>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'present')}
                          className={`${styles.statusBtn} ${styles.statusBtnPresent} ${record.status === 'present' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="出席"
                        >
                          出席
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'late')}
                          className={`${styles.statusBtn} ${styles.statusBtnLate} ${record.status === 'late' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="迟到"
                        >
                          迟到
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'absent')}
                          className={`${styles.statusBtn} ${styles.statusBtnAbsent} ${record.status === 'absent' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="缺席"
                        >
                          缺席
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>暂无点名记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
