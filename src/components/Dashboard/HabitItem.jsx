import React, { useState } from 'react';
import { format, isToday, isYesterday, addDays, subDays } from 'date-fns';
import styles from './HabitItem.module.css';

const HabitItem = ({ habit, onToggleComplete, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCompletedToday = habit.completedDates?.includes(
    today.toISOString().split('T')[0]
  );

  const getCompletionRate = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push(date.toISOString().split('T')[0]);
    }

    const completed = last30Days.filter(date => 
      habit.completedDates.includes(date)
    ).length;

    return Math.round((completed / 30) * 100);
  };

  const handleToggle = () => {
    onToggleComplete(habit.id, today, !isCompletedToday);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(habit.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className={styles.habitCard}>
      <div className={styles.habitHeader}>
        <h3 className={styles.habitName}>{habit.name}</h3>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          title="Delete habit"
        >
          {showDeleteConfirm ? '✓' : '×'}
        </button>
      </div>

      {habit.description && (
        <p className={styles.habitDescription}>{habit.description}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Current Streak</span>
          <span className={styles.statValue}>🔥 {habit.currentStreak || 0} days</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Longest Streak</span>
          <span className={styles.statValue}>⭐ {habit.longestStreak || 0} days</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>30-Day Rate</span>
          <span className={styles.statValue}>{getCompletionRate()}%</span>
        </div>
      </div>

      <div className={styles.completionSection}>
        <button
          onClick={handleToggle}
          className={`${styles.completeButton} ${isCompletedToday ? styles.completed : ''}`}
        >
          {isCompletedToday ? '✓ Completed Today' : 'Mark as Complete'}
        </button>
      </div>

      {habit.hasReminder && habit.reminderTime && (
        <div className={styles.reminderBadge}>
          🔔 Reminder: {habit.reminderTime}
        </div>
      )}
    </div>
  );
};

export default HabitItem;

