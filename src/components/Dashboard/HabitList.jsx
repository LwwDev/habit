import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import HabitItem from './HabitItem';
import AddHabitForm from './AddHabitForm';
import styles from './HabitList.module.css';

const HabitList = () => {
  const [user] = useAuthState(auth);
  const [habits, setHabits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const handleAddHabit = async (habitData) => {
    try {
      await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleToggleComplete = async (habitId, date, isCompleted) => {
    try {
      const habitRef = doc(db, 'habits', habitId);
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) return;

      const dateStr = date.toISOString().split('T')[0];
      let completedDates = habit.completedDates || [];
      
      if (isCompleted) {
        if (!completedDates.includes(dateStr)) {
          completedDates.push(dateStr);
        }
      } else {
        completedDates = completedDates.filter(d => d !== dateStr);
      }

      // Calculate streaks
      const streaks = calculateStreaks(completedDates);
      
      await updateDoc(habitRef, {
        completedDates,
        currentStreak: streaks.current,
        longestStreak: Math.max(habit.longestStreak || 0, streaks.current)
      });
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const calculateStreaks = (completedDates) => {
    if (!completedDates || completedDates.length === 0) {
      return { current: 0 };
    }

    const sortedDates = [...completedDates]
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today or yesterday is completed
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sortedDates[0].toISOString().split('T')[0] === todayStr) {
      currentStreak = 1;
    } else if (sortedDates[0].toISOString().split('T')[0] === yesterdayStr) {
      currentStreak = 1;
    } else {
      return { current: 0 };
    }

    // Count consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { current: currentStreak };
  };

  return (
    <div className={styles.habitList}>
      <div className={styles.header}>
        <h2>My Habits</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.addButton}
        >
          {showAddForm ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {showAddForm && (
        <AddHabitForm 
          onAdd={handleAddHabit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {habits.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No habits yet. Start by adding your first habit!</p>
        </div>
      ) : (
        <div className={styles.habitsGrid}>
          {habits.map(habit => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitList;

