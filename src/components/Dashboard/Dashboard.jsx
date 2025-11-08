import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import HabitList from './HabitList';
import Analytics from './Analytics';
import Reminders from './Reminders';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('habits');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Habify</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        <button
          className={`${styles.navButton} ${activeTab === 'habits' ? styles.active : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          📋 Habits
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'reminders' ? styles.active : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          🔔 Reminders
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'habits' && <HabitList />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'reminders' && <Reminders />}
      </main>
    </div>
  );
};

export default Dashboard;

