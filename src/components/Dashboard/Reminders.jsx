import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import styles from './Reminders.module.css';

const Reminders = () => {
  const [user] = useAuthState(auth);
  const [habits, setHabits] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Check for reminders
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const activeReminders = habits
        .filter(habit => {
          if (!habit.hasReminder || !habit.reminderTime) return false;
          
          const [hours, minutes] = habit.reminderTime.split(':');
          const reminderDate = new Date();
          reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          // Check if reminder time is within the current minute
          const timeDiff = Math.abs(now - reminderDate);
          return timeDiff < 60000; // Within 1 minute
        })
        .map(habit => ({
          id: habit.id,
          name: habit.name,
          time: habit.reminderTime
        }));

      setNotifications(activeReminders);
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [habits]);

  const handleUpdateReminder = async (habitId, newTime) => {
    try {
      await updateDoc(doc(db, 'habits', habitId), {
        reminderTime: newTime
      });
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleToggleReminder = async (habitId, hasReminder) => {
    try {
      await updateDoc(doc(db, 'habits', habitId), {
        hasReminder: !hasReminder
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  return (
    <div className={styles.reminders}>
      <h2>Reminders</h2>
      <p className={styles.description}>
        Set up reminders to help you stay consistent with your habits.
      </p>

      {notifications.length > 0 && (
        <div className={styles.notifications}>
          {notifications.map(notif => (
            <div key={notif.id} className={styles.notification}>
              🔔 <strong>{notif.name}</strong> - Time to complete your habit!
            </div>
          ))}
        </div>
      )}

      <div className={styles.remindersList}>
        {habits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No habits yet.</p>
            <p>Create habits first, then set up reminders for them.</p>
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} className={styles.reminderCard}>
              <div className={styles.reminderHeader}>
                <h3>{habit.name}</h3>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={habit.hasReminder}
                    onChange={() => handleToggleReminder(habit.id, habit.hasReminder)}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              
              {habit.hasReminder && (
                <div className={styles.reminderTime}>
                  <label>Reminder Time:</label>
                  <input
                    type="time"
                    value={habit.reminderTime || '09:00'}
                    onChange={(e) => handleUpdateReminder(habit.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.infoBox}>
        <h4>💡 How Reminders Work</h4>
        <ul>
          <li>Set a reminder time when creating or editing a habit</li>
          <li>You'll see notifications at the scheduled time</li>
          <li>Toggle reminders on/off for any habit</li>
          <li>Reminders help you build consistency</li>
        </ul>
      </div>
    </div>
  );
};

export default Reminders;

