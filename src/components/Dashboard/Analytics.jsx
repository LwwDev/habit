import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import styles from './Analytics.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [user] = useAuthState(auth);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);

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
      if (habitsData.length > 0 && !selectedHabit) {
        setSelectedHabit(habitsData[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, selectedHabit]);

  const getLast7DaysData = () => {
    const days = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      days.push(date.toISOString().split('T')[0]);
      labels.push(format(date, 'EEE'));
    }

    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return { labels, data: [] };

    const data = days.map(day => 
      habit.completedDates?.includes(day) ? 1 : 0
    );

    return { labels, data };
  };

  const getLast30DaysData = () => {
    const days = [];
    const labels = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      days.push(date.toISOString().split('T')[0]);
      if (i % 5 === 0 || i === 29) {
        labels.push(format(date, 'MMM d'));
      } else {
        labels.push('');
      }
    }

    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return { labels, data: [] };

    const data = days.map(day => 
      habit.completedDates?.includes(day) ? 1 : 0
    );

    return { labels, data };
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + (habit.completedDates?.length || 0), 0
    );
    const totalStreaks = habits.reduce((sum, habit) => 
      sum + (habit.currentStreak || 0), 0
    );
    const avgCompletionRate = habits.length > 0
      ? habits.reduce((sum, habit) => {
          const last30Days = [];
          for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
          }
          const completed = last30Days.filter(date => 
            habit.completedDates?.includes(date)
          ).length;
          return sum + (completed / 30) * 100;
        }, 0) / habits.length
      : 0;

    return { totalHabits, totalCompletions, totalStreaks, avgCompletionRate };
  };

  const getHabitDistribution = () => {
    const completed = habits.filter(h => 
      h.completedDates?.includes(new Date().toISOString().split('T')[0])
    ).length;
    const notCompleted = habits.length - completed;

    return {
      labels: ['Completed Today', 'Not Completed'],
      data: [completed, notCompleted]
    };
  };

  const last7Days = getLast7DaysData();
  const last30Days = getLast30DaysData();
  const stats = getOverallStats();
  const distribution = getHabitDistribution();

  const lineChartData = {
    labels: last7Days.labels,
    datasets: [
      {
        label: 'Completion',
        data: last7Days.data,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: last30Days.labels,
    datasets: [
      {
        label: 'Completed',
        data: last30Days.data,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgb(102, 126, 234)',
        borderWidth: 1
      }
    ]
  };

  const doughnutData = {
    labels: distribution.labels,
    datasets: [
      {
        data: distribution.data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(200, 200, 200, 0.8)'
        ],
        borderColor: [
          'rgb(102, 126, 234)',
          'rgb(200, 200, 200)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value === 1 ? 'Yes' : 'No';
          }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value === 1 ? '✓' : '';
          }
        }
      }
    }
  };

  return (
    <div className={styles.analytics}>
      <h2>Analytics Dashboard</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalHabits}</div>
            <div className={styles.statLabel}>Total Habits</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalCompletions}</div>
            <div className={styles.statLabel}>Total Completions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalStreaks}</div>
            <div className={styles.statLabel}>Total Streak Days</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{Math.round(stats.avgCompletionRate)}%</div>
            <div className={styles.statLabel}>Avg Completion Rate</div>
          </div>
        </div>
      </div>

      {habits.length > 0 && (
        <div className={styles.habitSelector}>
          <label>Select Habit:</label>
          <select
            value={selectedHabit || ''}
            onChange={(e) => setSelectedHabit(e.target.value)}
          >
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Last 7 Days</h3>
          <div className={styles.chartContainer}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Last 30 Days</h3>
          <div className={styles.chartContainer}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Today's Completion</h3>
          <div className={styles.chartContainer}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

